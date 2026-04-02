'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import {
  Wrench,
  Phone,
  Navigation,
  MapPin,
  Clock,
  AlertTriangle,
  DogIcon,
  KeyRound,
  StickyNote,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';

type BookingStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
type Priority = 'EMERGENCY' | 'URGENT' | 'STANDARD' | 'LOW';

const priorityConfig: Record<Priority, { label: string; variant: 'danger' | 'warning' | 'default' | 'muted' }> = {
  EMERGENCY: { label: 'EMERGENCY', variant: 'danger' },
  URGENT: { label: 'Urgent', variant: 'warning' },
  STANDARD: { label: 'Standard', variant: 'default' },
  LOW: { label: 'Low', variant: 'muted' },
};

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function MyJobsPage() {
  const { companyId, membership, isLoading: companyLoading } = useCurrentCompany();
  const [view, setView] = useState<'today' | 'week'>('today');
  const [jobNotes, setJobNotes] = useState<Record<string, string>>({});

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const technicianId = membership?._id as Id<'memberships'> | undefined;

  const jobs = useQuery(
    api.bookings.getByTechnician,
    technicianId
      ? {
          technicianId,
          startDate: view === 'today' ? today : weekStart,
          endDate: view === 'today' ? today : weekEnd,
        }
      : 'skip'
  );

  const updateStatus = useMutation(api.bookings.updateStatus);
  const updateBooking = useMutation(api.bookings.update);

  const handleStatusChange = async (jobId: Id<'bookings'>, newStatus: BookingStatus) => {
    try {
      await updateStatus({ id: jobId, status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNotes = async (jobId: Id<'bookings'>) => {
    const notes = jobNotes[jobId];
    if (!notes) return;
    try {
      await updateBooking({ id: jobId, description: notes });
      // Clear local state after save
      setJobNotes((prev) => {
        const next = { ...prev };
        delete next[jobId];
        return next;
      });
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!membership || !companyId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Wrench className="h-6 w-6" />}
          heading="No company found"
          body="Please make sure you are signed in and assigned to a company."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Jobs</h1>
        <p className="mt-1 text-sm text-text-muted">
          Your assigned service jobs — sorted by arrival window.
        </p>
      </div>

      {/* Toggle: Today / This Week */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'today' | 'week')}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Live updates note */}
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
        <RefreshCw className="h-3.5 w-3.5" />
        Jobs update in real-time as your dispatcher makes changes
      </div>

      {/* Job Cards */}
      {jobs === undefined ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-6 w-6" />}
          heading={view === 'today' ? 'No jobs assigned to you today.' : 'No jobs assigned this week.'}
          body="Check back later or contact your dispatcher."
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => {
            const isEmergency = job.priority === 'EMERGENCY';
            const pConfig = priorityConfig[job.priority as Priority] ?? priorityConfig.STANDARD;

            return (
              <Card
                key={job._id}
                className={
                  isEmergency
                    ? 'border-l-4 border-l-red-500 bg-red-50'
                    : 'border-l-4 border-l-transparent'
                }
              >
                <CardContent className="space-y-4 pt-4">
                  {/* Top row: Time window + badges */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-text-muted" />
                      <span className="text-base font-bold text-text-primary">
                        {job.timeWindow ?? 'No time set'}
                      </span>
                      {job.scheduledDate !== today && (
                        <span className="text-xs text-text-muted">
                          {job.scheduledDate}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={pConfig.variant} className={isEmergency ? 'animate-pulse' : ''}>
                        {pConfig.label}
                      </Badge>
                      {job.serviceCategory && (
                        <Badge variant="accent">{job.serviceCategory}</Badge>
                      )}
                      <Badge variant={job.status === 'completed' ? 'success' : 'outline'}>
                        {statusLabels[job.status] ?? job.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-text-primary">
                      {job.customerName}
                    </p>
                    {/* Address - schema doesn't store separate fields, show what's available */}
                    <div className="flex items-center gap-1.5 text-sm text-text-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>Address on file — check dispatch notes</span>
                    </div>
                  </div>

                  {/* Access info */}
                  {job.accessNotes && (
                    <div className="rounded-md bg-surface-mid/50 p-3 text-sm">
                      <div className="flex items-center gap-1.5 font-medium text-text-primary">
                        <KeyRound className="h-3.5 w-3.5" />
                        Access Notes
                      </div>
                      <p className="mt-1 text-text-muted">{job.accessNotes}</p>
                    </div>
                  )}

                  {/* Dispatch notes (read-only) */}
                  {job.dispatchNotes && (
                    <div className="rounded-md bg-amber-50 p-3 text-sm">
                      <div className="flex items-center gap-1.5 font-medium text-amber-800">
                        <StickyNote className="h-3.5 w-3.5" />
                        Dispatch Notes
                      </div>
                      <p className="mt-1 text-amber-700">{job.dispatchNotes}</p>
                    </div>
                  )}

                  {/* Status buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={job.status === 'confirmed' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(job._id, 'confirmed')}
                      disabled={job.status === 'completed'}
                      className="gap-1.5"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      En Route
                    </Button>
                    <Button
                      size="sm"
                      variant={job.status === 'in_progress' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(job._id, 'in_progress')}
                      disabled={job.status === 'completed'}
                      className="gap-1.5"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      On Site
                    </Button>
                    <Button
                      size="sm"
                      variant={job.status === 'completed' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(job._id, 'completed')}
                      disabled={job.status === 'completed'}
                      className="gap-1.5 bg-success text-white hover:bg-success/90 disabled:opacity-50"
                    >
                      ✓ Completed
                    </Button>
                  </div>

                  {/* Job notes textarea */}
                  {job.status !== 'completed' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-muted">
                        Add notes (visible to dispatcher)
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20"
                        rows={2}
                        placeholder="Findings, parts needed, follow-up required..."
                        value={jobNotes[job._id] ?? ''}
                        onChange={(e) =>
                          setJobNotes((prev) => ({ ...prev, [job._id]: e.target.value }))
                        }
                      />
                      {jobNotes[job._id] && (
                        <Button size="sm" onClick={() => handleSaveNotes(job._id)}>
                          Save Notes
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Contact customer */}
                  {job.customerPhone && (
                    <a
                      href={`tel:${job.customerPhone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-mid"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Contact Customer
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
