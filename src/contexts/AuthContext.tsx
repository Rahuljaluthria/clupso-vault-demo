import { useEffect, useState, ReactNode } from 'react';
import { User, Session, supabase } from '@/lib/mongodb-client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContext } from './AuthContextTypes';
import { getDeviceFingerprint } from '@/lib/fingerprint';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

const API_URL = 'https://clupso-backend.onrender.com/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  // Initialize session timeout hook
  useSessionTimeout(!!token);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          // Fetch user data
          const response = await fetch(`${API_URL}/auth/user`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser({
              id: userData.id,
              email: userData.email,
              phone_number: userData.phoneNumber,
              email_verified: true,
              totpEnabled: userData.totpEnabled
            });
            setSession({ access_token: storedToken, user: userData });
            setOtpVerified(true);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('auth_token');
            setToken(null);
          }
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.id,
          email: userData.email,
          phone_number: userData.phoneNumber,
          email_verified: true,
          totpEnabled: userData.totpEnabled
        });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const signUp = async (email: string, password: string, phoneNumber: string) => {
    try {
      // Get device fingerprint
      const deviceInfo = await getDeviceFingerprint();
      
      console.log('Device info for signup:', deviceInfo); // Debug log
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password, 
          phoneNumber,
          ...deviceInfo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string, totpCode?: string) => {
    // Get device fingerprint
    const deviceInfo = await getDeviceFingerprint();
    
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email, 
        password, 
        totpCode,
        ...deviceInfo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Check if device requires approval
      if (data.requiresApproval) {
        toast.error(data.message || 'Device approval required. Please check your email.', {
          duration: 10000
        });
        throw new Error(data.message || 'Device approval required');
      }
      throw new Error(data.error || 'Sign in failed');
    }

    // Check if TOTP is required
    if (data.requireTotp) {
      return { requireTotp: true };
    }

    // Successful login
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser({
        id: data.user.id,
        email: data.user.email,
        phone_number: data.user.phoneNumber,
        email_verified: true,
        totpEnabled: data.user.totpEnabled
      });
      setSession({ access_token: data.token, user: data.user });
      setOtpVerified(true);
      toast.success('Signed in successfully!');
      
      // If TOTP is not enabled, redirect to setup
      if (!data.user.totpEnabled) {
        navigate('/totp-setup');
      } else {
        navigate('/vault');
      }
    }

    return { requireTotp: false };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setOtpVerified(false);
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
        otpVerified,
        setOtpVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
