
'use client';
import { useAuth } from '@/components/app/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';


export default function LoginPage() {
  const { signInWithEmailLink, loading, error, successMessage } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithEmailLink(email);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Succeedo</CardTitle>
          <CardDescription>Sign in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
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
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <span>Sign In with Email</span>
                )}
              </Button>
              {error && (
                <p className="text-center text-sm text-destructive">
                  {error}
                </p>
              )}
              {successMessage && (
                <p className="text-center text-sm text-green-600">
                    {successMessage}
                </p>
              )}
           </form>
        </CardContent>
      </Card>
    </div>
  );
}
