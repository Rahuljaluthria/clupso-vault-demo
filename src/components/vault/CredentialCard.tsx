import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { decryptPassword } from '@/lib/encryption';
import type { Credential } from '@/pages/Vault';

interface CredentialCardProps {
  credential: Credential;
  onUpdate: () => void;
}

const CredentialCard = ({ credential, onUpdate }: CredentialCardProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');

  const handleTogglePassword = () => {
    if (!showPassword) {
      const decrypted = decryptPassword(credential.encrypted_password);
      setDecryptedPassword(decrypted);
    }
    setShowPassword(!showPassword);
  };

  const handleCopyPassword = async () => {
    const password = decryptPassword(credential.encrypted_password);
    await navigator.clipboard.writeText(password);
    toast.success('Password copied to clipboard');
  };

  const handleCopyUsername = async () => {
    await navigator.clipboard.writeText(credential.username);
    toast.success('Username copied to clipboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="gradient-card border-border p-6 hover:border-primary/50 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg mb-1">{credential.name}</h3>
              {credential.url && (
                <a
                  href={credential.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Visit Site
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Username</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyUsername}
                  className="h-6 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm font-mono bg-muted p-2 rounded">{credential.username}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Password</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleTogglePassword}
                    className="h-6 px-2"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPassword}
                    className="h-6 px-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {showPassword ? decryptedPassword : '••••••••••'}
              </p>
            </div>
          </div>

          {credential.notes && (
            <div>
              <span className="text-xs text-muted-foreground">Notes</span>
              <p className="text-sm mt-1">{credential.notes}</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default CredentialCard;
