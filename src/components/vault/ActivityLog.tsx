import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityEntry {
  id: string;
  action: string;
  details: {
    email?: string;
    directory_name?: string;
    credential_name?: string;
    [key: string]: string | number | boolean | undefined;
  };
  created_at: string;
}

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadActivities = useCallback(async () => {
    if (!user) return;

    try {
      // For now, use mock data until backend API is ready
      const mockActivities = [
        {
          id: '1',
          action: 'User signed in',
          created_at: new Date().toISOString(),
          details: { email: user.email }
        },
        {
          id: '2', 
          action: 'Vault accessed',
          created_at: new Date(Date.now() - 60000).toISOString(),
          details: {}
        }
      ];
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Activity Log</h2>
      </div>

      {activities.length === 0 ? (
        <Card className="gradient-card p-8 text-center">
          <p className="text-muted-foreground">No activity recorded yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="gradient-card border-border p-4 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-glow"></div>
                      <h3 className="font-semibold">{activity.action}</h3>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-muted-foreground">
                        {activity.details.directory_name && `Directory: ${activity.details.directory_name}`}
                        {activity.details.credential_name && `Credential: ${activity.details.credential_name}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
