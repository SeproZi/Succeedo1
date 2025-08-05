'use client';
import { AppSidebar } from '@/components/app/app-sidebar';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarToggleButton,
} from '@/components/ui/sidebar';
import { OkrDashboard } from '@/components/app/okr-dashboard';

export default function OkrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
