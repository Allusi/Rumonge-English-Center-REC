
"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, LogOut, SpellCheck, Info, MessageCircle, Loader2, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import { useUser } from "@/firebase";

// This is a client component, so we can't use Metadata directly.
// We can set the title dynamically in the effect below.

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
     if (user) {
        document.title = "Student Dashboard - REC Online";
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="h-10 w-10 rounded-lg" />
            <span className="text-lg font-semibold text-sidebar-foreground">REC Online</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/student/dashboard" passHref>
                <SidebarMenuButton tooltip="Dashboard">
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/student/announcements" passHref>
                <SidebarMenuButton tooltip="Announcements">
                  <Megaphone />
                  Announcements
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/student/ai-tutor" passHref>
                <SidebarMenuButton tooltip="AI Tutor">
                  <MessageCircle />
                  AI Tutor
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/student/grammar-checker" passHref>
                <SidebarMenuButton tooltip="Grammar Checker">
                  <SpellCheck />
                  Grammar Checker
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/student/guidelines" passHref>
                <SidebarMenuButton tooltip="School Guidelines">
                  <Info />
                  School Guidelines
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <Link href="/" passHref>
             <SidebarMenuButton>
                <LogOut />
                Logout
              </SidebarMenuButton>
           </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Can add breadcrumbs or search here */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
