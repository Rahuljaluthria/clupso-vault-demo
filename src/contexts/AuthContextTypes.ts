import { createContext } from 'react';
import { User, Session } from '@/lib/mongodb-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, phoneNumber: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  otpVerified: boolean;
  setOtpVerified: (verified: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);