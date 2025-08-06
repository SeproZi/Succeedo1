'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useOkrStore } from '@/hooks/use-okr-store';
import { isUserAuthorized } from '@/lib/user-service';
import { Loader2 } from 'lucide-react';

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
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      if (user) {
        const authorized = await isUserAuthorized(user.email);
        if (authorized) {
          setUser(user);
          await initData();
        } else {
          setError("Your email is not authorized to access this application.");
          await signOut(auth); 
          setUser(null);
          clearData();
        }
      } else {
        setUser(null);
        clearData();
        if (pathname !== '/login') {
            router.replace('/login');
        }
      }
      setLoading(false);
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, [initData, clearData, pathname, router]);

  useEffect(() => {
    if (authInitialized && !loading && !storeLoading && user) {
       if (pathname === '/login' || pathname === '/') {
            if (data.departments.length > 0) {
              const firstDept = data.departments.sort((a,b) => a.title.localeCompare(b.title))[0];
              router.replace(`/department/${firstDept.id}`);
            } else {
              router.replace('/department/new');
            }
       }
    }
  }, [authInitialized, loading, storeLoading, user, data.departments, pathname, router]);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle routing and data loading.
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      // Let Firebase's popup show the error, but still update state
      setError("Failed to sign in. See console or popup for details.");
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle clearing data and redirection to /login
  };
  
  if (!authInitialized) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
