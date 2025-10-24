import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Lock, Shield } from 'lucide-react';
import LiquidEther from '@/components/LiquidEther';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(email, password, requiresTotp ? totpCode : undefined);
      
      if (result && result.requireTotp) {
        setRequiresTotp(true);
        toast.info('Please enter your Google Authenticator code');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      setRequiresTotp(false);
      setTotpCode('');
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
          <p className="text-muted-foreground">Access your secure vault</p>
        </div>

        <Card className="gradient-card border-primary/20 shadow-glow">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                {requiresTotp ? (
                  <Shield className="w-8 h-8 text-primary" />
                ) : (
                  <Lock className="w-8 h-8 text-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {requiresTotp ? 'Two-Factor Authentication' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-center">
              {requiresTotp 
                ? 'Enter the 6-digit code from Google Authenticator'
                : 'Enter your credentials to access your vault'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!requiresTotp ? (
                <>
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
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="totpCode">Authenticator Code</Label>
                  <Input
                    id="totpCode"
                    type="text"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono"
                    autoFocus
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRequiresTotp(false);
                      setTotpCode('');
                    }}
                    className="w-full"
                  >
                    ← Back to login
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary shadow-glow hover:shadow-intense"
                disabled={loading || (requiresTotp && totpCode.length !== 6)}
              >
                {loading ? 'Signing In...' : requiresTotp ? 'Verify Code' : 'Sign In'}
              </Button>
            </form>

            {!requiresTotp && (
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:underline">
                  Sign Up
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
