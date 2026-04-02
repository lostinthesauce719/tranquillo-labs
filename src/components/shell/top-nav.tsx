"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import {
  Bell,
  Volume2,
  VolumeX,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export function TopNav() {
  const { user } = useUser();
  const { data: company } = useCurrentCompany();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    company
      ? { companyId: company.companyId as any, userId: user?.id ?? "" }
      : "skip"
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left - Logo & Company */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-brand">Tranquillo</span>
          </div>
          {company && (
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <span className="text-sm font-medium">{company.companyName}</span>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </div>
          )}
        </div>

        {/* Center - Notifications & Sound */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-surface-mid rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-text-muted" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute top-1 right-1 min-w-[8px] h-2 bg-danger rounded-full" />
            )}
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-surface-mid rounded-lg transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-text-muted" />
            ) : (
              <VolumeX className="w-5 h-5 text-text-muted" />
            )}
          </button>
        </div>

        {/* Right - User */}
        <div className="flex items-center gap-3">
          {company && (
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{company.userName}</div>
              <div className="text-xs text-text-muted capitalize">{company.role}</div>
            </div>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
