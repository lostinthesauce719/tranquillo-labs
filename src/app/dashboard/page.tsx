import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Inbox, 
  CalendarCheck, 
  Phone, 
  Wrench, 
  Settings, 
  CreditCard,
  Bell,
  Volume2,
  ChevronDown,
  TrendingUp,
  PhoneIncoming,
  Clock,
  AlertTriangle,
  UserPlus,
  Globe,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const mockUser = {
  name: "Sarah",
  role: "Owner",
  initials: "SJ"
};

const mockKPIs = [
  { label: "Calls Today", value: "47", subtext: "42 answered · 5 missed", icon: PhoneIncoming, trend: "+12%" },
  { label: "Open Intake Sessions", value: "12", subtext: "2 EMERGENCY · 4 URGENT", icon: Inbox, trend: null, urgent: true },
  { label: "Bookings Today", value: "23", subtext: "18 confirmed · 5 pending", icon: CalendarCheck, trend: "+8%" },
  { label: "Avg Response Time", value: "4m", subtext: "Time to booking", icon: Clock, trend: "-23%" },
];

const mockUpcomingBookings = [
  { id: 1, time: "8:00 AM", customer: "Sarah Martinez", phone: "(555) 123-4567", service: "HVAC", priority: "EMERGENCY", tech: "Mike J.", status: "Confirmed" },
  { id: 2, time: "9:30 AM", customer: "John Chen", phone: "(555) 234-5678", service: "Plumbing", priority: "URGENT", tech: "Lisa R.", status: "Confirmed" },
  { id: 3, time: "10:00 AM", customer: "Bob Williams", phone: "(555) 345-6789", service: "Electrical", priority: "STANDARD", tech: "Unassigned", status: "Scheduled" },
  { id: 4, time: "11:30 AM", customer: "Maria Garcia", phone: "(555) 456-7890", service: "HVAC", priority: "STANDARD", tech: "Mike J.", status: "Confirmed" },
  { id: 5, time: "1:00 PM", customer: "David Kim", phone: "(555) 567-8901", service: "Plumbing", priority: "LOW", tech: "Lisa R.", status: "Confirmed" },
];

const mockIntakeSessions = [
  { id: 1, channel: "WEB", customer: "Amy Thompson", issue: "AC not cooling, house is 85°F", urgency: 9, time: "2m ago" },
  { id: 2, channel: "SMS", customer: "Robert Chen", issue: "Water heater leaking from bottom", urgency: 7, time: "8m ago" },
  { id: 3, channel: "VOICE", customer: "Jennifer Lopez", issue: "Need furnace inspection before winter", urgency: 4, time: "15m ago" },
  { id: 4, channel: "WEB", customer: "Michael Brown", issue: "Electrical outlet sparking", urgency: 10, time: "22m ago" },
  { id: 5, channel: "SMS", customer: "Emily Davis", issue: "Garbage disposal stuck", urgency: 3, time: "31m ago" },
];

const mockActivityFeed = [
  { type: "intake", text: "New intake from Sarah Martinez", time: "2m ago" },
  { type: "booking", text: "Booking created for John Chen", time: "8m ago" },
  { type: "call", text: "Call completed - 4:32 duration", time: "12m ago" },
  { type: "assign", text: "Mike J. assigned to Amy Thompson", time: "15m ago" },
  { type: "escalation", text: "EMERGENCY escalated - Michael Brown", time: "22m ago" },
];

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
    case "Confirmed": return { label: "Confirmed", variant: "success" as const };
    case "Scheduled": return { label: "Scheduled", variant: "outline" as const };
    case "In Progress": return { label: "In Progress", variant: "info" as const };
    case "Completed": return { label: "Completed", variant: "success" as const };
    case "Cancelled": return { label: "Cancelled", variant: "danger" as const };
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

// Sidebar component
function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Inbox, label: "Inbox", href: "/dashboard/inbox", badge: "12", badgeVariant: "danger" },
    { icon: CalendarCheck, label: "Bookings", href: "/dashboard/bookings", badge: "23" },
    { icon: Phone, label: "Calls", href: "/dashboard/calls" },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 bg-surface border-r border-border flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, i) => (
          <a
            key={i}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              item.active
                ? "bg-brand text-white"
                : "text-text-muted hover:bg-surface-mid hover:text-text-primary"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.badge && (
              <Badge 
                variant={item.badgeVariant as any} 
                className="ml-auto text-xs"
              >
                {item.badge}
              </Badge>
            )}
          </a>
        ))}
      </nav>
      
      <div className="border-t border-border p-4 space-y-1">
        <a
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-mid hover:text-text-primary transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </a>
        <a
          href="/dashboard/billing"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-mid hover:text-text-primary transition-colors"
        >
          <CreditCard className="w-5 h-5" />
          <span>Billing</span>
        </a>
      </div>
    </aside>
  );
}

// Top nav component
function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left - Logo & Location */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-brand">Tranquillo</span>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-border">
            <span className="text-sm font-medium">ABC Heating & Cooling</span>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </div>
        </div>

        {/* Center - Notifications & Sound */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-surface-mid rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-text-muted" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
          </button>
          <button className="p-2 hover:bg-surface-mid rounded-lg transition-colors">
            <Volume2 className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Right - User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium">{mockUser.name}</div>
            <div className="text-xs text-text-muted">{mockUser.role}</div>
          </div>
          <button className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-medium">
            {mockUser.initials}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Sidebar />
      
      {/* Main Content */}
      <main className="ml-60 pt-16">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-muted">Good morning, {mockUser.name}. Here&apos;s your day.</p>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {mockKPIs.map((kpi, i) => (
              <Card 
                key={i} 
                className={cn(
                  "cursor-pointer hover:border-accent transition-colors",
                  kpi.urgent && "border-danger/50"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-text-muted mb-1">{kpi.label}</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        kpi.urgent ? "text-danger" : "text-brand"
                      )}>
                        {kpi.value}
                      </p>
                      <p className="text-xs text-text-muted mt-1">{kpi.subtext}</p>
                    </div>
                    <div className="p-2 bg-surface-mid rounded-lg">
                      <kpi.icon className={cn(
                        "w-5 h-5",
                        kpi.urgent ? "text-danger" : "text-brand"
                      )} />
                    </div>
                  </div>
                  {kpi.trend && (
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={cn(
                        "w-3 h-3",
                        kpi.trend.startsWith("-") ? "text-success" : "text-accent"
                      )} />
                      <span className={cn(
                        "text-xs font-medium",
                        kpi.trend.startsWith("-") ? "text-success" : "text-accent"
                      )}>
                        {kpi.trend}
                      </span>
                      <span className="text-xs text-text-muted">vs last week</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Tables */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Bookings */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
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
                        {mockUpcomingBookings.map((booking) => {
                          const priority = getPriorityBadge(booking.priority);
                          const status = getStatusBadge(booking.status);
                          return (
                            <tr 
                              key={booking.id} 
                              className="border-b border-border last:border-0 hover:bg-surface-mid/50 cursor-pointer"
                            >
                              <td className="py-3">
                                <span className="font-medium text-sm">{booking.time}</span>
                              </td>
                              <td className="py-3">
                                <div className="text-sm font-medium">{booking.customer}</div>
                                <div className="text-xs text-text-muted font-mono">{booking.phone}</div>
                              </td>
                              <td className="py-3">
                                <Badge variant="outline" className="text-xs">{booking.service}</Badge>
                              </td>
                              <td className="py-3">
                                <Badge variant={priority.variant} className="text-xs">{priority.label}</Badge>
                              </td>
                              <td className="py-3">
                                <span className={cn(
                                  "text-sm",
                                  booking.tech === "Unassigned" ? "text-danger font-medium" : "text-text-primary"
                                )}>
                                  {booking.tech}
                                </span>
                              </td>
                              <td className="py-3">
                                <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Intake Sessions */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Intake Sessions</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockIntakeSessions.map((session) => {
                      const urgency = getUrgencyBadge(session.urgency);
                      const ChannelIcon = getChannelIcon(session.channel);
                      return (
                        <div 
                          key={session.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-surface-mid/50 transition-colors",
                            session.urgency >= 9 ? "border-danger/50 bg-danger/5" : "border-border"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              session.urgency >= 9 ? "bg-danger/10" : "bg-surface-mid"
                            )}>
                              <ChannelIcon className={cn(
                                "w-4 h-4",
                                session.urgency >= 9 ? "text-danger" : "text-text-muted"
                              )} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{session.customer}</span>
                                <Badge variant="outline" className="text-xs">{session.channel}</Badge>
                              </div>
                              <p className="text-xs text-text-muted line-clamp-1">{session.issue}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={urgency.variant} className="text-xs">
                              {session.urgency >= 9 && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {urgency.label}
                            </Badge>
                            <span className="text-xs text-text-muted">{session.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                  <div className="space-y-4">
                    {mockActivityFeed.map((activity, i) => {
                      const icons = {
                        intake: Inbox,
                        booking: CalendarCheck,
                        call: Phone,
                        assign: UserPlus,
                        escalation: AlertTriangle,
                      };
                      const Icon = icons[activity.type as keyof typeof icons];
                      const colors = {
                        intake: "text-info bg-info/10",
                        booking: "text-success bg-success/10",
                        call: "text-brand bg-brand/10",
                        assign: "text-accent bg-accent/10",
                        escalation: "text-danger bg-danger/10",
                      };
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            colors[activity.type as keyof typeof colors]
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary">{activity.text}</p>
                            <p className="text-xs text-text-muted">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="ghost" className="w-full mt-4" size="sm">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}