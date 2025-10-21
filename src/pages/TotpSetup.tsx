import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const API_URL = 'https://clupso-backend.onrender.com/api';

export default function TotpSetup() {
  const { token, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if TOTP is already enabled
    if (user?.totpEnabled) {
      navigate('/vault');
      return;
    }

    // Generate TOTP secret and QR code
    setupTotp();
  }, [token, user, navigate]);

  const setupTotp = async () => {
    try {
      setSetupLoading(true);
      const response = await fetch(`${API_URL}/auth/totp/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup TOTP');
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup TOTP');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/totp/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      setSuccess('Google Authenticator enabled successfully!');
      await refreshUser();
      
      setTimeout(() => {
        navigate('/vault');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/vault');
  };

  if (setupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">Setting up authenticator...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Setup Google Authenticator</CardTitle>
          <CardDescription>
            Secure your account with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <p className="font-semibold">Step 1: Download Google Authenticator</p>
              <p className="text-muted-foreground">
                Install the Google Authenticator app from your app store if you haven't already.
              </p>
            </div>

            <div className="text-sm space-y-2">
              <p className="font-semibold">Step 2: Scan QR Code</p>
              <p className="text-muted-foreground">
                Open Google Authenticator and scan this QR code:
              </p>
              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Or enter this code manually: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
              </p>
            </div>

            <div className="text-sm space-y-2">
              <p className="font-semibold">Step 3: Enter Verification Code</p>
              <p className="text-muted-foreground">
                Enter the 6-digit code from Google Authenticator:
              </p>
              <form onSubmit={handleVerify} className="space-y-4">
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={loading}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    disabled={loading}
                  >
                    Skip for now
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
