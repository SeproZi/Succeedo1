
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/app/auth-provider';

export const metadata: Metadata = {
  title: 'Succeedo',
  description: 'A modern OKR planning and tracking app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
            {children}
            <Toaster />
            <div className="fixed bottom-2 right-2 text-xs text-gray-500 pointer-events-none" style={{ textTransform: 'none' }}>
              For support or suggestions, contact Atilla Seprodi
            </div>
        </AuthProvider>
      </body>
    </html>
  );
}
