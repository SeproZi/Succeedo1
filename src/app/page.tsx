'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/department/1');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  );
}
