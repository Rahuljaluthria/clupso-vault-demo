import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { KeyRound, Clock } from 'lucide-react';
import { generateOTP } from '@/lib/encryption';

const OTPVerify = () => {
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [loading, setLoading] = useState(false);
  const { user, setOtpVerified } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Generate OTP on mount
    const newOTP = generateOTP();
    setGeneratedOTP(newOTP);
    
    // In a real app, this would be sent via SMS/Email
    // For demo, we show it in console and toast
    console.log('🔐 Demo OTP:', newOTP);
    toast.info(`Demo OTP: ${newOTP} (Check console)`, {
      duration: 10000,
    });

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('OTP expired. Please login again.');
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (otp === generatedOTP) {
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
      navigate('/vault');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
    
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">CLUPSO</h1>
          <p className="text-muted-foreground">Two-Factor Authentication</p>
        </div>

        <Card className="gradient-card border-primary/20 shadow-glow">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 animate-pulse">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Verify OTP</CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit code to access your vault
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                  required
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Time remaining: {formatTime(timeLeft)}</span>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary shadow-glow hover:shadow-intense"
                disabled={loading || timeLeft === 0}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-center text-muted-foreground">
                <strong className="text-primary">Demo Mode:</strong> Check your browser console for the OTP
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OTPVerify;
