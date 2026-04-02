'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
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
  MapPin,
  Tag,
  FileText,
  CheckCircle,
  ArrowUpCircle,
  CalendarPlus,
  ChevronRight,
  Printer,
  Loader2,
  X,
  StickyNote,
  Clock,
  Home,
  Shield,
  Mic,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// ── Helpers ────────────────────────────────────────────────────────────

function getUrgencyBadge(score: number) {
  if (score >= 9) return { label: 'EMERGENCY', variant: 'danger' as const };
  if (score >= 7) return { label: 'URGENT', variant: 'warning' as const };
  if (score >= 4) return { label: 'STANDARD', variant: 'outline' as const };
  return { label: 'LOW', variant: 'muted' as const };
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
    case 'WEB': return 'Web Form';
    case 'SMS': return 'SMS / Text';
    case 'VOICE': return 'Voice Call';
    default: return channel;
  }
}

function getBookingStatusBadge(status: string) {
  switch (status) {
    case 'scheduled': return { label: 'Scheduled', variant: 'outline' as const };
    case 'confirmed': return { label: 'Confirmed', variant: 'success' as const };
    case 'in_progress': return { label: 'In Progress', variant: 'warning' as const };
    case 'completed': return { label: 'Completed', variant: 'success' as const };
    case 'cancelled': return { label: 'Cancelled', variant: 'danger' as const };
    default: return { label: status, variant: 'outline' as const };
  }
}

// ── Main Component ─────────────────────────────────────────────────────

export default function IntakeDetailPage() {
  const params = useParams();
  const sessionId = params.id as Id<'intakeSessions'>;
  const { companyId, isLoading: companyLoading } = useCurrentCompany();

  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [assigningTech, setAssigningTech] = useState(false);

  // Queries
  const session = useQuery(api.intakeSessions.getById, { id: sessionId });
  const members = useQuery(
    api.memberships.getMembers,
    companyId ? { companyId: companyId as Id<'companies'> } : 'skip'
  );
  // Check for linked booking
  const linkedBookings = useQuery(
    api.bookings.list,
    companyId ? { companyId: companyId as Id<'companies'> } : 'skip'
  );
  const linkedBooking = linkedBookings?.find(
    (b: any) => b.intakeSessionId === sessionId
  );

  const techs = (members ?? []).filter(
    (m: any) => m.role === 'tech' || m.role === 'owner'
  );
  const assignedTech = session?.assignedTechId
    ? (members ?? []).find((m: any) => m._id === session.assignedTechId)
    : null;

  // Mutations
  const assignTechMut = useMutation(api.intakeSessions.assignTech);
  const markResolved = useMutation(api.intakeSessions.markResolved);
  const escalateMut = useMutation(api.intakeSessions.escalate);
  const updateSession = useMutation(api.intakeSessions.update);

  // Handlers
  const handleAssignTech = async (techId: Id<'memberships'>) => {
    await assignTechMut({ id: sessionId, techId });
    setAssigningTech(false);
  };

  const handleMarkResolved = async () => {
    await markResolved({ id: sessionId });
  };

  const handleEscalate = async () => {
    if (confirm('Escalate this session? This will increase the urgency score.')) {
      await escalateMut({ id: sessionId });
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    const existing = session?.dispatchNotes ?? '';
    const timestamp = new Date().toLocaleString();
    const updated = `${existing}\n[${timestamp}] ${noteText.trim()}`.trim();
    await updateSession({ id: sessionId, notes: updated });
    setNoteText('');
    setShowNoteInput(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Loading ──────────────────────────────────────────────────────────

  if (companyLoading || session === undefined) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] ml-60 pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] ml-60 pt-16">
        <div className="text-center">
          <Inbox className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">Session Not Found</h2>
          <p className="text-text-muted text-sm mt-1">This intake session may have been removed.</p>
          <a href="/dashboard/inbox">
            <Button variant="outline" className="mt-4">Back to Inbox</Button>
          </a>
        </div>
      </div>
    );
  }

  const urgency = getUrgencyBadge(session.urgencyScore ?? 5);
  const statusBadge = getStatusBadge(session.status);
  const ChannelIcon = getChannelIcon(session.channel);
  const isEmergency = (session.urgencyScore ?? 0) >= 9;

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="ml-60 pt-16 min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-border bg-surface">
        <nav className="flex items-center gap-1.5 text-sm">
          <a href="/dashboard" className="text-text-muted hover:text-text-primary transition-colors">
            Dashboard
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          <a href="/dashboard/inbox" className="text-text-muted hover:text-text-primary transition-colors">
            Inbox
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-text-primary font-medium">
            Session #{sessionId.slice(-6).toUpperCase()}
          </span>
        </nav>
      </div>

      {/* Page Content */}
      <div className="p-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-text-primary">
                {session.customerName}
              </h1>
              <Badge variant={urgency.variant} className="text-sm">
                {isEmergency && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                {urgency.label} ({session.urgencyScore ?? '?'}/10)
              </Badge>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <ChannelIcon className="w-4 h-4" />
                {getChannelLabel(session.channel)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(session.createdAt), 'PPpp')}
              </span>
              <span>
                ({formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })})
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print Dispatch
            </Button>
          </div>
        </div>

        {/* Emergency Banner */}
        {isEmergency && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-xl flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-danger" />
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-danger">EMERGENCY — Urgency {session.urgencyScore}/10</p>
              <p className="text-xs text-danger/80">
                This session has been flagged as emergency priority. Immediate action required.
              </p>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-surface rounded-xl border border-border">
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

          <Button size="sm" onClick={() => setShowBookingDrawer(true)}>
            <CalendarPlus className="w-4 h-4 mr-1" />
            Create Booking
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setShowNoteInput(!showNoteInput)}>
            <StickyNote className="w-4 h-4 mr-1" />
            Add Note
          </Button>

          {session.status !== 'resolved' && (
            <Button variant="ghost" size="sm" onClick={handleMarkResolved}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Resolved
            </Button>
          )}

          {session.status !== 'escalated' && (
            <Button variant="ghost" size="sm" onClick={handleEscalate}>
              <ArrowUpCircle className="w-4 h-4 mr-1 text-danger" />
              <span className="text-danger">Escalate</span>
            </Button>
          )}
        </div>

        {/* Note Input */}
        {showNoteInput && (
          <div className="mb-6 p-4 bg-surface rounded-xl border border-border">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note to this session..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand/50"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>
                Save Note
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowNoteInput(false); setNoteText(''); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-text-muted block text-xs">Name</span>
                <span className="font-medium">{session.customerName}</span>
              </div>
              {session.customerPhone && (
                <div>
                  <span className="text-text-muted block text-xs">Phone</span>
                  <a href={`tel:${session.customerPhone}`} className="font-mono text-brand hover:underline">
                    {session.customerPhone}
                  </a>
                </div>
              )}
              {session.customerEmail && (
                <div>
                  <span className="text-text-muted block text-xs">Email</span>
                  <a href={`mailto:${session.customerEmail}`} className="text-brand hover:underline">
                    {session.customerEmail}
                  </a>
                </div>
              )}
              {session.propertyType && (
                <div>
                  <span className="text-text-muted block text-xs">Property Type</span>
                  <span className="capitalize">{session.propertyType}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand" />
                Location & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {session.addressStreet ? (
                <div>
                  <span className="text-text-muted block text-xs">Address</span>
                  <div>{session.addressStreet}</div>
                  <div>
                    {[session.addressCity, session.addressState, session.addressZip]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              ) : (
                <p className="text-text-muted italic">No address provided</p>
              )}
              {session.gateCode && (
                <div>
                  <span className="text-text-muted block text-xs">Gate Code</span>
                  <span className="font-mono font-bold text-warning">{session.gateCode}</span>
                </div>
              )}
              {session.pets && (
                <div>
                  <span className="text-text-muted block text-xs">Pets</span>
                  <span>{session.pets}</span>
                </div>
              )}
              {session.accessNotes && (
                <div>
                  <span className="text-text-muted block text-xs">Access Notes</span>
                  <span>{session.accessNotes}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-brand" />
                Assignment & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-text-muted block text-xs">Status</span>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              <div>
                <span className="text-text-muted block text-xs">Urgency Score</span>
                <span className={cn(
                  'font-bold text-lg',
                  isEmergency ? 'text-danger' : (session.urgencyScore ?? 0) >= 7 ? 'text-warning' : 'text-text-primary'
                )}>
                  {session.urgencyScore ?? '—'}/10
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-xs">Assigned Tech</span>
                {assignedTech ? (
                  <span className="inline-flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-medium">
                      {(assignedTech as any).name.charAt(0)}
                    </div>
                    {(assignedTech as any).name}
                  </span>
                ) : (
                  <span className="text-danger font-medium">Unassigned</span>
                )}
              </div>
              <div>
                <span className="text-text-muted block text-xs">Channel</span>
                <Badge variant="outline">
                  <ChannelIcon className="w-3 h-3 mr-1" />
                  {getChannelLabel(session.channel)}
                </Badge>
              </div>
              {session.serviceCategory && (
                <div>
                  <span className="text-text-muted block text-xs">Service Category</span>
                  <Badge variant="accent">
                    <Tag className="w-3 h-3 mr-1" />
                    {session.serviceCategory}
                  </Badge>
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
          <CardContent className="space-y-4">
            {session.aiSummary && (
              <div className="p-4 bg-brand/5 rounded-lg border border-brand/20">
                <p className="text-xs font-semibold text-brand mb-1.5">AI Summary</p>
                <p className="text-sm text-text-primary">{session.aiSummary}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-text-muted mb-1.5">Original Issue Report</p>
              <div className="p-4 bg-surface-mid/50 rounded-lg">
                <p className="text-sm text-text-primary whitespace-pre-wrap">{session.issueRaw}</p>
              </div>
            </div>

            {session.tags && session.tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-muted mb-1.5">Tags</p>
                <div className="flex gap-1.5 flex-wrap">
                  {session.tags.map((tag) => (
                    <Badge key={tag} variant="muted">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Transcript (if VOICE channel) */}
        {session.channel === 'VOICE' && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-brand" />
                Voice Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-surface-mid/50 rounded-lg border border-border">
                <p className="text-sm text-text-primary whitespace-pre-wrap font-mono leading-relaxed">
                  {session.issueRaw}
                </p>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Transcription from voice intake call. Review for accuracy.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dispatch Packet */}
        <Card className="mb-6" id="dispatch-packet">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-brand" />
                Dispatch Packet
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-text-muted text-xs block">Customer</span>
                  <span className="font-medium">{session.customerName}</span>
                </div>
                <div>
                  <span className="text-text-muted text-xs block">Phone</span>
                  <span className="font-mono">{session.customerPhone ?? 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-muted text-xs block">Address</span>
                  <span>
                    {session.addressStreet
                      ? `${session.addressStreet}, ${session.addressCity ?? ''} ${session.addressState ?? ''} ${session.addressZip ?? ''}`
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted text-xs block">Service</span>
                  <span>{session.serviceCategory ?? 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-muted text-xs block">Urgency</span>
                  <Badge variant={urgency.variant}>{urgency.label} ({session.urgencyScore}/10)</Badge>
                </div>
                <div>
                  <span className="text-text-muted text-xs block">Assigned Tech</span>
                  <span>{assignedTech ? (assignedTech as any).name : 'Unassigned'}</span>
                </div>
              </div>

              {session.accessNotes && (
                <div className="p-2 bg-warning/10 rounded border border-warning/20">
                  <span className="text-xs font-bold text-warning">⚠ ACCESS: </span>
                  <span className="text-sm">{session.accessNotes}</span>
                </div>
              )}

              {session.gateCode && (
                <div className="p-2 bg-surface-mid rounded">
                  <span className="text-xs font-medium text-text-muted">Gate Code: </span>
                  <span className="font-mono font-bold">{session.gateCode}</span>
                </div>
              )}

              {session.pets && (
                <div className="p-2 bg-warning/5 rounded border border-warning/10">
                  <span className="text-xs font-medium text-text-muted">Pets: </span>
                  <span className="text-sm">{session.pets}</span>
                </div>
              )}

              {session.dispatchNotes && (
                <div>
                  <span className="text-xs font-medium text-text-muted block mb-1">Dispatch Notes</span>
                  <p className="text-sm whitespace-pre-wrap bg-surface-mid/50 p-2 rounded">
                    {session.dispatchNotes}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <span className="text-xs font-medium text-text-muted block mb-1">Issue Summary</span>
                <p className="text-sm">{session.aiSummary ?? session.issueRaw}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linked Booking */}
        {linkedBooking && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <CalendarPlus className="w-4 h-4 text-brand" />
                Linked Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`/dashboard/bookings/${linkedBooking._id}`}
                className="block p-4 rounded-lg border border-border hover:border-brand/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{linkedBooking.customerName}</span>
                    {(() => {
                      const st = getBookingStatusBadge(linkedBooking.status);
                      return <Badge variant={st.variant} className="text-xs">{st.label}</Badge>;
                    })()}
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {linkedBooking.scheduledDate} {linkedBooking.timeWindow ?? ''}
                  </span>
                  {linkedBooking.technicianName && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {linkedBooking.technicianName}
                    </span>
                  )}
                  {linkedBooking.serviceCategory && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {linkedBooking.serviceCategory}
                    </span>
                  )}
                </div>
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Drawer */}
      {showBookingDrawer && session && (
        <BookingDrawer
          session={session}
          companyId={session.companyId}
          techs={techs}
          onClose={() => setShowBookingDrawer(false)}
        />
      )}
    </div>
  );
}

// ── Booking Drawer (reused from inbox, inline here for standalone) ─────

function BookingDrawer({
  session,
  companyId,
  techs,
  onClose,
}: {
  session: any;
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
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border-l border-border shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Create Booking from Intake</h3>
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
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/50"
                rows={2}
                placeholder="Access notes, dispatch instructions..."
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
