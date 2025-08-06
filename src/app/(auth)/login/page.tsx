
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/app/auth-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Mail } from 'lucide-react';

export default function LoginPage() {
  const { loginWithEmail, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithEmail(email);
    if (!error) {
      setEmailSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Succeedo</CardTitle>
          <CardDescription>Sign in with your email address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {emailSent && !error ? (
                <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertTitle>Check your email</AlertTitle>
                    <AlertDescription>A sign-in link has been sent to your email address.</AlertDescription>
                </Alert>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button 
                      type="submit"
                      className="w-full" 
                      disabled={loading}
                  >
                      {loading ? 'Sending link...' : 'Send Sign-In Link'}
                  </Button>
                </form>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
