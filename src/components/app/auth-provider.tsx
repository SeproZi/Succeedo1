
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getAuth, isSignInWithEmailLink, onAuthStateChanged, sendSignInLinkToEmail, signInWithEmailLink, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isUserAuthorized } from '@/lib/user-service';
import { useToast } from '../ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  confirmationSent: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const processSignIn = async () => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                email = window.prompt('Please provide your email for confirmation');
            }
            if (email) {
                try {
                    await signInWithEmailLink(auth, email, window.location.href);
                    window.localStorage.removeItem('emailForSignIn');
                } catch (err: any) {
                    setError(err.message);
                    toast({ title: "Sign-in Error", description: err.message, variant: "destructive" });
                }
            } else {
                 setError("Email is required to complete sign-in.");
                 toast({ title: "Sign-in Error", description: "Email is required.", variant: "destructive" });
            }
        }
    };

    processSignIn();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const signInWithEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    setConfirmationSent(false);
    try {
        const authorized = await isUserAuthorized(email);
        if (!authorized) {
            setError('Your email is not authorized to access this application.');
            setLoading(false);
            return;
        }

        const actionCodeSettings = {
            url: window.location.origin,
            handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        setConfirmationSent(true);

    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    confirmationSent,
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
