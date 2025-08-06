
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useOkrStore } from '@/hooks/use-okr-store';
import { checkUser } from '@/ai/flows/check-user';

interface AuthContextType {
  authorizedEmail: string | null; 
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTHORIZED_EMAIL_KEY = 'authorizedEmail';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authorizedEmail, setAuthorizedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { initData, clearData, data } = useOkrStore();

  useEffect(() => {
    const storedEmail = localStorage.getItem(AUTHORIZED_EMAIL_KEY);
    if (storedEmail) {
      setAuthorizedEmail(storedEmail);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authorizedEmail && data.departments.length === 0) {
      initData();
    }
  }, [authorizedEmail, initData, data.departments.length]);


  const loginWithEmail = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
        const response = await checkUser({ email: email.toLowerCase() });

        if (!response.isAuthorized) {
            setError("Your email is not authorized to access this application.");
        } else {
            setAuthorizedEmail(email);
            localStorage.setItem(AUTHORIZED_EMAIL_KEY, email);
            // initData will be called by the useEffect above
        }
    } catch (err: any) {
        console.error(err);
        setError("An error occurred during login: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTHORIZED_EMAIL_KEY);
    setAuthorizedEmail(null);
    clearData();
  };

  const value = {
    authorizedEmail,
    loading,
    error,
    loginWithEmail,
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
