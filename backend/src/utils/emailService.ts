import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

// Sender email from MailerSend
const sentFrom = new Sender(
  process.env.MAILERSEND_FROM_EMAIL || 'noreply@trial.mailersend.net',
  'CLUPSO Vault'
);

// Send device approval email
export const sendDeviceApprovalEmail = async (
  email: string,
  token: string,
  deviceInfo: { browser: string; os: string }
): Promise<void> => {
  const approvalLink = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/approve-device?token=${token}`;
  
  const recipients = [new Recipient(email)];
  
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('CLUPSO Vault - New Device Login Approval')
    .setHtml(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #5227FF 0%, #FF9FFC 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; }
            .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
            .content { background: #f9f9f9; padding: 40px 30px; }
            .content p { margin: 0 0 15px; font-size: 16px; }
            .device-info { background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #5227FF; }
            .device-info p { margin: 5px 0; font-size: 15px; }
            .device-info strong { color: #5227FF; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 15px 40px; background: #5227FF; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
            .button:hover { background: #4119dd; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 25px 0; }
            .warning p { margin: 5px 0; font-size: 14px; color: #856404; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 13px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 CLUPSO Vault</h1>
              <p>Device Approval Required</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>A login attempt was made to your CLUPSO Vault account from a new device. For your security, we need you to approve this device before access is granted.</p>
              
              <div class="device-info">
                <p><strong>Browser:</strong> ${deviceInfo.browser}</p>
                <p><strong>Operating System:</strong> ${deviceInfo.os}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>If this was you, click the button below to approve this device:</p>
              
              <div class="button-container">
                <a href="${approvalLink}" class="button">Approve This Device</a>
              </div>
              
              <div class="warning">
                <p><strong>⚠️ Important:</strong></p>
                <p>• This approval link will expire in 10 minutes</p>
                <p>• If you didn't attempt to log in, please ignore this email and consider changing your password</p>
                <p>• Once approved, this device will be trusted for 5 days</p>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #5227FF; font-size: 13px;">${approvalLink}</p>
            </div>
            <div class="footer">
              <p><strong>CLUPSO Vault</strong></p>
              <p>Secure Password Management</p>
              <p style="margin-top: 10px;">This is an automated security notification. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `);

  await mailerSend.email.send(emailParams);
};

// Send device revoked email
export const sendDeviceRevokedEmail = async (
  email: string,
  deviceInfo: { browser: string; os: string }
): Promise<void> => {
  const recipients = [new Recipient(email)];
  
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('CLUPSO Vault - Device Removed')
    .setHtml(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff9f9f 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; }
            .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
            .content { background: #f9f9f9; padding: 40px 30px; }
            .content p { margin: 0 0 15px; font-size: 16px; }
            .device-info { background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ff6b6b; }
            .device-info p { margin: 5px 0; font-size: 15px; }
            .device-info strong { color: #ff6b6b; }
            .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; border-radius: 5px; margin: 25px 0; }
            .info p { margin: 5px 0; font-size: 14px; color: #0c5460; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 13px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 CLUPSO Vault</h1>
              <p>Device Removed</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>A trusted device has been removed from your CLUPSO Vault account.</p>
              
              <div class="device-info">
                <p><strong>Browser:</strong> ${deviceInfo.browser}</p>
                <p><strong>Operating System:</strong> ${deviceInfo.os}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="info">
                <p><strong>ℹ️ What this means:</strong></p>
                <p>• This device will no longer be automatically trusted</p>
                <p>• You'll need to approve it again if you log in from this device</p>
                <p>• If you didn't remove this device, please change your password immediately</p>
              </div>
              
              <p>If you have any concerns about your account security, please take action immediately.</p>
            </div>
            <div class="footer">
              <p><strong>CLUPSO Vault</strong></p>
              <p>Secure Password Management</p>
              <p style="margin-top: 10px;">This is an automated security notification. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `);

  await mailerSend.email.send(emailParams);
};
