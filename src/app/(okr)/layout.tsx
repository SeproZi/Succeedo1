
'use client';
import { AppSidebar } from '@/components/app/app-sidebar';
import { useAuth } from '@/components/app/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarToggleButton,
} from '@/components/ui/sidebar';

export default function OkrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <AppSidebar />
                <SidebarToggleButton />
            </Sidebar>
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
