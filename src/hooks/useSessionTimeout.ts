import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SESSION_TIMEOUT = 7 * 60 * 1000; // 7 minutes in milliseconds

export const useSessionTimeout = (isAuthenticated: boolean) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    toast.error('Session expired for security reasons');
    navigate('/login');
  }, [navigate]);

  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Reset timeout on user activity
    const handleActivity = () => {
      resetTimeout();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, resetTimeout]);

  return { resetTimeout };
};
