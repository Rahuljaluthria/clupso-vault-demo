import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity as ActivityIcon } from 'lucide-react';
import ActivityLog from '@/components/vault/ActivityLog';

const Activity = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
          
          <div className="flex items-center gap-3 mb-2">
            <ActivityIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-glow">Account Activity</h1>
          </div>
          <p className="text-muted-foreground">
            View all activities on your account including logins, password changes, and security events
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ActivityLog />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-4 bg-muted/50 rounded-lg"
        >
          <h3 className="font-semibold mb-2">🔒 Security Information</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Activities are logged with IP address and device information</li>
            <li>• Failed login attempts are tracked for security monitoring</li>
            <li>• Review this log regularly to detect unauthorized access</li>
            <li>• If you see suspicious activity, change your password immediately</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Activity;
