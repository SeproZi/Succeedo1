'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useOkrStore } from '@/hooks/use-okr-store';
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
  const { data, initData, loading: storeLoading, clearData } = useOkrStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        // User is signed in, now check if they are authorized.
        const authorized = await isUserAuthorized(user.email);
        if (authorized) {
          setUser(user);
          await initData();
        } else {
          // Not authorized, sign them out.
          await signOut(auth);
          setUser(null);
          setError("You are not authorized to access this application.");
          router.replace('/login');
        }
      } else {
        // User is signed out.
        setUser(null);
        if (pathname !== '/login') {
            router.replace('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router, initData]);


  useEffect(() => {
    if (!loading && !storeLoading && user) {
       if (pathname === '/login' || pathname === '/') {
            if (data.departments.length > 0) {
              const firstDept = data.departments.sort((a,b) => a.title.localeCompare(b.title))[0];
              router.replace(`/department/${firstDept.id}`);
            } else {
              router.replace('/department/new');
            }
       }
    }
  }, [loading, storeLoading, user, data.departments, pathname, router]);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest: authorization check and redirection.
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else {
        setError("An error occurred during sign-in. Please try again.");
      }
      console.error(err);
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle redirection to /login
  };
  
  if (loading) {
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
