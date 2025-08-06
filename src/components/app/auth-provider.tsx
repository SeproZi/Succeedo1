
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, onAuthStateChanged, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink as firebaseSignInWithEmailLink, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useOkrStore } from '@/hooks/use-okr-store';
import { isUserAuthorized } from '@/lib/user-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  signInWithEmailLink: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data, initData, loading: storeLoading, clearData } = useOkrStore();

  useEffect(() => {
    // Handle the sign-in link when the user clicks it
    const handleEmailLinkSignIn = async () => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                email = window.prompt('Please provide your email for confirmation');
                 if (!email) {
                    setError("Sign-in failed. Email is required to complete the sign-in process.");
                    setLoading(false);
                    router.replace('/login');
                    return;
                }
            }
            setLoading(true);
            try {
                await firebaseSignInWithEmailLink(auth, email, window.location.href);
                // onAuthStateChanged will handle the rest
                window.localStorage.removeItem('emailForSignIn');

            } catch (err: any) {
                console.error("Firebase sign-in error:", err);
                setError(`Failed to sign in. The link may be invalid or expired. (Error: ${err.code})`);
                setLoading(false);
                router.replace('/login');
            }
        }
    };
    handleEmailLinkSignIn();


    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      if (user) {
        setUser(user);
        await initData();
      } else {
        setUser(null);
        clearData();
        if (pathname !== '/login' && !isSignInWithEmailLink(auth, window.location.href)) {
            router.replace('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initData, clearData, pathname, router]);


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

  const signInWithEmailLink = async (email: string) => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const authorized = await isUserAuthorized(email);
    if (!authorized) {
        setError("Your email is not authorized to access this application.");
        setLoading(false);
        return;
    }
    
    try {
        const actionCodeSettings = {
            url: window.location.origin + '/login',
            handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        setSuccessMessage(`A sign-in link has been sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
        console.error("Sign-in initiation error:", err);
        setError(`An error occurred. Could not send sign-in link. (Error: ${err.code})`);
    } finally {
        setLoading(false);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle clearing data and redirection to /login
  };
  
  // This handles the initial page load and sign-in link processing
  if (loading || (isSignInWithEmailLink(auth, window.location.href) && !user)) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Loading...</p>
        </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading, error, successMessage, signInWithEmailLink, signOutUser }}>
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
