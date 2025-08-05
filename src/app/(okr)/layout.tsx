'use client';
import { AppSidebar } from '@/components/app/app-sidebar';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
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
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
          {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
