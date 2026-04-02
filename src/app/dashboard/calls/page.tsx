'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Phone,
  PhoneIncoming,
  Clock,
  CalendarCheck,
  AlertTriangle,
  FileText,
  Loader2,
  Filter,
  ExternalLink,
  PhoneOff,
  Voicemail,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays, isToday } from 'date-fns';

// ── Types ──────────────────────────────────────────────────────────────

type Call = {
  _id: Id<'calls'>;
  companyId: Id<'companies'>;
  callerPhone?: string;
  callerName?: string;
  duration?: number;
  outcome: 'booked' | 'escalated' | 'abandoned' | 'voicemail';
  urgencyScore?: number;
  transcriptText?: string;
  aiSummary?: string;
  callSid?: string;
  linkedIntakeSessionId?: Id<'intakeSessions'>;
  createdAt: number;
};

type OutcomeFilter = 'all' | 'booked' | 'escalated' | 'abandoned' | 'voicemail';
type DateFilter = 'today' | '7days' | '30days' | 'all';

// ── Helpers ────────────────────────────────────────────────────────────

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getOutcomeBadge(outcome: string) {
  switch (outcome) {
    case 'booked':
      return { label: 'Booked', variant: 'success' as const, icon: CalendarCheck };
    case 'escalated':
      return { label: 'Escalated', variant: 'danger' as const, icon: AlertTriangle };
    case 'abandoned':
      return { label: 'Abandoned', variant: 'warning' as const, icon: PhoneOff };
    case 'voicemail':
      return { label: 'Voicemail', variant: 'muted' as const, icon: Voicemail };
    default:
      return { label: outcome, variant: 'outline' as const, icon: Phone };
  }
}

function getUrgencyBadge(score?: number) {
  if (!score) return { label: 'Unknown', variant: 'muted' as const };
  if (score >= 8) return { label: `Urgent (${score})`, variant: 'danger' as const };
  if (score >= 5) return { label: `Medium (${score})`, variant: 'warning' as const };
  return { label: `Low (${score})`, variant: 'outline' as const };
}

// ── Main Component ─────────────────────────────────────────────────────

export default function CallsPage() {
  const { companyId, isLoading: companyLoading } = useCurrentCompany();

  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Build date range
  const dateRange = useMemo(() => {
    const now = Date.now();
    switch (dateFilter) {
      case 'today':
        return { start: startOfDay(new Date()).getTime(), end: now };
      case '7days':
        return { start: subDays(new Date(), 7).getTime(), end: now };
      case '30days':
        return { start: subDays(new Date(), 30).getTime(), end: now };
      default:
        return { start: undefined, end: undefined };
    }
  }, [dateFilter]);

  // Queries
  const stats = useQuery(
    api.calls.getTodayStats,
    companyId ? { companyId } : 'skip'
  );

  const calls = useQuery(
    api.calls.list,
    companyId
      ? {
          companyId,
          outcome: outcomeFilter !== 'all' ? outcomeFilter : undefined,
          startDate: dateRange.start,
          endDate: dateRange.end,
        }
      : 'skip'
  );

  // ── Loading ──────────────────────────────────────────────────────────

  if (companyLoading || !companyId) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  // ── Transcript dialog ────────────────────────────────────────────────

  const openTranscript = (call: Call) => {
    setSelectedCall(call);
    setDialogOpen(true);
  };

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Call Log</h1>
        <p className="text-sm text-text-muted">
          Track and review all incoming calls handled by the AI assistant
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <PhoneIncoming className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats?.totalCalls ?? '—'}
              </p>
              <p className="text-xs text-text-muted">Calls today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats ? formatDuration(stats.avgDuration) : '—'}
              </p>
              <p className="text-xs text-text-muted">Avg duration</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats?.bookedCount ?? '—'}
              </p>
              <p className="text-xs text-text-muted">Converted to booking</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats?.escalatedCount ?? '—'}
              </p>
              <p className="text-xs text-text-muted">Escalated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-text-muted">
          <Filter className="h-4 w-4" />
          Filters:
        </div>

        {/* Outcome filter */}
        <div className="flex gap-1">
          {(['all', 'booked', 'escalated', 'abandoned', 'voicemail'] as OutcomeFilter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setOutcomeFilter(f)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  outcomeFilter === f
                    ? 'bg-brand text-white'
                    : 'bg-surface-mid text-text-muted hover:text-text-primary'
                )}
              >
                {f === 'all' ? 'All outcomes' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Date filter */}
        <div className="flex gap-1">
          {([
            { key: 'today', label: 'Today' },
            { key: '7days', label: '7 days' },
            { key: '30days', label: '30 days' },
            { key: 'all', label: 'All time' },
          ] as { key: DateFilter; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateFilter(key)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                dateFilter === key
                  ? 'bg-brand text-white'
                  : 'bg-surface-mid text-text-muted hover:text-text-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Call log table */}
      {calls === undefined ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : calls.length === 0 ? (
        <EmptyState
          icon={<Phone className="h-6 w-6" />}
          heading="No calls recorded yet."
          body="When calls come in through the AI voice assistant, they'll appear here with transcripts and outcomes."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-mid/50">
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Caller</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Outcome</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Urgency</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Transcript</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Intake</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {calls.map((call: Call) => {
                  const outcome = getOutcomeBadge(call.outcome);
                  const urgency = getUrgencyBadge(call.urgencyScore);
                  return (
                    <tr
                      key={call._id}
                      className="hover:bg-surface-mid/30 transition-colors"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-text-primary">
                        <div>
                          {format(new Date(call.createdAt), 'h:mm a')}
                        </div>
                        <div className="text-xs text-text-muted">
                          {isToday(new Date(call.createdAt))
                            ? 'Today'
                            : format(new Date(call.createdAt), 'MMM d')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-primary">
                          {call.callerName || 'Unknown'}
                        </div>
                        <div className="text-xs text-text-muted">
                          {call.callerPhone || '—'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-primary font-mono text-xs">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={outcome.variant}>
                          {outcome.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={urgency.variant}>
                          {urgency.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {call.transcriptText ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTranscript(call)}
                          >
                            <FileText className="mr-1.5 h-3.5 w-3.5" />
                            View
                          </Button>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {call.linkedIntakeSessionId ? (
                          <a
                            href={`/dashboard/intake/${call.linkedIntakeSessionId}`}
                            className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                          >
                            View intake
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Transcript dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {selectedCall && (
            <>
              <DialogHeader>
                <DialogTitle>Call Transcript</DialogTitle>
                <DialogDescription>
                  {selectedCall.callerPhone || 'Unknown number'} &middot;{' '}
                  {format(new Date(selectedCall.createdAt), 'MMM d, yyyy h:mm a')}
                </DialogDescription>
              </DialogHeader>

              {/* Call meta */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-surface-mid p-3">
                  <p className="text-xs text-text-muted">Duration</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {formatDuration(selectedCall.duration)}
                  </p>
                </div>
                <div className="rounded-lg bg-surface-mid p-3">
                  <p className="text-xs text-text-muted">Outcome</p>
                  <div className="mt-0.5">
                    <Badge variant={getOutcomeBadge(selectedCall.outcome).variant}>
                      {getOutcomeBadge(selectedCall.outcome).label}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-lg bg-surface-mid p-3">
                  <p className="text-xs text-text-muted">Call SID</p>
                  <p className="text-xs font-mono text-text-primary truncate" title={selectedCall.callSid}>
                    {selectedCall.callSid || '—'}
                  </p>
                </div>
              </div>

              {/* AI Summary */}
              {selectedCall.aiSummary && (
                <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <p className="mb-1 text-xs font-semibold text-accent uppercase tracking-wide">
                    AI Summary
                  </p>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {selectedCall.aiSummary}
                  </p>
                </div>
              )}

              {/* Full transcript */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Full Transcript
                </p>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-surface-mid/50 p-4 text-sm leading-relaxed text-text-primary whitespace-pre-wrap font-mono">
                  {selectedCall.transcriptText || 'No transcript available.'}
                </div>
              </div>

              {/* Linked intake */}
              {selectedCall.linkedIntakeSessionId && (
                <div className="mt-4">
                  <a
                    href={`/dashboard/intake/${selectedCall.linkedIntakeSessionId}`}
                    className="inline-flex items-center gap-2 text-sm text-brand hover:underline font-medium"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    View linked intake session
                  </a>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
