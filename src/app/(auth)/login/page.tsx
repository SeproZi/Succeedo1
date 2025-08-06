'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/app/auth-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.356-11.303-8H6.399C9.646,36.645,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C42.012,35.83,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


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

function SignUpForm() {
    const { signUpWithEmailPassword, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordsMatch(false);
            return;
        }
        setPasswordsMatch(true);
        await signUpWithEmailPassword(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email-signup">Email Address</Label>
                <Input
                    id="email-signup"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password-signup">Confirm Password</Label>
                <Input
                    id="confirm-password-signup"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            {!passwordsMatch && (
                <p className="text-sm text-destructive">Passwords do not match.</p>
            )}
            <Button
                type="submit"
                className="w-full"
                disabled={loading}
            >
                {loading ? 'Creating account...' : 'Create Account'}
            </Button>
        </form>
    );
}


export default function AuthPage() {
  const { authorizedUser, loading, error, loginWithGoogle } = useAuth();
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
          <CardDescription>Sign in or create a new account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={loginWithGoogle} disabled={loading}>
            <GoogleIcon className="mr-2" />
            Sign in with Google
          </Button>

          <div className="flex items-center space-x-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <div className="pt-4">
              {error && (
                  <Alert variant="destructive" className="mb-4">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Authentication Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}
            </div>
            <TabsContent value="signin">
                <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
                <SignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
