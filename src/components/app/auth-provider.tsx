
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, onAuthStateChanged, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useOkrStore } from '@/hooks/use-okr-store';
import { isUserAuthorized } from '@/lib/user-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data, initData, loading: storeLoading } = useOkrStore();

  useEffect(() => {
    // Handle email link sign-in
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            // Clean the URL
            window.history.replaceState(null, '', window.location.pathname);
          } catch (err: any) {
            setError(err.message);
          }
        } else {
            setError("Email is required to complete sign-in.");
        }
      }
    };

    handleEmailLinkSignIn();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await initData();
      } else {
        setUser(null);
        if (pathname !== '/login') {
            router.replace('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !storeLoading && user) {
       if (pathname === '/login' || pathname === '/') {
            if (data.departments.length > 0) {
              router.replace(`/department/${data.departments[0].id}`);
            } else {
              router.replace('/department/new');
            }
       }
    }
  }, [loading, storeLoading, user, data.departments, pathname, router]);

  const signInWithEmail = async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      const authorized = await isUserAuthorized(email);
      if (!authorized) {
          throw new Error('This email address is not authorized.');
      }
      
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    await auth.signOut();
    setUser(null);
    router.replace('/login');
  };
  
  if (loading || (!user && pathname !== '/login')) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithEmail, signOutUser }}>
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
