'use client';
import { AppSidebar } from '@/components/app/app-sidebar';
import { Header } from '@/components/app/header';
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
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppSidebar />
        <SidebarToggleButton />
      </Sidebar>
      <SidebarInset>
          <Header title="Dashboard" />
          {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
