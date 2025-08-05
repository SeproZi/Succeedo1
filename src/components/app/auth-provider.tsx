'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from 'firebase/auth';
import { isUserAuthorized } from '@/lib/user-service';

// Mock user object for email-only auth
const createMockUser = (email: string): User => ({
  uid: email,
  email: email,
  displayName: email.split('@')[0],
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'password',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({ token: '', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, claims: {} }),
  reload: async () => {},
  toJSON: () => ({}),
});


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

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
        const mockUser = createMockUser(storedEmail);
        setUser(mockUser);
        if (pathname === '/login' || pathname === '/') {
          router.replace('/department/1');
        }
    } else {
        if (pathname !== '/login') {
            router.replace('/login');
        }
    }
    setLoading(false);

  }, [router, pathname]);

  const signInWithEmail = async (email: string) => {
    setError(null);
    setLoading(true);
    const authorized = await isUserAuthorized(email);
    if (authorized) {
      const mockUser = createMockUser(email);
      localStorage.setItem('userEmail', email);
      setUser(mockUser);
      router.replace('/department/1');
    } else {
      setError('This email address is not authorized.');
    }
    setLoading(false);
  };


  const signOutUser = async () => {
    localStorage.removeItem('userEmail');
    setUser(null);
    router.replace('/login');
  };
  
  if (loading && pathname !== '/login') {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Loading authentication...</p>
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
