"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Inbox,
  CalendarCheck,
  Phone,
  Clock,
  TrendingUp,
  PhoneIncoming,
  AlertTriangle,
  UserPlus,
  Globe,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const getUrgencyBadge = (score: number) => {
  if (score >= 9) return { label: "EMERGENCY", variant: "danger" as const };
  if (score >= 7) return { label: "URGENT", variant: "warning" as const };
  if (score >= 4) return { label: "STANDARD", variant: "outline" as const };
  return { label: "LOW", variant: "muted" as const };
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "EMERGENCY": return { label: "EMERGENCY", variant: "danger" as const };
    case "URGENT": return { label: "URGENT", variant: "warning" as const };
    case "STANDARD": return { label: "STANDARD", variant: "outline" as const };
    case "LOW": return { label: "LOW", variant: "muted" as const };
    default: return { label: priority, variant: "outline" as const };
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed": return { label: "Confirmed", variant: "success" as const };
    case "scheduled": return { label: "Scheduled", variant: "outline" as const };
    case "in_progress": return { label: "In Progress", variant: "info" as const };
    case "completed": return { label: "Completed", variant: "success" as const };
    case "cancelled": return { label: "Cancelled", variant: "danger" as const };
    default: return { label: status, variant: "outline" as const };
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "WEB": return Globe;
    case "SMS": return MessageSquare;
    case "VOICE": return Phone;
    default: return Inbox;
  }
};

// ── Skeleton Components ────────────────────────────────────────────────

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-surface-mid rounded", className)} />
  );
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <SkeletonPulse className="h-3 w-20" />
                <SkeletonPulse className="h-8 w-14" />
                <SkeletonPulse className="h-3 w-32" />
              </div>
              <SkeletonPulse className="w-9 h-9 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <SkeletonPulse className="h-4 w-16" />
          <div className="flex-1 space-y-1">
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-3 w-24" />
          </div>
          <SkeletonPulse className="h-5 w-16 rounded-full" />
          <SkeletonPulse className="h-5 w-20 rounded-full" />
          <SkeletonPulse className="h-4 w-16" />
          <SkeletonPulse className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function IntakeSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <SkeletonPulse className="h-4 w-28" />
              <SkeletonPulse className="h-3 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-5 w-20 rounded-full" />
            <SkeletonPulse className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivitySkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <SkeletonPulse className="w-8 h-8 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof Inbox; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-text-muted">
      <Icon className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────

export default function Dashboard() {
  const { company, companyId, isLoading: companyLoading } = useCurrentCompany();

  const kpis = useQuery(
    api.dashboard.getKPIs,
    companyId ? { companyId } : "skip"
  );

  const upcomingBookings = useQuery(
    api.bookings.getUpcoming,
    companyId ? { companyId } : "skip"
  );

  const intakeSessions = useQuery(
    api.intakeSessions.list,
    companyId ? { companyId } : "skip"
  );

  const activityFeed = useQuery(
    api.activityFeed.list,
    companyId ? { companyId } : "skip"
  );

  const isLoading = companyLoading || !company;
  const userName = company?.userName ?? "";

  // Derive recent intakes (last 10, ordered newest first - already desc from query)
  const recentIntakes = intakeSessions?.slice(0, 10) ?? [];

  // Derive recent activity (last 10)
  const recentActivity = activityFeed?.slice(0, 10) ?? [];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted">
          {isLoading ? (
            <SkeletonPulse className="h-4 w-64 mt-1 inline-block" />
          ) : (
            <>Good morning, {userName}. Here&apos;s your day.</>
          )}
        </p>
      </div>

      {/* KPI Strip */}
      {!kpis ? (
        <KPISkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Calls Today */}
          <Card className="cursor-pointer hover:border-accent transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-text-muted mb-1">Calls Today</p>
                  <p className="text-2xl font-bold text-brand">{kpis.callsToday}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {kpis.totalIntakes} total intakes
                  </p>
                </div>
                <div className="p-2 bg-surface-mid rounded-lg">
                  <PhoneIncoming className="w-5 h-5 text-brand" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Intake Sessions */}
          <Card className={cn(
            "cursor-pointer hover:border-accent transition-colors",
            kpis.openIntakes > 0 && "border-danger/50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-text-muted mb-1">Open Intake Sessions</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    kpis.openIntakes > 0 ? "text-danger" : "text-brand"
                  )}>
                    {kpis.openIntakes}
                  </p>
                  <p className="text-xs text-text-muted mt-1">Needs attention</p>
                </div>
                <div className="p-2 bg-surface-mid rounded-lg">
                  <Inbox className={cn(
                    "w-5 h-5",
                    kpis.openIntakes > 0 ? "text-danger" : "text-brand"
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Today */}
          <Card className="cursor-pointer hover:border-accent transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-text-muted mb-1">Bookings Today</p>
                  <p className="text-2xl font-bold text-brand">{kpis.bookingsToday}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {kpis.totalBookings} total
                  </p>
                </div>
                <div className="p-2 bg-surface-mid rounded-lg">
                  <CalendarCheck className="w-5 h-5 text-brand" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Response Time */}
          <Card className="cursor-pointer hover:border-accent transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-text-muted mb-1">Avg Response Time</p>
                  <p className="text-2xl font-bold text-brand">
                    {kpis.avgResponseTimeMinutes}m
                  </p>
                  <p className="text-xs text-text-muted mt-1">Time to assignment</p>
                </div>
                <div className="p-2 bg-surface-mid rounded-lg">
                  <Clock className="w-5 h-5 text-brand" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
                <Link href="/dashboard/bookings">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!upcomingBookings ? (
                <TableSkeleton />
              ) : upcomingBookings.length === 0 ? (
                <EmptyState icon={CalendarCheck} message="No upcoming bookings" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-medium text-text-muted pb-3">Time</th>
                        <th className="text-left text-xs font-medium text-text-muted pb-3">Customer</th>
                        <th className="text-left text-xs font-medium text-text-muted pb-3">Service</th>
                        <th className="text-left text-xs font-medium text-text-muted pb-3">Priority</th>
                        <th className="text-left text-xs font-medium text-text-muted pb-3">Tech</th>
                        <th className="text-left text-xs font-medium text-text-muted pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingBookings.map((booking) => {
                        const priority = getPriorityBadge(booking.priority);
                        const status = getStatusBadge(booking.status);
                        return (
                          <tr
                            key={booking._id}
                            className="border-b border-border last:border-0 hover:bg-surface-mid/50 cursor-pointer"
                          >
                            <td className="py-3">
                              <span className="font-medium text-sm">
                                {booking.timeWindow ?? booking.scheduledDate}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="text-sm font-medium">{booking.customerName}</div>
                              <div className="text-xs text-text-muted font-mono">
                                {booking.customerPhone ?? "—"}
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge variant="outline" className="text-xs">
                                {booking.serviceCategory ?? "General"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge variant={priority.variant} className="text-xs">
                                {priority.label}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <span className={cn(
                                "text-sm",
                                !booking.technicianName ? "text-danger font-medium" : "text-text-primary"
                              )}>
                                {booking.technicianName ?? "Unassigned"}
                              </span>
                            </td>
                            <td className="py-3">
                              <Badge variant={status.variant} className="text-xs">
                                {status.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Intake Sessions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Intake Sessions</CardTitle>
                <Link href="/dashboard/inbox">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!intakeSessions ? (
                <IntakeSkeleton />
              ) : recentIntakes.length === 0 ? (
                <EmptyState icon={Inbox} message="No intake sessions yet" />
              ) : (
                <div className="space-y-3">
                  {recentIntakes.map((session) => {
                    const urgencyScore = session.urgencyScore ?? 0;
                    const urgency = getUrgencyBadge(urgencyScore);
                    const ChannelIcon = getChannelIcon(session.channel);
                    return (
                      <Link
                        key={session._id}
                        href={`/dashboard/inbox/${session._id}`}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-surface-mid/50 transition-colors",
                          urgencyScore >= 9 ? "border-danger/50 bg-danger/5" : "border-border"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            urgencyScore >= 9 ? "bg-danger/10" : "bg-surface-mid"
                          )}>
                            <ChannelIcon className={cn(
                              "w-4 h-4",
                              urgencyScore >= 9 ? "text-danger" : "text-text-muted"
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{session.customerName}</span>
                              <Badge variant="outline" className="text-xs">{session.channel}</Badge>
                            </div>
                            <p className="text-xs text-text-muted line-clamp-1">
                              {session.aiSummary || session.issueRaw}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge variant={urgency.variant} className="text-xs">
                            {urgencyScore >= 9 && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {urgency.label}
                          </Badge>
                          <span className="text-xs text-text-muted">
                            {timeAgo(session.createdAt)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              {!activityFeed ? (
                <ActivitySkeleton />
              ) : recentActivity.length === 0 ? (
                <EmptyState icon={Clock} message="No recent activity" />
              ) : (
                <>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const activityType = activity.type;
                      const icons: Record<string, typeof Inbox> = {
                        intake: Inbox,
                        intake_created: Inbox,
                        intake_assigned: UserPlus,
                        intake_resolved: Inbox,
                        intake_escalated: AlertTriangle,
                        booking: CalendarCheck,
                        booking_created: CalendarCheck,
                        booking_completed: CalendarCheck,
                        booking_cancelled: CalendarCheck,
                        call: Phone,
                        call_received: Phone,
                        assign: UserPlus,
                        escalation: AlertTriangle,
                        member_invited: UserPlus,
                        member_removed: UserPlus,
                        note_added: Inbox,
                        settings_updated: Inbox,
                      };
                      const Icon = icons[activityType] ?? Inbox;

                      const colors: Record<string, string> = {
                        intake: "text-info bg-info/10",
                        intake_created: "text-info bg-info/10",
                        intake_assigned: "text-accent bg-accent/10",
                        intake_resolved: "text-success bg-success/10",
                        intake_escalated: "text-danger bg-danger/10",
                        booking: "text-success bg-success/10",
                        booking_created: "text-success bg-success/10",
                        booking_completed: "text-success bg-success/10",
                        booking_cancelled: "text-danger bg-danger/10",
                        call: "text-brand bg-brand/10",
                        call_received: "text-brand bg-brand/10",
                        assign: "text-accent bg-accent/10",
                        escalation: "text-danger bg-danger/10",
                        member_invited: "text-accent bg-accent/10",
                        member_removed: "text-danger bg-danger/10",
                        note_added: "text-info bg-info/10",
                        settings_updated: "text-brand bg-brand/10",
                      };
                      const color = colors[activityType] ?? "text-brand bg-brand/10";

                      return (
                        <div key={activity._id} className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            color
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary">
                              {activity.description ?? activity.text}
                            </p>
                            <p className="text-xs text-text-muted">
                              {timeAgo(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="ghost" className="w-full mt-4" size="sm">
                    View All Activity
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
