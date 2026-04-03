'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  User,
  CalendarClock,
  XCircle,
  Loader2,
  X,
  Phone,
  MessageSquare,
  CheckSquare,
  Clock,
} from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

// ── Types ──────────────────────────────────────────────────────────────

type Booking = {
  _id: Id<'bookings'>;
  companyId: Id<'companies'>;
  intakeSessionId?: Id<'intakeSessions'>;
  customerName: string;
  customerPhone?: string;
  serviceCategory?: string;
  priority: 'EMERGENCY' | 'URGENT' | 'STANDARD' | 'LOW';
  scheduledDate: string;
  timeWindow?: string;
  technicianId?: Id<'memberships'>;
  technicianName?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  diagnosticFee?: number;
  accessNotes?: string;
  dispatchNotes?: string;
  source: 'web' | 'sms' | 'voice' | 'manual';
  createdAt: number;
};

type Member = {
  _id: Id<'memberships'>;
  name: string;
  role: string;
  status: string;
};

// ── Helpers ────────────────────────────────────────────────────────────

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'EMERGENCY': return { label: 'Emergency', variant: 'danger' as const };
    case 'URGENT': return { label: 'Urgent', variant: 'warning' as const };
    case 'STANDARD': return { label: 'Standard', variant: 'outline' as const };
    case 'LOW': return { label: 'Low', variant: 'muted' as const };
    default: return { label: priority, variant: 'outline' as const };
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'scheduled': return { label: 'Scheduled', variant: 'outline' as const };
    case 'confirmed': return { label: 'Confirmed', variant: 'success' as const };
    case 'in_progress': return { label: 'In Progress', variant: 'warning' as const };
    case 'completed': return { label: 'Completed', variant: 'success' as const };
    case 'cancelled': return { label: 'Cancelled', variant: 'danger' as const };
    default: return { label: status, variant: 'outline' as const };
  }
}

type TabKey = 'today' | 'upcoming' | 'all' | 'cancelled';

// ── Main Component ─────────────────────────────────────────────────────

export default function BookingsPage() {
  const { companyId, isLoading: companyLoading } = useCurrentCompany();

  // Tab & filters
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [techFilter, setTechFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<Id<'bookings'> | null>(null);

  const todayDate = new Date().toISOString().split('T')[0];

  // Build query args based on tab
  const queryArgs = companyId
    ? {
        companyId: companyId as Id<'companies'>,
        ...(activeTab === 'today' ? { date: todayDate } : {}),
        ...(activeTab === 'cancelled' ? { status: 'cancelled' as const } : {}),
        ...(statusFilter ? { status: statusFilter as any } : {}),
        ...(priorityFilter ? { priority: priorityFilter as any } : {}),
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
      }
    : 'skip';

  // Use getUpcoming for upcoming tab, list for others
  const allBookings = useQuery(
    api.bookings.list,
    activeTab !== 'upcoming' ? (queryArgs as any) : 'skip'
  );
  const upcomingBookings = useQuery(
    api.bookings.getUpcoming,
    activeTab === 'upcoming' && companyId
      ? { companyId: companyId as Id<'companies'> }
      : 'skip'
  );

  const members = useQuery(
    api.memberships.getMembers,
    companyId ? { companyId: companyId as Id<'companies'> } : 'skip'
  );
  const techs = (members ?? []).filter(
    (m: Member) => m.role === 'tech' || m.role === 'owner'
  );

  // Mutations
  const cancelBooking = useMutation(api.bookings.cancel);
  const updateBooking = useMutation(api.bookings.update);

  // Select data source based on tab
  const rawBookings = activeTab === 'upcoming' ? upcomingBookings : allBookings;

  // Client-side tech filter (since API doesn't have it for upcoming)
  const bookings = useMemo(() => {
    let list = (rawBookings ?? []) as Booking[];
    if (techFilter) {
      list = list.filter((b) => b.technicianId === techFilter);
    }
    return list;
  }, [rawBookings, techFilter]);

  // Handlers
  const handleCancel = async (id: Id<'bookings'>) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking({ id });
    }
    setActionMenuId(null);
  };

  const handleAssignTech = async (bookingId: Id<'bookings'>, techId: Id<'memberships'>) => {
    const tech = techs.find((t: any) => t._id === techId);
    await updateBooking({
      id: bookingId,
      techId,
      ...(tech ? { technicianName: (tech as any).name } : {}),
    } as any);
    setActionMenuId(null);
  };

  // ── Loading ──────────────────────────────────────────────────────────

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <CalendarCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">No Company Selected</h2>
          <p className="text-text-muted text-sm mt-1">Please set up your company first.</p>
        </div>
      </div>
    );
  }

  const isLoading = rawBookings === undefined;

  // ── Render ───────────────────────────────────────────────────────────

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'all', label: 'All' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Bookings</h1>
          <p className="text-sm text-text-muted">
            Manage scheduled jobs and service appointments
          </p>
        </div>
        <Button onClick={() => setShowCreateDrawer(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Create Booking
        </Button>
      </div>

      {/* Tab Bar */}
      <div className="px-4 sm:px-6 bg-surface border-b border-border overflow-x-auto">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setStatusFilter('');
              }}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-brand text-brand'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 sm:px-6 py-3 bg-surface border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name or phone..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
        </div>

        {/* Status filter */}
        {activeTab !== 'cancelled' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        )}

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          <option value="">All Priority</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="URGENT">Urgent</option>
          <option value="STANDARD">Standard</option>
          <option value="LOW">Low</option>
        </select>

        {/* Tech filter */}
        <select
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          <option value="">All Techs</option>
          {techs.map((t: any) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="bg-surface rounded-xl border border-border overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-surface-mid/50">
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Time</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Service</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Priority</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Tech</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const priority = getPriorityBadge(booking.priority);
                  const status = getStatusBadge(booking.status);
                  const isMenuOpen = actionMenuId === booking._id;

                  return (
                    <tr
                      key={booking._id}
                      className="border-b border-border last:border-0 hover:bg-surface-mid/30 cursor-pointer transition-colors"
                      onClick={() => {
                        window.location.href = `/dashboard/bookings/${booking._id}`;
                      }}
                    >
                      {/* Time */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">
                          {booking.timeWindow ?? '—'}
                        </div>
                        <div className="text-xs text-text-muted">
                          {(() => {
                            try {
                              return format(parseISO(booking.scheduledDate), 'MMM d, yyyy');
                            } catch {
                              return booking.scheduledDate;
                            }
                          })()}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-text-primary">
                          {booking.customerName}
                        </div>
                        {booking.customerPhone && (
                          <div className="text-xs text-text-muted font-mono">
                            {booking.customerPhone}
                          </div>
                        )}
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          {booking.serviceCategory ?? '—'}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <Badge variant={priority.variant} className="text-xs">
                          {priority.label}
                        </Badge>
                      </td>

                      {/* Tech */}
                      <td className="px-4 py-3">
                        {booking.technicianName ? (
                          <span className="inline-flex items-center gap-1 text-sm">
                            <User className="w-3.5 h-3.5 text-text-muted" />
                            {booking.technicianName}
                          </span>
                        ) : (
                          <span className="text-sm text-danger font-medium">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuId(isMenuOpen ? null : booking._id);
                            }}
                            className="p-1.5 hover:bg-surface-mid rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-text-muted" />
                          </button>

                          {isMenuOpen && (
                            <div
                              className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg z-20 py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a
                                href={`/dashboard/bookings/${booking._id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-mid transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </a>

                              {/* Assign submenu */}
                              <div className="relative group">
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-mid transition-colors">
                                  <User className="w-4 h-4" />
                                  Assign Tech
                                </button>
                                <div className="hidden group-hover:block absolute left-full top-0 w-44 bg-surface border border-border rounded-lg shadow-lg py-1">
                                  {techs.map((t: any) => (
                                    <button
                                      key={t._id}
                                      onClick={() => handleAssignTech(booking._id, t._id)}
                                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-mid"
                                    >
                                      {t.name}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-mid transition-colors">
                                <CalendarClock className="w-4 h-4" />
                                Reschedule
                              </button>

                              {booking.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleCancel(booking._id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Booking Drawer */}
      {showCreateDrawer && (
        <CreateBookingDrawer
          companyId={companyId as Id<'companies'>}
          techs={techs}
          onClose={() => setShowCreateDrawer(false)}
        />
      )}
    </div>
  );
}

// ── Empty States ───────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabKey }) {
  const messages: Record<TabKey, { icon: any; title: string; desc: string }> = {
    today: {
      icon: CalendarCheck,
      title: 'No bookings today',
      desc: 'There are no scheduled jobs for today. Create a new booking to get started.',
    },
    upcoming: {
      icon: Clock,
      title: 'No upcoming bookings',
      desc: 'There are no upcoming bookings scheduled. New bookings will appear here.',
    },
    all: {
      icon: CalendarCheck,
      title: 'No bookings yet',
      desc: 'Create your first booking to start managing jobs.',
    },
    cancelled: {
      icon: XCircle,
      title: 'No cancelled bookings',
      desc: 'Cancelled bookings will appear here for your records.',
    },
  };

  const msg = messages[tab];
  const Icon = msg.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-14 h-14 rounded-full bg-surface-mid flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{msg.title}</h3>
      <p className="text-sm text-text-muted max-w-sm text-center">{msg.desc}</p>
    </div>
  );
}

// ── Create Booking Drawer ──────────────────────────────────────────────

function CreateBookingDrawer({
  companyId,
  techs,
  onClose,
}: {
  companyId: Id<'companies'>;
  techs: any[];
  onClose: () => void;
}) {
  const createBooking = useMutation(api.bookings.create);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    serviceType: '',
    description: '',
    priority: 'STANDARD' as string,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    timeWindow: '8am-12pm',
    estimatedDuration: 60,
    techId: '' as string,
    diagnosticFee: '',
    accessNotes: '',
    dispatchNotes: '',
    sendSms: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.serviceType || !form.scheduledDate) return;

    setSubmitting(true);
    try {
      await createBooking({
        companyId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress,
        serviceType: form.serviceType,
        description: form.description,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        estimatedDuration: form.estimatedDuration,
        priority: form.priority as any,
        notes: [form.accessNotes, form.dispatchNotes].filter(Boolean).join('\n---\n'),
        ...(form.techId ? { techId: form.techId as Id<'memberships'> } : {}),
      });
      onClose();
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface border-l border-border shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Create Booking</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-surface-mid rounded-lg">
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Info */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</p>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Name *</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => set('customerName', e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                  placeholder="Customer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => set('customerPhone', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Address *</label>
                  <input
                    type="text"
                    value={form.customerAddress}
                    onChange={(e) => set('customerAddress', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    required
                    placeholder="Service address"
                  />
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Service</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Category *</label>
                  <select
                    value={form.serviceType}
                    onChange={(e) => set('serviceType', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Appliance">Appliance</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => set('priority', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  >
                    <option value="EMERGENCY">Emergency</option>
                    <option value="URGENT">Urgent</option>
                    <option value="STANDARD">Standard</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Issue Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/50"
                  rows={3}
                  placeholder="Describe the issue..."
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Schedule</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => set('scheduledDate', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Time</label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) => set('scheduledTime', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Time Window</label>
                  <select
                    value={form.timeWindow}
                    onChange={(e) => set('timeWindow', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  >
                    <option value="8am-12pm">8am – 12pm</option>
                    <option value="12pm-4pm">12pm – 4pm</option>
                    <option value="4pm-8pm">4pm – 8pm</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Assignment & Details */}
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Assignment</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Assign Tech</label>
                  <select
                    value={form.techId}
                    onChange={(e) => set('techId', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  >
                    <option value="">Unassigned</option>
                    {techs.map((t: any) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Diagnostic Fee ($)</label>
                  <input
                    type="number"
                    value={form.diagnosticFee}
                    onChange={(e) => set('diagnosticFee', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Access Notes</label>
                <input
                  type="text"
                  value={form.accessNotes}
                  onChange={(e) => set('accessNotes', e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="Gate code, parking, pets..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Dispatch Notes</label>
                <textarea
                  value={form.dispatchNotes}
                  onChange={(e) => set('dispatchNotes', e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/50"
                  rows={2}
                  placeholder="Notes for the technician..."
                />
              </div>
            </div>

            {/* SMS Toggle */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sendSms}
                  onChange={(e) => set('sendSms', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                />
                <span className="text-sm text-text-primary">Send SMS confirmation to customer</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                Create Booking
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
