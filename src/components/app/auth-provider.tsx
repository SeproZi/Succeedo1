
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useOkrStore } from '@/hooks/use-okr-store';
import { isUserAuthorized } from '@/lib/user-service';

// This is a mock user for demonstration purposes.
// In a real application, you would get this from your auth provider.
const MOCK_USER: Omit<User, 'providerData'> = {
  uid: 'mock-user-id',
  email: 'user@google.com',
  displayName: 'Mock User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerId: 'password',
  tenantId: null,
  refreshToken: '',
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};


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
    // In a real app, you'd use onAuthStateChanged here.
    // For now, we'll simulate a logged-in user to bypass the login screen
    // if they are not on the login page.
    const checkAuth = async () => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            await initData();
        } else if (pathname !== '/login') {
            router.replace('/login');
        }
        setLoading(false);
    }
    checkAuth();
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
      
      // This is a mock sign-in. We are not actually calling Firebase auth
      // but simulating a successful login if the email is in our authorized list.
      const mockUserInfo = { ...MOCK_USER, email, displayName: email.split('@')[0] };
      setUser(mockUserInfo as User);
      sessionStorage.setItem('user', JSON.stringify(mockUserInfo));
      
      // After setting the user, the useEffect above will handle redirection.

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setUser(null);
    sessionStorage.removeItem('user');
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
