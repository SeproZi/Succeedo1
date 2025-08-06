
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useOkrStore } from '@/hooks/use-okr-store';
import { Auth, User, getAuth, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
import { auth, actionCodeSettings } from '@/lib/firebase';
import { checkUser } from '@/ai/flows/check-user';

interface AuthContextType {
  authorizedUser: User | null; 
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_EMAIL_KEY = 'emailForSignIn';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authorizedUser, setAuthorizedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { initData, clearData, data } = useOkrStore();

  useEffect(() => {
    const handleSignIn = async () => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem(USER_EMAIL_KEY);
            if (!email) {
                email = window.prompt('Please provide your email for confirmation');
            }
            if(email) {
                setLoading(true);
                try {
                    const { user } = await signInWithEmailLink(auth, email, window.location.href);
                    setAuthorizedUser(user);
                    window.localStorage.removeItem(USER_EMAIL_KEY);
                } catch(err: any) {
                    console.error(err);
                    setError("Failed to sign in with email link. " + err.message);
                } finally {
                    setLoading(false);
                }
            }
        } else {
             const unsubscribe = auth.onAuthStateChanged(user => {
                setAuthorizedUser(user);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    };
    handleSignIn();
  }, []);

  useEffect(() => {
    if (authorizedUser && data.departments.length === 0) {
      initData();
    }
  }, [authorizedUser, initData, data.departments.length]);


  const loginWithEmail = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
        const response = await checkUser({ email: email.toLowerCase() });

        if (!response.isAuthorized) {
            setError("Your email is not authorized for this application.");
            setLoading(false);
            return;
        }
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem(USER_EMAIL_KEY, email);
        setError(null);
    } catch (err: any) {
        console.error(err);
        setError("An error occurred during login: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
    setAuthorizedUser(null);
    clearData();
  };

  const value = {
    authorizedUser,
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
