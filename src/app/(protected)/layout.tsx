import React from "react";
import ProtectedPage from "@/providers/ProtectedPage";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar";
import { Separator } from "@/components/ui/separator";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedPage>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <span className="font-semibold">Brokwise Developer</span>
            </div>
          </header>
          <main className="px-10">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedPage>
  );
};

export default Layout;
