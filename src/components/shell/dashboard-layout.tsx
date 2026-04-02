"use client";

import { TopNav } from "./top-nav";
import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Sidebar />
      <main className="ml-0 md:ml-60 pt-16">
        {children}
      </main>
    </div>
  );
}
