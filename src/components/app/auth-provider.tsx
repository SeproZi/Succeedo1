
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailLink, sendSignInLinkToEmail, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useOkrStore } from '@/hooks/use-okr-store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  signInWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { initData, clearData } = useOkrStore();

  const handleSignInCompletion = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (auth.isSignInWithEmailLink(window.location.href)) {
        let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        if (!email) {
            setError("Email is required to complete sign-in.");
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
            // onAuthStateChanged will handle the user state update and data loading
        } catch (err: any) {
            setError(err.message);
            toast({ title: "Sign-in Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }
  }, [toast]);

  useEffect(() => {
    handleSignInCompletion();
  }, [handleSignInCompletion]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setUser(user);
            await initData();
        } else {
            setUser(null);
            clearData();
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [initData, clearData]);


  const signInWithEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
    };

    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
        setSuccessMessage(`A sign-in link has been sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
        setError(err.message);
        toast({ title: "Sign-in Error", description: err.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    error,
    successMessage,
    signInWithEmail,
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
