'use client';
import { useAuth } from '@/components/app/auth-provider';

export default function HomePage() {
  const { loading } = useAuth();

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <p className="text-muted-foreground">Redirecting...</p>
      )}
    </div>
  );
}
