'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Phone,
  Globe,
  MessageSquare,
  AlertTriangle,
  User,
  Clock,
  MapPin,
  Tag,
  FileText,
  CheckCircle,
  ArrowUpCircle,
  CalendarPlus,
  ChevronRight,
  Search,
  Filter,
  StickyNote,
  Printer,
  Loader2,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ── Helpers ────────────────────────────────────────────────────────────

type IntakeSession = {
  _id: Id<'intakeSessions'>;
  companyId: Id<'companies'>;
  channel: 'WEB' | 'SMS' | 'VOICE';
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  propertyType?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  issueRaw: string;
  aiSummary?: string;
  serviceCategory?: string;
  urgencyScore?: number;
  tags?: string[];
  status: 'new' | 'assigned' | 'in_progress' | 'resolved' | 'escalated';
  assignedTechId?: Id<'memberships'>;
  accessNotes?: string;
  pets?: string;
  gateCode?: string;
  dispatchNotes?: string;
  createdAt: number;
};

type Member = {
  _id: Id<'memberships'>;
  name: string;
  role: string;
  status: string;
};

function getUrgencyBadge(score: number) {
  if (score >= 9) return { label: 'EMERGENCY', variant: 'danger' as const };
  if (score >= 7) return { label: 'URGENT', variant: 'warning' as const };
  if (score >= 4) return { label: 'STANDARD', variant: 'outline' as const };
  return { label: 'LOW', variant: 'muted' as const };
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case 'WEB': return Globe;
    case 'SMS': return MessageSquare;
    case 'VOICE': return Phone;
    default: return Inbox;
  }
}

function getChannelLabel(channel: string) {
  switch (channel) {
    case 'WEB': return 'Web';
    case 'SMS': return 'SMS';
    case 'VOICE': return 'Voice';
    default: return channel;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'new': return { label: 'New', variant: 'default' as const };
    case 'assigned': return { label: 'Assigned', variant: 'accent' as const };
    case 'in_progress': return { label: 'In Progress', variant: 'warning' as const };
    case 'resolved': return { label: 'Resolved', variant: 'success' as const };
    case 'escalated': return { label: 'Escalated', variant: 'danger' as const };
    default: return { label: status, variant: 'outline' as const };
  }
}

// ── Filter types ───────────────────────────────────────────────────────

type FilterPreset = 'all' | 'new' | 'assigned' | 'emergency' | 'by_channel';
type SortMode = 'urgency' | 'newest' | 'oldest';
type ChannelFilter = 'WEB' | 'SMS' | 'VOICE' | undefined;

// ── Main Component ─────────────────────────────────────────────────────

export default function InboxPage() {
  const { companyId, isLoading: companyLoading } = useCurrentCompany();

  // Filters
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>(undefined);
  const [sortMode, setSortMode] = useState<SortMode>('urgency');
  const [selectedId, setSelectedId] = useState<Id<'intakeSessions'> | null>(null);
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [assigningTech, setAssigningTech] = useState(false);

  // Build query args
  const queryArgs = companyId
    ? {
        companyId: companyId as Id<'companies'>,
        ...(filterPreset === 'new' ? { status: 'new' as const } : {}),
        ...(filterPreset === 'assigned' ? { status: 'assigned' as const } : {}),
        ...(filterPreset === 'emergency' ? { minUrgency: 9 } : {}),
        ...(filterPreset === 'by_channel' && channelFilter
          ? { channel: channelFilter.toLowerCase() as any }
          : {}),
      }
    : 'skip';

  const sessions = useQuery(api.intakeSessions.list, queryArgs as any);
  const members = useQuery(
    api.memberships.getMembers,
    companyId ? { companyId: companyId as Id<'companies'> } : 'skip'
  );
  const techs = (members ?? []).filter(
    (m: Member) => m.role === 'tech' || m.role === 'owner'
  );

  // Mutations
  const assignTech = useMutation(api.intakeSessions.assignTech);
  const markResolved = useMutation(api.intakeSessions.markResolved);
  const escalate = useMutation(api.intakeSessions.escalate);
  const updateSession = useMutation(api.intakeSessions.update);

  // Sort sessions client-side
  const sortedSessions = [...(sessions ?? [])].sort((a: any, b: any) => {
    if (sortMode === 'urgency') return (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0);
    if (sortMode === 'newest') return b.createdAt - a.createdAt;
    return a.createdAt - b.createdAt;
  }) as IntakeSession[];

  const selectedSession = sortedSessions.find((s) => s._id === selectedId) ?? null;
  const assignedTech = selectedSession?.assignedTechId
    ? (members ?? []).find((m: any) => m._id === selectedSession.assignedTechId)
    : null;

  // Handlers
  const handleAssignTech = async (techId: Id<'memberships'>) => {
    if (!selectedSession) return;
    await assignTech({ id: selectedSession._id, techId });
    setAssigningTech(false);
  };

  const handleMarkResolved = async () => {
    if (!selectedSession) return;
    await markResolved({ id: selectedSession._id });
  };

  const handleEscalate = async () => {
    if (!selectedSession) return;
    await escalate({ id: selectedSession._id });
  };

  const handleAddNote = async () => {
    if (!selectedSession || !noteText.trim()) return;
    const existing = selectedSession.dispatchNotes ?? '';
    const timestamp = new Date().toLocaleString();
    const updated = `${existing}\n[${timestamp}] ${noteText.trim()}`.trim();
    await updateSession({ id: selectedSession._id, notes: updated });
    setNoteText('');
    setShowNoteInput(false);
  };

  // ── Loading state ────────────────────────────────────────────────────

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
          <Inbox className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">No Company Selected</h2>
          <p className="text-text-muted text-sm mt-1">Please set up your company first.</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col">
      {/* Page Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Intake Inbox</h1>
          <p className="text-sm text-text-muted">
            {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''}
            {filterPreset !== 'all' && ` · Filtered: ${filterPreset}`}
          </p>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel: Session List (360px) ──────────────────────────── */}
        <div className="w-full md:w-[360px] flex-shrink-0 border-r border-border flex flex-col bg-surface">
          {/* Filter Bar */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex gap-1 flex-wrap">
              {(
                [
                  ['all', 'All'],
                  ['new', 'New'],
                  ['assigned', 'Assigned'],
                  ['emergency', 'Emergency'],
                  ['by_channel', 'By Channel'],
                ] as [FilterPreset, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setFilterPreset(key);
                    if (key !== 'by_channel') setChannelFilter(undefined);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    filterPreset === key
                      ? 'bg-brand text-white'
                      : 'bg-surface-mid text-text-muted hover:text-text-primary'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Channel sub-filter */}
            {filterPreset === 'by_channel' && (
              <div className="flex gap-1">
                {(['WEB', 'SMS', 'VOICE'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                      channelFilter === ch
                        ? 'bg-accent text-white'
                        : 'bg-surface-mid text-text-muted hover:text-text-primary'
                    )}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Sort:</span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="text-xs bg-surface-mid border border-border rounded-md px-2 py-1 text-text-primary"
              >
                <option value="urgency">Urgency</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Session Cards */}
          <div className="flex-1 overflow-y-auto">
            {sessions === undefined ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : sortedSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Inbox className="w-10 h-10 text-text-muted mb-3" />
                <p className="text-sm font-medium text-text-primary">No sessions</p>
                <p className="text-xs text-text-muted text-center mt-1">
                  {filterPreset !== 'all'
                    ? 'Try a different filter to see sessions.'
                    : 'New intake sessions will appear here.'}
                </p>
              </div>
            ) : (
              sortedSessions.map((session) => {
                const urgency = getUrgencyBadge(session.urgencyScore ?? 5);
                const ChannelIcon = getChannelIcon(session.channel);
                const isEmergency = (session.urgencyScore ?? 0) >= 9;
                const isSelected = selectedId === session._id;
                const tech = session.assignedTechId
                  ? (members ?? []).find((m: any) => m._id === session.assignedTechId)
                  : null;

                return (
                  <button
                    key={session._id}
                    onClick={() => setSelectedId(session._id)}
                    className={cn(
                      'w-full text-left p-3 border-b border-border transition-colors relative',
                      isSelected
                        ? 'bg-brand/5 border-l-2 border-l-brand'
                        : 'hover:bg-surface-mid/50',
                      isEmergency && !isSelected && 'border-l-2 border-l-danger'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {/* Emergency pulsing dot */}
                      {isEmergency && (
                        <span className="mt-1.5 flex-shrink-0">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger" />
                          </span>
                        </span>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Top row: name + badges */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {session.customerName}
                          </span>
                          <Badge variant={urgency.variant} className="text-[10px] px-1.5 py-0">
                            {urgency.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <ChannelIcon className="w-2.5 h-2.5 mr-0.5" />
                            {session.channel}
                          </Badge>
                        </div>

                        {/* Issue summary (truncated to ~80 chars) */}
                        <p className="text-xs text-text-muted line-clamp-2 mb-1.5">
                          {(session.aiSummary ?? session.issueRaw).slice(0, 80)}
                          {(session.aiSummary ?? session.issueRaw).length > 80 ? '…' : ''}
                        </p>

                        {/* Bottom row: time + tech */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-text-muted">
                            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                          </span>
                          {tech ? (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-surface-mid rounded-full px-2 py-0.5 text-text-muted">
                              <User className="w-2.5 h-2.5" />
                              {(tech as any).name}
                            </span>
                          ) : (
                            <span className="text-[11px] text-danger font-medium">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Panel: Detail View (mobile: overlay, desktop: inline) ── */}
        <div className={cn(
          "flex-1 overflow-y-auto bg-background",
          selectedSession ? "fixed inset-0 z-30 md:relative md:inset-auto md:z-auto" : "hidden md:block"
        )}>
          {!selectedSession ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-full bg-surface-mid flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Select a Session</h3>
              <p className="text-sm text-text-muted max-w-sm">
                Click on an intake session from the list to view details, assign a tech, or create a booking.
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 max-w-3xl">
              {/* Session Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-text-primary">
                      {selectedSession.customerName}
                    </h2>
                    {(() => {
                      const urgency = getUrgencyBadge(selectedSession.urgencyScore ?? 5);
                      return (
                        <Badge variant={urgency.variant}>
                          {(selectedSession.urgencyScore ?? 0) >= 9 && (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {urgency.label} ({selectedSession.urgencyScore ?? '?'}/10)
                        </Badge>
                      );
                    })()}
                    {(() => {
                      const st = getStatusBadge(selectedSession.status);
                      return <Badge variant={st.variant}>{st.label}</Badge>;
                    })()}
                  </div>
                  <p className="text-sm text-text-muted">
                    Session created{' '}
                    {formatDistanceToNow(new Date(selectedSession.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 hover:bg-surface-mid rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssigningTech(!assigningTech)}
                  >
                    <User className="w-4 h-4 mr-1" />
                    {assignedTech ? `Reassign (${(assignedTech as any).name})` : 'Assign Tech'}
                  </Button>
                  {assigningTech && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-surface border border-border rounded-lg shadow-lg z-10 py-1">
                      {techs.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-text-muted">No techs available</p>
                      ) : (
                        techs.map((tech: any) => (
                          <button
                            key={tech._id}
                            onClick={() => handleAssignTech(tech._id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-surface-mid transition-colors flex items-center gap-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-medium">
                              {tech.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{tech.name}</div>
                              <div className="text-xs text-text-muted capitalize">{tech.role}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowBookingDrawer(true)}
                >
                  <CalendarPlus className="w-4 h-4 mr-1" />
                  Create Booking
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                >
                  <StickyNote className="w-4 h-4 mr-1" />
                  Add Note
                </Button>

                {selectedSession.status !== 'resolved' && (
                  <Button variant="ghost" size="sm" onClick={handleMarkResolved}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Resolved
                  </Button>
                )}

                {selectedSession.status !== 'escalated' && (
                  <Button variant="ghost" size="sm" onClick={handleEscalate}>
                    <ArrowUpCircle className="w-4 h-4 mr-1 text-danger" />
                    <span className="text-danger">Escalate</span>
                  </Button>
                )}
              </div>

              {/* Note Input */}
              {showNoteInput && (
                <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note to this session..."
                    className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand/50"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>
                      Save Note
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowNoteInput(false);
                        setNoteText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-brand" />
                      Customer Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-text-muted">Name:</span>{' '}
                      <span className="font-medium">{selectedSession.customerName}</span>
                    </div>
                    {selectedSession.customerPhone && (
                      <div>
                        <span className="text-text-muted">Phone:</span>{' '}
                        <span className="font-mono">{selectedSession.customerPhone}</span>
                      </div>
                    )}
                    {selectedSession.customerEmail && (
                      <div>
                        <span className="text-text-muted">Email:</span>{' '}
                        <span>{selectedSession.customerEmail}</span>
                      </div>
                    )}
                    {selectedSession.propertyType && (
                      <div>
                        <span className="text-text-muted">Property:</span>{' '}
                        <span className="capitalize">{selectedSession.propertyType}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedSession.addressStreet ? (
                      <>
                        <div>{selectedSession.addressStreet}</div>
                        <div>
                          {[selectedSession.addressCity, selectedSession.addressState, selectedSession.addressZip]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      </>
                    ) : (
                      <p className="text-text-muted italic">No address provided</p>
                    )}
                    {selectedSession.gateCode && (
                      <div>
                        <span className="text-text-muted">Gate Code:</span>{' '}
                        <span className="font-mono font-medium">{selectedSession.gateCode}</span>
                      </div>
                    )}
                    {selectedSession.pets && (
                      <div>
                        <span className="text-text-muted">Pets:</span>{' '}
                        <span>{selectedSession.pets}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Issue Details */}
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand" />
                    Issue Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const ChannelIcon = getChannelIcon(selectedSession.channel);
                      return (
                        <Badge variant="outline">
                          <ChannelIcon className="w-3 h-3 mr-1" />
                          {getChannelLabel(selectedSession.channel)}
                        </Badge>
                      );
                    })()}
                    {selectedSession.serviceCategory && (
                      <Badge variant="accent">
                        <Tag className="w-3 h-3 mr-1" />
                        {selectedSession.serviceCategory}
                      </Badge>
                    )}
                    {selectedSession.tags?.map((tag) => (
                      <Badge key={tag} variant="muted" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {selectedSession.aiSummary && (
                    <div className="p-3 bg-brand/5 rounded-lg border border-brand/20">
                      <p className="text-xs font-medium text-brand mb-1">AI Summary</p>
                      <p className="text-sm text-text-primary">{selectedSession.aiSummary}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-text-muted mb-1">Original Issue</p>
                    <p className="text-sm text-text-primary whitespace-pre-wrap">
                      {selectedSession.issueRaw}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Dispatch Packet */}
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-brand" />
                      Dispatch Packet
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => window.print()}>
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-text-muted">Customer:</span>{' '}
                      {selectedSession.customerName}
                    </div>
                    <div>
                      <span className="text-text-muted">Phone:</span>{' '}
                      {selectedSession.customerPhone ?? 'N/A'}
                    </div>
                    <div>
                      <span className="text-text-muted">Service:</span>{' '}
                      {selectedSession.serviceCategory ?? 'N/A'}
                    </div>
                    <div>
                      <span className="text-text-muted">Urgency:</span>{' '}
                      {selectedSession.urgencyScore ?? 'N/A'}/10
                    </div>
                  </div>
                  {selectedSession.accessNotes && (
                    <div className="p-2 bg-warning/10 rounded border border-warning/20">
                      <span className="text-xs font-medium text-warning">Access Notes: </span>
                      <span className="text-sm">{selectedSession.accessNotes}</span>
                    </div>
                  )}
                  {selectedSession.dispatchNotes && (
                    <div>
                      <p className="text-xs font-medium text-text-muted mb-1">Dispatch Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedSession.dispatchNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* ── Booking Drawer (slide-over) ───────────────────────────────── */}
      {showBookingDrawer && selectedSession && (
        <BookingDrawer
          session={selectedSession}
          companyId={companyId as Id<'companies'>}
          techs={techs}
          onClose={() => setShowBookingDrawer(false)}
        />
      )}
    </div>
  );
}

// ── Booking Drawer Component ───────────────────────────────────────────

function BookingDrawer({
  session,
  companyId,
  techs,
  onClose,
}: {
  session: IntakeSession;
  companyId: Id<'companies'>;
  techs: any[];
  onClose: () => void;
}) {
  const createBooking = useMutation(api.bookings.create);

  const [form, setForm] = useState({
    customerName: session.customerName,
    customerPhone: session.customerPhone ?? '',
    customerAddress: [session.addressStreet, session.addressCity, session.addressState, session.addressZip]
      .filter(Boolean)
      .join(', '),
    serviceType: session.serviceCategory ?? '',
    description: session.aiSummary ?? session.issueRaw,
    priority: (session.urgencyScore ?? 5) >= 9
      ? 'EMERGENCY'
      : (session.urgencyScore ?? 5) >= 7
        ? 'URGENT'
        : (session.urgencyScore ?? 5) >= 4
          ? 'STANDARD'
          : 'LOW',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    estimatedDuration: 60,
    techId: '' as string,
    notes: session.accessNotes ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBooking({
        companyId,
        intakeSessionId: session._id,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress,
        serviceType: form.serviceType,
        description: form.description,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        estimatedDuration: form.estimatedDuration,
        priority: form.priority as any,
        notes: form.notes,
        ...(form.techId ? { techId: form.techId as Id<'memberships'> } : {}),
      });
      onClose();
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-surface border-l border-border shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Create Booking</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-surface-mid rounded-lg">
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Customer Name</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Phone</label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Address</label>
              <input
                type="text"
                value={form.customerAddress}
                onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Service Type</label>
                <input
                  type="text"
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
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
              <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/50"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Date</label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Time</label>
                <input
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Assign Technician</label>
              <select
                value={form.techId}
                onChange={(e) => setForm({ ...form, techId: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              >
                <option value="">Unassigned</option>
                {techs.map((t: any) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Access / Dispatch Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/50"
                rows={2}
                placeholder="Gate code, pet info, parking instructions..."
              />
            </div>

            <div className="flex gap-2 pt-2">
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
