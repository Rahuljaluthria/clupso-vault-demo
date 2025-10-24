import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const API_URL = 'https://clupso-backend.onrender.com/api';

interface ActivityEntry {
  _id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { token } = useAuth();

  const loadActivities = useCallback(async () => {
    // Get token from localStorage as fallback
    const authToken = token || localStorage.getItem('auth_token');
    
    if (!authToken) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }

    try {
      setError('');
      const response = await fetch(`${API_URL}/vault/activity`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading activities:', error);
      setError(error instanceof Error ? error.message : 'Failed to load activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

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

      {error && (
        <Card className="gradient-card p-8 text-center border-destructive">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!error && activities.length === 0 ? (
        <Card className="gradient-card p-8 text-center">
          <p className="text-muted-foreground">No activity recorded yet</p>
        </Card>
      ) : !error && (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity._id}
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
                        {activity.details}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Recently'}
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
