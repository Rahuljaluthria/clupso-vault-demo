import { useEffect, useState, ReactNode } from 'react';
import { User, Session, supabase } from '@/lib/mongodb-client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContext } from './AuthContextTypes';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setOtpVerified(true);
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, phoneNumber: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone_number: phoneNumber,
        },
      },
    });

    if (error) throw new Error(error);
    
    toast.success('Account created successfully!');
    navigate('/login');
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (error) throw new Error(error);
    
    // Set the user and session
    if (data) {
      setUser(data.user);
      setSession({ user: data.user, access_token: data.token });
      setOtpVerified(true);
      toast.success('Signed in successfully!');
      navigate('/vault');
    }
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
        loading,
        signUp,
        signIn,
        signOut,
        otpVerified,
        setOtpVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
