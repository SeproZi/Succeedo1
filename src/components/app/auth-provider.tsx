'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isUserAuthorized } from '@/lib/user-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This handles the result of the redirect sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User has successfully signed in via redirect.
          // onAuthStateChanged will handle the rest.
        }
      })
      .catch((err) => {
        console.error("Redirect Result Error:", err);
        setError("Failed to process sign-in redirect.");
      });
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const authorized = await isUserAuthorized(user.email);
        if (authorized) {
          setUser(user);
          if (pathname === '/login' || pathname === '/') {
            router.replace('/department/1');
          }
        } else {
          await signOut(auth);
          setUser(null);
          router.replace('/login?error=unauthorized');
        }
      } else {
        setUser(null);
        if (pathname !== '/login') {
          router.replace('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // The redirect will navigate away, and the onAuthStateChanged listener 
      // will handle the user state when they return.
    } catch (err: any) {
      console.error("Sign-in initiation error:", err.code, err.message);
      setError('Failed to initiate sign in. Please try again.');
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    router.replace('/login');
    setLoading(false);
  };
  
  if (loading && pathname !== '/login') {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, signOutUser }}>
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
