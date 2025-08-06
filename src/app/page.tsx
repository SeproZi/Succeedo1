
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background flex-col gap-4">
      <h1 className="text-4xl font-headline">Welcome to Succeedo</h1>
      <p className="text-muted-foreground">The authentication system has been reset.</p>
      <Button asChild>
        <Link href="/login">Go to Login Page</Link>
      </Button>
    </div>
  );
}
