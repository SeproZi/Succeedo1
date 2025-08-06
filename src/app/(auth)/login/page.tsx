
'use client';
import { useAuth } from '@/components/app/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
});

export default function LoginPage() {
  const { signInWithEmail, error, loading } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await signInWithEmail(values.email);
    setEmailSent(true);
  };

  if (emailSent) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background">
         <Card className="w-full max-w-sm text-center">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    A sign-in link has been sent to your email address. Please click the link to continue.
                </p>
            </CardContent>
         </Card>
       </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Succeedo</CardTitle>
          <CardDescription>Sign in with a magic link to access your dashboard. No password required.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email Address</Label>
                    <FormControl>
                      <Input id="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Magic Link
              </Button>
              {error && (
                <p className="text-center text-sm text-destructive">
                  {error}
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
