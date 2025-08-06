'use client';

import { useAuth } from '@/components/app/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function HomePage() {
  const { authorizedUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (authorizedUser) {
        router.replace('/company-overview');
      } else {
        router.replace('/login');
      }
    }
  }, [authorizedUser, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p>Loading...</p>
    </div>
  );
}

export default HomePage;
