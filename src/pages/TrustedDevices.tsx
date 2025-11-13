import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Smartphone, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getDeviceFingerprint } from '@/lib/fingerprint';

interface TrustedDevice {
  deviceId: string;
  browser: string;
  os: string;
  addedAt: string;
  trustedUntil: string;
}

const TrustedDevices = () => {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDevices();
    getCurrentDevice();
  }, []);

  const getCurrentDevice = async () => {
    const deviceInfo = await getDeviceFingerprint();
    setCurrentDeviceId(deviceInfo.deviceId);
  };

  const loadDevices = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://clupso-backend.onrender.com/api/auth/trusted-devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load devices');
      }

      const data = await response.json();
      setDevices(data);
    } catch (error) {
      toast.error('Failed to load trusted devices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const revokeDevice = async (deviceId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://clupso-backend.onrender.com/api/auth/trusted-devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentDeviceId })
      });

      if (!response.ok) {
        throw new Error('Failed to revoke device');
      }

      const data = await response.json();

      toast.success('Device revoked successfully');
      
      // If current device was revoked, log out immediately
      if (data.wasCurrentDevice || deviceId === currentDeviceId) {
        localStorage.removeItem('auth_token');
        toast.info('You have been logged out as this device was revoked');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        loadDevices();
      }
    } catch (error) {
      toast.error('Failed to revoke device');
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpiringSoon = (trustedUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(trustedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/vault')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vault
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-glow mb-2">Trusted Devices</h1>
          <p className="text-muted-foreground">
            Manage devices that can access your CLUPSO Vault
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {devices.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No trusted devices found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            devices.map((device) => {
              const isCurrentDevice = device.deviceId === currentDeviceId;
              const expiringSoon = isExpiringSoon(device.trustedUntil);

              return (
                <Card 
                  key={device.deviceId} 
                  className={`border-primary/20 ${isCurrentDevice ? 'bg-primary/5 border-primary/40' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {device.os.includes('Windows') || device.os.includes('Mac') || device.os.includes('Linux') ? (
                          <Monitor className="w-8 h-8 text-primary" />
                        ) : (
                          <Smartphone className="w-8 h-8 text-primary" />
                        )}
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {device.browser} on {device.os}
                            {isCurrentDevice && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                Current Device
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription>
                            Added: {formatDate(device.addedAt)}
                          </CardDescription>
                        </div>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Revoke
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Device Access?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {isCurrentDevice ? (
                                <>
                                  ⚠️ <strong>Warning:</strong> You are about to revoke access for your current device. 
                                  You will be logged out immediately and will need to approve this device again via email to regain access.
                                </>
                              ) : (
                                <>
                                  This device will no longer be able to access your vault without email approval.
                                  This action cannot be undone.
                                </>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => revokeDevice(device.deviceId)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Revoke Access
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-muted-foreground">Expires: </span>
                        <span className={expiringSoon ? 'text-red-500 font-semibold' : ''}>
                          {formatDate(device.trustedUntil)}
                          {expiringSoon && ' (Expiring soon!)'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Device ID: {device.deviceId.substring(0, 8)}...
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-4 bg-muted/50 rounded-lg"
        >
          <h3 className="font-semibold mb-2">🔒 Security Information</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Trusted devices are valid for 5 days from approval</li>
            <li>• You'll receive an email when logging in from a new device</li>
            <li>• Approval links expire after 10 minutes for security</li>
            <li>• Revoking a device requires re-approval via email</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default TrustedDevices;
