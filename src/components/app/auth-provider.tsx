
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useOkrStore } from '@/hooks/use-okr-store';

interface AuthContextType {
  user: User | null; // This will be the anonymous user from Firebase
  authorizedEmail: string | null; // This will be the email if it's found in the 'users' collection
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTHORIZED_EMAIL_KEY = 'authorizedEmail';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authorizedEmail, setAuthorizedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { initData, clearData } = useOkrStore();

  useEffect(() => {
    // Check for a logged-in user in local storage on mount
    const storedEmail = localStorage.getItem(AUTHORIZED_EMAIL_KEY);
    if (storedEmail) {
      setAuthorizedEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    // Sign in anonymously to be able to query Firestore
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
            setUser(fbUser);
            if (authorizedEmail) {
                await initData();
            }
        } else {
            // This case should ideally not be hit frequently with anonymous auth
            // unless the token is invalidated.
            signInAnonymously(auth).catch((err) => {
                setError("Failed to get anonymous session: " + err.message);
            });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [initData, authorizedEmail]);


  const loginWithEmail = async (email: string) => {
    setLoading(true);
    setError(null);

    if (!user) {
        setError("Not connected to Firebase. Please try again in a moment.");
        setLoading(false);
        return;
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setError("Your email is not authorized to access this application.");
        } else {
            const foundEmail = querySnapshot.docs[0].data().email;
            setAuthorizedEmail(foundEmail);
            localStorage.setItem(AUTHORIZED_EMAIL_KEY, foundEmail);
            await initData();
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
    // No need to sign out anonymous user, they can just "log in" again.
  };

  const value = {
    user,
    authorizedEmail,
    loading,
    error,
    loginWithEmail,
    logout,
  };

  // Render children immediately, redirection is handled by pages
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
