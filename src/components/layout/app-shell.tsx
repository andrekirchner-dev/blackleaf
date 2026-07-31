"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { SmartTipsPanel, SmartTipsMobile } from "./smart-tips-panel";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />
        <div className="flex-1 flex gap-0 xl:gap-6 p-4 md:p-6 xl:pr-6 min-w-0">
          <main className="flex-1 min-w-0">{children}</main>
          <SmartTipsPanel />
        </div>
      </div>
      <SmartTipsMobile />
    </div>
  );
}
