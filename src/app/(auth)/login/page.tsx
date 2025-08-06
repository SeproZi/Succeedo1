
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Succeedo</CardTitle>
          <CardDescription>Sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Authentication will be implemented here.
              </p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
