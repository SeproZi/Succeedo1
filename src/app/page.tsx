
'use client';

import { useAuth } from '@/components/app/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function HomePage() {
  const { authorizedEmail, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (authorizedEmail) {
        // If user is "logged in", redirect to the company overview page
        router.replace('/company-overview');
      } else {
        // If user is not "logged in", redirect to login page
        router.replace('/login');
      }
    }
  }, [authorizedEmail, loading, router]);

  // You can show a loading spinner here while the redirect is happening
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p>Loading...</p>
    </div>
  );
}

export default HomePage;
