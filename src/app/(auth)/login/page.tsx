'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/app/auth-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

function LoginForm() {
  const { loginWithEmailPassword, sendPasswordReset, loading, error } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithEmailPassword(email, password);
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
        toast({
            title: "Email Required",
            description: "Please enter your email address to reset your password.",
            variant: "destructive",
        });
        return;
    }
    try {
        await sendPasswordReset(email);
        toast({
            title: "Password Reset Email Sent",
            description: "Check your inbox for a link to reset your password.",
        });
    } catch (err: any) {
        toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-login">Email Address</Label>
        <Input
          id="email-login"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password-login">Password</Label>
            <Button 
              type="button"
              variant="link"
              className="p-0 h-auto text-xs"
              onClick={handlePasswordReset}
            >
                Forgot Password?
            </Button>
        </div>
        <Input
          id="password-login"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <Button 
          type="submit"
          className="w-full" 
          disabled={loading}
      >
          {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}


export default function AuthPage() {
  const { authorizedUser, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authorizedUser) {
      router.replace('/company-overview');
    }
  }, [authorizedUser, loading, router]);


  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Succeedo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="pt-4">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
