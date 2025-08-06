
import { AuthProvider } from "@/components/app/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <AuthProvider>{children}</AuthProvider>
  );
}
