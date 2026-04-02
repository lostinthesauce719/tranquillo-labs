"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentCompany, type UserRole } from "@/hooks/useCurrentCompany";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Inbox,
  CalendarCheck,
  Phone,
  Wrench,
  Settings,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  roles: UserRole[] | "all";
  badgeKey?: "inbox" | "bookings";
  section?: "main" | "bottom";
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: "all", section: "main" },
  { icon: Inbox, label: "Inbox", href: "/dashboard/inbox", roles: ["owner", "dispatcher", "csr"], badgeKey: "inbox", section: "main" },
  { icon: CalendarCheck, label: "Bookings", href: "/dashboard/bookings", roles: ["owner", "dispatcher", "csr"], badgeKey: "bookings", section: "main" },
  { icon: Phone, label: "Calls", href: "/dashboard/calls", roles: ["owner", "dispatcher", "csr"], section: "main" },
  { icon: Wrench, label: "My Jobs", href: "/dashboard/my-jobs", roles: ["tech"], section: "main" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", roles: ["owner"], section: "bottom" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing", roles: ["owner"], section: "bottom" },
];

function canSee(itemRoles: UserRole[] | "all", userRole: UserRole): boolean {
  if (itemRoles === "all") return true;
  return itemRoles.includes(userRole);
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: company } = useCurrentCompany();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = company?.role ?? "dispatcher";

  // Badge queries
  const todayBookingsCount = useQuery(
    api.bookings.getTodayCount,
    company ? { companyId: company.companyId as any } : "skip"
  );

  const intakeSessions = useQuery(
    api.intakeSessions.list,
    company ? { companyId: company.companyId as any } : "skip"
  );

  const unreadInboxCount = intakeSessions
    ? intakeSessions.filter(
        (s) => s.status === "new" || s.status === "escalated"
      ).length
    : 0;

  const hasEmergency = intakeSessions
    ? intakeSessions.some(
        (s) =>
          (s.status === "new" || s.status === "escalated") &&
          (s.urgencyScore ?? 0) >= 9
      )
    : false;

  function getBadge(key?: "inbox" | "bookings") {
    if (!key) return null;
    if (key === "inbox" && unreadInboxCount > 0) {
      return { count: unreadInboxCount, variant: hasEmergency ? "danger" : "warning" };
    }
    if (key === "bookings" && (todayBookingsCount ?? 0) > 0) {
      return { count: todayBookingsCount!, variant: "outline" };
    }
    return null;
  }

  const mainItems = navItems.filter((i) => i.section === "main" && canSee(i.roles, role));
  const bottomItems = navItems.filter((i) => i.section === "bottom" && canSee(i.roles, role));

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      <nav className="flex-1 p-4 space-y-1">
        {mainItems.map((item) => {
          const active = isActive(item.href);
          const badge = getBadge(item.badgeKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-white"
                  : "text-text-muted hover:bg-surface-mid hover:text-text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {badge && (
                <Badge
                  variant={badge.variant as any}
                  className="ml-auto text-xs"
                >
                  {badge.count}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {bottomItems.length > 0 && (
        <div className="border-t border-border p-4 space-y-1">
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-brand text-white"
                    : "text-text-muted hover:bg-surface-mid hover:text-text-primary"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-border md:hidden"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-60 bg-surface border-r border-border flex flex-col z-40 transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
