import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Shield, CheckCircle2, XCircle, Info } from 'lucide-react';
import LiquidEther from '@/components/LiquidEther';

const Register = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  // Password validation function
  const validatePassword = (pwd: string, emailVal: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // 1. At least 7 characters
    if (pwd.length < 7) {
      errors.push('Password must be at least 7 characters long');
    }
    
    // 2. At least 3 special characters
    const specialChars = pwd.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
    if (!specialChars || specialChars.length < 3) {
      errors.push('Password must contain at least 3 special characters (!@#$%^&*()_+-=[]{};\':"|,.<>?)');
    }
    
    // 3. Not related to username (email prefix)
    const username = emailVal.split('@')[0].toLowerCase();
    const passwordLower = pwd.toLowerCase();
    
    // Check if password contains significant part of username (3+ chars)
    if (username.length >= 3) {
      for (let i = 0; i <= username.length - 3; i++) {
        const substring = username.substring(i, i + 3);
        if (passwordLower.includes(substring)) {
          errors.push('Password should not contain parts of your email username');
          break;
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Get password strength indicators
  const getPasswordRequirements = () => {
    const hasMinLength = password.length >= 7;
    const specialChars = password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
    const hasSpecialChars = specialChars && specialChars.length >= 3;
    
    const username = email.split('@')[0].toLowerCase();
    const passwordLower = password.toLowerCase();
    let isRelatedToUsername = false;
    
    if (username.length >= 3 && password.length >= 3) {
      for (let i = 0; i <= username.length - 3; i++) {
        const substring = username.substring(i, i + 3);
        if (passwordLower.includes(substring)) {
          isRelatedToUsername = true;
          break;
        }
      }
    }
    
    return {
      minLength: hasMinLength,
      specialChars: hasSpecialChars,
      notRelatedToUsername: !isRelatedToUsername && password.length > 0
    };
  };

  const requirements = getPasswordRequirements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const validation = validatePassword(password, email);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, phoneNumber);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* LiquidEther Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther 
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          className="w-full h-full"
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          autoDemo={true}
          autoSpeed={0.4}
          autoIntensity={1.8}
          mouseForce={25}
          cursorSize={120}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background/90 pointer-events-none"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-bold text-glow mb-2">CLUPSO</h1>
          </Link>
          <p className="text-muted-foreground">Create your secure vault</p>
        </div>

        <Card className="gradient-card border-primary/20 shadow-glow">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              All data is encrypted with AES-256
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {password && (
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      {requirements.minLength ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={requirements.minLength ? 'text-green-500' : 'text-muted-foreground'}>
                        At least 7 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {requirements.specialChars ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={requirements.specialChars ? 'text-green-500' : 'text-muted-foreground'}>
                        At least 3 special characters (!@#$%^&*...)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {requirements.notRelatedToUsername ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={requirements.notRelatedToUsername ? 'text-green-500' : 'text-muted-foreground'}>
                        Not related to your email username
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/20">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-sm text-muted-foreground ml-2">
                  <strong className="text-blue-500">Tip:</strong> Consider using words from your regional language (Hindi, Spanish, etc.) for added uniqueness and security!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary shadow-glow hover:shadow-intense"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
