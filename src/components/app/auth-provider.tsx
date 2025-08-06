
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import useOkrStore from '@/hooks/use-okr-store';
import { User, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { checkUser } from '@/ai/flows/check-user';

interface AuthContextType {
  authorizedUser: User | null; 
  loading: boolean;
  error: string | null;
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authorizedUser, setAuthorizedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { initData, clearData, data } = useOkrStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setAuthorizedUser(user);
      if (user) {
        if (data.departments.length === 0 && data.teams.length === 0 && data.okrs.length === 0) {
          await initData();
        }
      } else {
        clearData();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUpWithEmailPassword = async (email: string, password:string) => {
    setLoading(true);
    setError(null);
    try {
      const { authorized } = await checkUser(email);
      if (!authorized) {
        throw new Error('Email address not authorized for sign-up.');
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      setAuthorizedUser(user);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use. Please sign in instead.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      setAuthorizedUser(user);
    } catch (err: any)      {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
      return sendPasswordResetEmail(auth, email);
  }

  const logout = async () => {
    await auth.signOut();
  };

  const value = {
    authorizedUser,
    loading,
    error,
    signUpWithEmailPassword,
    loginWithEmailPassword,
    sendPasswordReset,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

    