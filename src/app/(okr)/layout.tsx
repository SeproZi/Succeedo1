'use client';
import { AppSidebar } from '@/components/app/app-sidebar';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
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
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <main className="flex-1">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
