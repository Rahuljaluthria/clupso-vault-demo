import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { User, ActivityLog } from '../models';
import { authenticateToken } from '../middleware/auth';
import { sendDeviceApprovalEmail, sendDeviceRevokedEmail } from '../utils/emailService';
import { logActivity } from '../utils/activityLogger';

const router = express.Router();

// Register new user
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, phoneNumber, deviceId, browser, os } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (!deviceId) {
      res.status(400).json({ error: 'Device fingerprint is required' });
      return;
    }

    // Password validation
    // 1. At least 7 characters
    if (password.length < 7) {
      res.status(400).json({ error: 'Password must be at least 7 characters long' });
      return;
    }

    // 2. At least 3 special characters
    const specialChars = password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
    if (!specialChars || specialChars.length < 3) {
      res.status(400).json({ error: 'Password must contain at least 3 special characters' });
      return;
    }

    // 3. Not related to username (email prefix)
    const username = email.split('@')[0].toLowerCase();
    const passwordLower = password.toLowerCase();
    
    if (username.length >= 3) {
      for (let i = 0; i <= username.length - 3; i++) {
        const substring = username.substring(i, i + 3);
        if (passwordLower.includes(substring)) {
          res.status(400).json({ error: 'Password should not contain parts of your email username' });
          return;
        }
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Create new user with first trusted device
    const trustedUntil = new Date();
    trustedUntil.setDate(trustedUntil.getDate() + 5); // 5 days validity

    const user = new User({ 
      email, 
      password, 
      phoneNumber,
      trustedDevices: [{
        deviceId,
        browser: browser || 'Unknown',
        os: os || 'Unknown',
        addedAt: new Date(),
        trustedUntil
      }]
    });
    await user.save();

    // Generate JWT token with 7-minute expiry
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const token = jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: '7m' });

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'Account Created',
      details: `New account created successfully`,
      req,
      success: true,
      deviceId,
      browser: browser || 'Unknown',
      os: os || 'Unknown'
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
});

// Login user
router.post('/signin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, totpCode, deviceId, browser, os } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (!deviceId) {
      res.status(400).json({ error: 'Device fingerprint is required' });
      return;
    }

    const user = await User.findOne({ email }).select('+totpSecret');
    if (!user || !(await user.comparePassword(password))) {
      // Log failed login attempt
      if (user) {
        await logActivity({
          userId: user._id,
          action: 'Failed Login Attempt',
          details: 'Invalid password entered',
          req,
          success: false,
          deviceId,
          browser: browser || 'Unknown',
          os: os || 'Unknown'
        });
      }
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if device is trusted and not expired
    const trustedDevice = user.trustedDevices.find(
      (device) => device.deviceId === deviceId && new Date(device.trustedUntil) > new Date()
    );

    if (!trustedDevice) {
      // Device is not trusted or expired - require email approval
      const approvalToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10-minute expiry

      user.pendingDevice = {
        deviceId,
        token: approvalToken,
        browser: browser || 'Unknown',
        os: os || 'Unknown',
        expiresAt
      };
      await user.save();

      // Generate approval URL
      const approvalUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/approve-device?token=${approvalToken}`;
      
      // Log the approval URL for debugging
      console.log('\n==============================================');
      console.log('🔐 DEVICE APPROVAL REQUIRED');
      console.log('==============================================');
      console.log('User:', user.email);
      console.log('Device ID:', deviceId);
      console.log('Browser:', browser || 'Unknown');
      console.log('OS:', os || 'Unknown');
      console.log('\n📎 Approval Link:');
      console.log(approvalUrl);
      console.log('==============================================\n');

      // Send approval email
      let emailSent = false;
      try {
        await sendDeviceApprovalEmail(user.email, approvalToken, {
          browser: browser || 'Unknown',
          os: os || 'Unknown'
        });
        emailSent = true;
        console.log('✅ Device approval email sent to:', user.email);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        console.log('⚠️  User can use the approval link from logs above');
      }

      res.status(403).json({ 
        error: 'Device not recognized',
        message: emailSent 
          ? 'An approval email has been sent to your registered email address. Please check your inbox.'
          : 'Device approval required. Please check your email or contact support.',
        requiresApproval: true
      });
      return;
    }

    // Check if TOTP is enabled
    if (user.totpEnabled) {
      if (!totpCode) {
        // Password correct but need TOTP code
        res.status(200).json({ 
          requireTotp: true,
          message: 'TOTP code required'
        });
        return;
      }

      // Verify TOTP code
      const verified = speakeasy.totp.verify({
        secret: user.totpSecret!,
        encoding: 'base32',
        token: totpCode,
        window: 2 // Allow 2 time steps before/after for clock drift
      });

      if (!verified) {
        // Log failed TOTP attempt
        await logActivity({
          userId: user._id,
          action: 'Failed 2FA Verification',
          details: 'Invalid TOTP code entered',
          req,
          success: false,
          deviceId,
          browser: browser || 'Unknown',
          os: os || 'Unknown'
        });
        res.status(401).json({ error: 'Invalid TOTP code' });
        return;
      }
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    // Generate token with 7-minute expiry
    const token = jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: '7m' });

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'Login Successful',
      details: `Logged in successfully`,
      req,
      success: true,
      deviceId,
      browser: browser || 'Unknown',
      os: os || 'Unknown'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        totpEnabled: user.totpEnabled
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/user', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    res.json({
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      totpEnabled: user.totpEnabled
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, browser, os } = req.body;
    
    // Log logout activity
    await logActivity({
      userId: req.user!._id,
      action: 'Logout',
      details: 'User logged out',
      req,
      success: true,
      deviceId,
      browser,
      os
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Setup TOTP - Generate secret and QR code
router.post('/totp/setup', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `CLUPSO Vault (${user.email})`,
      issuer: 'CLUPSO'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Save secret to user (but don't enable yet)
    await User.findByIdAndUpdate(user._id, {
      totpSecret: secret.base32
    });

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan this QR code with Google Authenticator'
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    res.status(500).json({ error: 'Failed to setup TOTP' });
  }
});

// Verify TOTP and enable it
router.post('/totp/verify', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('+totpSecret');
    const { code } = req.body;

    if (!user || !user.totpSecret) {
      res.status(400).json({ error: 'TOTP not set up. Call /totp/setup first' });
      return;
    }

    if (!code) {
      res.status(400).json({ error: 'TOTP code is required' });
      return;
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      res.status(401).json({ error: 'Invalid TOTP code' });
      return;
    }

    // Enable TOTP for this user
    await User.findByIdAndUpdate(user._id, { totpEnabled: true });

    res.json({
      message: 'TOTP enabled successfully',
      totpEnabled: true
    });
  } catch (error) {
    console.error('TOTP verify error:', error);
    res.status(500).json({ error: 'Failed to verify TOTP' });
  }
});

// Disable TOTP
router.post('/totp/disable', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user!._id).select('+totpSecret');

    if (!user || !user.totpEnabled) {
      res.status(400).json({ error: 'TOTP is not enabled' });
      return;
    }

    if (!code) {
      res.status(400).json({ error: 'TOTP code is required to disable' });
      return;
    }

    // Verify the code before disabling
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret!,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      res.status(401).json({ error: 'Invalid TOTP code' });
      return;
    }

    // Disable TOTP
    await User.findByIdAndUpdate(user._id, {
      totpEnabled: false,
      totpSecret: undefined
    });

    res.json({
      message: 'TOTP disabled successfully',
      totpEnabled: false
    });
  } catch (error) {
    console.error('TOTP disable error:', error);
    res.status(500).json({ error: 'Failed to disable TOTP' });
  }
});

// Forgot password - Step 1: Verify email and check if TOTP is enabled
router.post('/forgot-password/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    
    // Don't reveal if user exists or not for security
    if (!user) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    // Check if TOTP is enabled
    if (!user.totpEnabled) {
      res.status(400).json({ 
        error: 'Two-factor authentication is not enabled for this account',
        totpEnabled: false 
      });
      return;
    }

    res.json({ 
      message: 'Email verified. Please provide your authenticator code.',
      totpEnabled: true
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Forgot password - Step 2: Verify TOTP code and generate reset token
router.post('/forgot-password/verify-totp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, totpCode } = req.body;

    if (!email || !totpCode) {
      res.status(400).json({ error: 'Email and authenticator code are required' });
      return;
    }

    const user = await User.findOne({ email }).select('+totpSecret');
    
    if (!user || !user.totpEnabled || !user.totpSecret) {
      res.status(404).json({ error: 'Account not found or TOTP not enabled' });
      return;
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 2
    });

    if (!verified) {
      res.status(401).json({ error: 'Invalid authenticator code' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token and expiry (15 minutes from now)
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 900000) // 15 minutes
    });

    res.json({ 
      message: 'Authenticator code verified',
      resetToken
    });
  } catch (error) {
    console.error('Verify TOTP error:', error);
    res.status(500).json({ error: 'Failed to verify authenticator code' });
  }
});

// Forgot password - Step 3: Reset password with token
router.post('/forgot-password/reset', async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      res.status(400).json({ error: 'Reset token and new password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log password reset activity
    await logActivity({
      userId: user._id,
      action: 'Password Changed',
      details: 'Password was reset using Google Authenticator verification',
      req,
      success: true
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Approve device via email link
router.get('/approve-device', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).send('<h1>Invalid approval link</h1>');
      return;
    }

    // Find user with pending device
    const user = await User.findOne({
      'pendingDevice.token': token,
      'pendingDevice.expiresAt': { $gt: new Date() }
    });

    if (!user || !user.pendingDevice) {
      res.status(400).send('<h1>Approval link expired or invalid</h1><p>Please try logging in again.</p>');
      return;
    }

    // Add device to trusted devices
    const trustedUntil = new Date();
    trustedUntil.setDate(trustedUntil.getDate() + 5); // 5 days validity

    user.trustedDevices.push({
      deviceId: user.pendingDevice.deviceId,
      browser: user.pendingDevice.browser,
      os: user.pendingDevice.os,
      addedAt: new Date(),
      trustedUntil
    });

    const approvedDeviceInfo = {
      deviceId: user.pendingDevice.deviceId,
      browser: user.pendingDevice.browser,
      os: user.pendingDevice.os
    };

    // Clear pending device
    user.pendingDevice = undefined;
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'Device Approved',
      details: `New device approved and added to trusted devices`,
      req,
      success: true,
      deviceId: approvedDeviceInfo.deviceId,
      browser: approvedDeviceInfo.browser,
      os: approvedDeviceInfo.os
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #5227FF 0%, #FF9FFC 100%); }
            .card { background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 400px; }
            h1 { color: #5227FF; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Device Approved!</h1>
            <p>Your device has been successfully approved and added to your trusted devices.</p>
            <p>You can now close this window and log in to CLUPSO Vault.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Approve device error:', error);
    res.status(500).send('<h1>Server Error</h1>');
  }
});

// Get trusted devices
router.get('/trusted-devices', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Filter out expired devices
    const activeTrustedDevices = user.trustedDevices.filter(
      (device) => new Date(device.trustedUntil) > new Date()
    );

    res.json(activeTrustedDevices);
  } catch (error) {
    console.error('Get trusted devices error:', error);
    res.status(500).json({ error: 'Failed to fetch trusted devices' });
  }
});

// Revoke trusted device
router.delete('/trusted-devices/:deviceId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const user = await User.findById(req.user!._id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const deviceToRevoke = user.trustedDevices.find(d => d.deviceId === deviceId);
    
    if (!deviceToRevoke) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    // Remove device from trusted list
    user.trustedDevices = user.trustedDevices.filter(d => d.deviceId !== deviceId);
    await user.save();

    // Send notification email
    try {
      await sendDeviceRevokedEmail(user.email, {
        browser: deviceToRevoke.browser,
        os: deviceToRevoke.os
      });
      console.log('✅ Device revoked email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
    }

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'Device Revoked',
      details: `Trusted device was removed`,
      req,
      success: true,
      deviceId: deviceToRevoke.deviceId,
      browser: deviceToRevoke.browser,
      os: deviceToRevoke.os
    });

    console.log(`✅ Device revoked for user ${user.email}: ${deviceToRevoke.browser} on ${deviceToRevoke.os}`);

    res.json({ 
      message: 'Device revoked successfully',
      wasCurrentDevice: deviceToRevoke.deviceId === req.body.currentDeviceId
    });
  } catch (error) {
    console.error('Revoke device error:', error);
    res.status(500).json({ error: 'Failed to revoke device' });
  }
});

export default router;