'use client';
import { AppSidebar } from '@/components/app/app-sidebar';
import { AuthProvider } from '@/components/app/auth-provider';
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
  return (
    <AuthProvider>
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <AppSidebar />
                <SidebarToggleButton />
            </Sidebar>
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    </AuthProvider>
  );
}
