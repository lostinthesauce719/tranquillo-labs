'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Building2,
  Users,
  Bell,
  Settings2,
  Puzzle,
  Palette,
  Plus,
  X,
  Copy,
  Check,
  Trash2,
  Mail,
  Phone,
  Clock,
  Globe,
} from 'lucide-react';

// ── Debounce hook ────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Timezones ────────────────────────────────────────────────────────────
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
];

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

const BUSINESS_TYPES = ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Other'];

const ROLES = ['owner', 'dispatcher', 'csr', 'tech'] as const;

const SERVICE_CATEGORIES = [
  'AC Repair',
  'Heating Repair',
  'Plumbing',
  'Electrical',
  'Roofing',
  'Water Heater',
  'Drain Cleaning',
  'Emergency',
  'Maintenance',
  'Installation',
];

const ADDON_META: Record<string, { name: string; description: string; cost: number }> = {
  webIntake: {
    name: 'Web Intake Widget',
    description: 'Embeddable intake form for your website that captures customer issues 24/7.',
    cost: 0,
  },
  smsIntake: {
    name: 'SMS Intake',
    description: 'Let customers text in service requests. AI parses and creates intake sessions.',
    cost: 49,
  },
  voiceAgent: {
    name: 'AI Voice Agent',
    description: 'AI-powered phone agent that handles calls, books appointments, and escalates emergencies.',
    cost: 99,
  },
  afterHoursMode: {
    name: 'After-Hours Mode',
    description: 'Automated after-hours handling with escalation rules and emergency routing.',
    cost: 29,
  },
};

// ── Tag Input component ──────────────────────────────────────────────────
function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  function addTag() {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput('');
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="ml-0.5 hover:text-danger"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-sm placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
        />
        <Button size="sm" variant="outline" onClick={addTag} type="button">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  SETTINGS PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const { company, companyId, membership, isLoading } = useCurrentCompany();

  // ── Convex queries ───────────────────────────────────────────────────
  const members = useQuery(
    api.memberships.getMembers,
    companyId ? { companyId } : 'skip'
  );
  const plan = useQuery(
    api.companyPlans.getByCompany,
    companyId ? { companyId } : 'skip'
  );
  const features = useQuery(
    api.companyFeatures.listByCompany,
    companyId ? { companyId } : 'skip'
  );

  // ── Convex mutations ─────────────────────────────────────────────────
  const updateCompany = useMutation(api.companies.updateCompany);
  const inviteMember = useMutation(api.memberships.inviteMember);
  const updateRole = useMutation(api.memberships.updateRole);
  const removeMember = useMutation(api.memberships.removeMember);
  const updateFeature = useMutation(api.companyFeatures.update);

  // ── Local state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('company');

  // Company tab
  const [companyName, setCompanyName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<{
    start: string;
    end: string;
    days: string[];
  }>({ start: '08:00', end: '18:00', days: ['mon', 'tue', 'wed', 'thu', 'fri'] });

  // Team tab
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('dispatcher');
  const [removingMember, setRemovingMember] = useState<any>(null);

  // Notifications tab
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Intake tab
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [emergencyKeywords, setEmergencyKeywords] = useState<string[]>([
    'flood',
    'fire',
    'gas leak',
    'no heat',
    'burst pipe',
  ]);
  const [diagnosticFee, setDiagnosticFee] = useState('89');
  const [serviceAreaZips, setServiceAreaZips] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Branding tab
  const [displayName, setDisplayName] = useState('');
  const [brandColor, setBrandColor] = useState('#1B2A4A');

  // ── Sync company data into local state ───────────────────────────────
  const initialized = useRef(false);
  useEffect(() => {
    if (company && !initialized.current) {
      initialized.current = true;
      setCompanyName(company.name || '');
      setLocationName((company as any).locationName || '');
      setTimezone(company.timezone || 'America/New_York');
      setBusinessPhone(company.phone || '');
      setBusinessTypes(company.businessTypes || []);
      if (company.operatingHours) {
        setOperatingHours(company.operatingHours);
      }
      setDisplayName(company.name || '');
      setBrandColor(company.brandingColor || '#1B2A4A');
    }
  }, [company]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // ── Auto-save (debounced) ────────────────────────────────────────────
  const debouncedName = useDebounce(companyName, 800);
  const debouncedPhone = useDebounce(businessPhone, 800);
  const debouncedTimezone = useDebounce(timezone, 800);
  const debouncedDisplayName = useDebounce(displayName, 800);
  const debouncedBrandColor = useDebounce(brandColor, 800);

  useEffect(() => {
    if (!companyId || !initialized.current) return;
    updateCompany({
      companyId,
      name: debouncedName || undefined,
      phone: debouncedPhone || undefined,
      timezone: debouncedTimezone || undefined,
    });
  }, [debouncedName, debouncedPhone, debouncedTimezone]);

  useEffect(() => {
    if (!companyId || !initialized.current) return;
    updateCompany({
      companyId,
      name: debouncedDisplayName || undefined,
      brandingColor: debouncedBrandColor || undefined,
    } as any);
  }, [debouncedDisplayName, debouncedBrandColor]);

  // Save business types on change
  useEffect(() => {
    if (!companyId || !initialized.current) return;
    updateCompany({
      companyId,
      businessTypes: businessTypes,
    } as any);
  }, [businessTypes]);

  // Save operating hours on change
  const debouncedHours = useDebounce(operatingHours, 800);
  useEffect(() => {
    if (!companyId || !initialized.current) return;
    updateCompany({
      companyId,
      operatingHours: debouncedHours,
    } as any);
  }, [debouncedHours]);

  // ── Handlers ─────────────────────────────────────────────────────────
  async function handleInvite() {
    if (!companyId || !inviteEmail) return;
    await inviteMember({
      companyId,
      email: inviteEmail,
      name: inviteEmail.split('@')[0],
      role: inviteRole as any,
    });
    setInviteEmail('');
  }

  async function handleRemoveMember() {
    if (!removingMember) return;
    await removeMember({ membershipId: removingMember._id });
    setRemovingMember(null);
  }

  async function handleRoleChange(membershipId: Id<'memberships'>, role: string) {
    await updateRole({ membershipId, role: role as any });
  }

  function requestNotifPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotifPermission(perm);
        if (perm === 'granted') {
          new Notification('Tranquillo Labs', {
            body: 'Notifications enabled! You will receive alerts here.',
          });
        }
      });
    }
  }

  function testNotification() {
    if (notifPermission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test alert from Tranquillo Labs.',
      });
    }
  }

  async function toggleFeature(featureId: Id<'companyFeatures'>, currentActive: boolean) {
    await updateFeature({ featureId, active: !currentActive });
  }

  function copyWidgetCode() {
    const code = `<script src="https://widget.tranquillo.io/intake.js" data-company="${companyId}"></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Loading / Access check ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="animate-pulse text-text-muted">Loading settings...</div>
      </div>
    );
  }

  if (!company || !companyId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-text-muted">No company found. Please complete onboarding.</p>
      </div>
    );
  }

  if (membership?.role !== 'owner') {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>Only company owners can access settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const widgetCode = `<script src="https://widget.tranquillo.io/intake.js"\n  data-company="${companyId}"\n  data-color="${brandColor}"\n></script>`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted">
          Manage your company configuration, team, and integrations.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="company">
            <Building2 className="mr-1.5 h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-1.5 h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-1.5 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="intake">
            <Settings2 className="mr-1.5 h-4 w-4" />
            Intake Config
          </TabsTrigger>
          <TabsTrigger value="addons">
            <Puzzle className="mr-1.5 h-4 w-4" />
            Add-Ons
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="mr-1.5 h-4 w-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        {/* ────────────────────────────────────────────────────────────────
            TAB 1: Company
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Basic information about your business. Changes auto-save.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme HVAC Services"
                />
                <Input
                  label="Location Name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Main Office"
                />
                <div className="space-y-1.5">
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger label="Timezone" />
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  label="Business Phone"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  type="tel"
                />
              </div>

              {/* Business Types */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Business Type
                </label>
                <div className="flex flex-wrap gap-3">
                  {BUSINESS_TYPES.map((bt) => (
                    <label
                      key={bt}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={businessTypes.includes(bt)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBusinessTypes([...businessTypes, bt]);
                          } else {
                            setBusinessTypes(businessTypes.filter((t) => t !== bt));
                          }
                        }}
                        className="h-4 w-4 rounded border-border text-brand focus:ring-brand/20"
                      />
                      <span className="text-sm text-text-primary">{bt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Operating Hours
                </label>
                <div className="space-y-3">
                  {DAYS.map((day) => {
                    const isOpen = operatingHours.days.includes(day.key);
                    return (
                      <div
                        key={day.key}
                        className="flex items-center gap-4 rounded-lg border border-border p-3"
                      >
                        <Switch
                          checked={isOpen}
                          onCheckedChange={(checked) => {
                            setOperatingHours((prev) => ({
                              ...prev,
                              days: checked
                                ? [...prev.days, day.key]
                                : prev.days.filter((d) => d !== day.key),
                            }));
                          }}
                        />
                        <span className="w-24 text-sm font-medium text-text-primary">
                          {day.label}
                        </span>
                        {isOpen ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={operatingHours.start}
                              onChange={(e) =>
                                setOperatingHours((prev) => ({
                                  ...prev,
                                  start: e.target.value,
                                }))
                              }
                              className="h-9 rounded-lg border border-border bg-surface px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                            <span className="text-text-muted text-sm">to</span>
                            <input
                              type="time"
                              value={operatingHours.end}
                              onChange={(e) =>
                                setOperatingHours((prev) => ({
                                  ...prev,
                                  end: e.target.value,
                                }))
                              }
                              className="h-9 rounded-lg border border-border bg-surface px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-text-muted">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            TAB 2: Team
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team and invite new members.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Invite form */}
              <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-surface-mid/30 p-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    label="Email Address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="tech@example.com"
                    type="email"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger label="Role" />
                    <SelectContent>
                      {ROLES.filter((r) => r !== 'owner').map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInvite} disabled={!inviteEmail}>
                  <Mail className="mr-1.5 h-4 w-4" />
                  Invite
                </Button>
              </div>

              {/* Members table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-text-muted">Name</th>
                      <th className="pb-3 font-medium text-text-muted">Email</th>
                      <th className="pb-3 font-medium text-text-muted">Role</th>
                      <th className="pb-3 font-medium text-text-muted">Status</th>
                      <th className="pb-3 font-medium text-text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members?.map((member: any) => (
                      <tr key={member._id} className="border-b border-border/50">
                        <td className="py-3 font-medium text-text-primary">
                          {member.name || '—'}
                        </td>
                        <td className="py-3 text-text-muted">{member.email}</td>
                        <td className="py-3">
                          {member.role === 'owner' ? (
                            <Badge variant="accent">Owner</Badge>
                          ) : (
                            <Select
                              value={member.role}
                              onValueChange={(val) =>
                                handleRoleChange(member._id, val)
                              }
                            >
                              <SelectTrigger className="h-8 w-32 text-xs" />
                              <SelectContent>
                                {ROLES.filter((r) => r !== 'owner').map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              member.status === 'active'
                                ? 'success'
                                : member.status === 'invited'
                                  ? 'warning'
                                  : 'muted'
                            }
                          >
                            {member.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRemovingMember(member)}
                              className="text-danger hover:text-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!members || members.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-text-muted">
                          No team members yet. Invite someone above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Remove member dialog */}
          <Dialog
            open={!!removingMember}
            onOpenChange={(open) => {
              if (!open) setRemovingMember(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Team Member</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove{' '}
                  <strong>{removingMember?.name || removingMember?.email}</strong> from your
                  team? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setRemovingMember(null)}>
                  Cancel
                </Button>
                <Button
                  className="bg-danger text-white hover:bg-danger/90"
                  onClick={handleRemoveMember}
                >
                  Remove
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            TAB 3: Notifications
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive alerts and notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Browser notifications */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Browser Notifications
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Status:{' '}
                      <Badge
                        variant={
                          notifPermission === 'granted'
                            ? 'success'
                            : notifPermission === 'denied'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {notifPermission}
                      </Badge>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {notifPermission !== 'granted' && (
                      <Button size="sm" onClick={requestNotifPermission}>
                        Enable
                      </Button>
                    )}
                    {notifPermission === 'granted' && (
                      <Button size="sm" variant="outline" onClick={testNotification}>
                        <Bell className="mr-1.5 h-4 w-4" />
                        Test
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sound alerts */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Sound Alerts</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Play a sound when new intake sessions arrive.
                    </p>
                  </div>
                  <Switch
                    checked={soundAlerts}
                    onCheckedChange={setSoundAlerts}
                  />
                </div>

                {/* Emergency contact */}
                <div className="max-w-md">
                  <Input
                    label="Emergency Contact Phone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="(555) 999-0000"
                    hint="This number will be called for high-urgency escalations."
                    type="tel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            TAB 4: Intake Configuration
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="intake">
          <Card>
            <CardHeader>
              <CardTitle>Intake Configuration</CardTitle>
              <CardDescription>
                Configure how intake sessions are categorized and processed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Service categories */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">
                    Service Categories
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <label
                        key={cat}
                        className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-border p-2.5 hover:bg-surface-mid/30 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={serviceCategories.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setServiceCategories([...serviceCategories, cat]);
                            } else {
                              setServiceCategories(
                                serviceCategories.filter((c) => c !== cat)
                              );
                            }
                          }}
                          className="h-4 w-4 rounded border-border text-brand focus:ring-brand/20"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Emergency keywords */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Emergency Keywords
                  </label>
                  <p className="text-xs text-text-muted mb-3">
                    Intake sessions containing these keywords will be flagged as high urgency.
                  </p>
                  <TagInput
                    tags={emergencyKeywords}
                    onChange={setEmergencyKeywords}
                    placeholder="Add keyword..."
                  />
                </div>

                {/* Diagnostic fee */}
                <div className="max-w-xs">
                  <Input
                    label="Diagnostic Fee ($)"
                    value={diagnosticFee}
                    onChange={(e) => setDiagnosticFee(e.target.value)}
                    placeholder="89"
                    type="number"
                    hint="Default diagnostic/service call fee shown to customers."
                  />
                </div>

                {/* Service area ZIPs */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Service Area ZIP Codes
                  </label>
                  <p className="text-xs text-text-muted mb-3">
                    Define your service area by ZIP code.
                  </p>
                  <TagInput
                    tags={serviceAreaZips}
                    onChange={setServiceAreaZips}
                    placeholder="e.g. 75001"
                  />
                </div>

                {/* Widget embed code */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Widget Embed Code
                  </label>
                  <p className="text-xs text-text-muted mb-3">
                    Add this snippet to your website to enable the intake widget.
                  </p>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg border border-border bg-[#1B2A4A] p-4 text-xs text-green-300 font-mono">
                      {widgetCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-2 text-white hover:bg-white/10"
                      onClick={copyWidgetCode}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            TAB 5: Add-Ons
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="addons">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Feature Add-Ons</h2>
              <p className="text-sm text-text-muted">
                Activate or deactivate features for your account.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {features?.map((feat: any) => {
                const meta = ADDON_META[feat.featureName];
                if (!meta) return null;
                return (
                  <Card key={feat._id} className="flex flex-col justify-between">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{meta.name}</CardTitle>
                        <Badge variant={feat.active ? 'success' : 'muted'}>
                          {feat.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription>{meta.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-primary">
                          {meta.cost === 0 ? (
                            'Included'
                          ) : (
                            <>
                              <span className="text-lg font-bold">${meta.cost}</span>
                              <span className="text-text-muted">/mo</span>
                            </>
                          )}
                        </span>
                        <Button
                          size="sm"
                          variant={feat.active ? 'outline' : 'default'}
                          onClick={() => toggleFeature(feat._id, feat.active)}
                        >
                          {feat.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {(!features || features.length === 0) && (
                <p className="col-span-2 py-8 text-center text-text-muted">
                  No features configured. Complete onboarding to initialize features.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            TAB 6: Branding
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize how your company appears to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="max-w-md">
                  <Input
                    label="Company Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>

                {/* Primary color */}
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="flex h-10 w-32 rounded-lg border border-border bg-surface px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="#1B2A4A"
                    />
                    <div
                      className="h-10 w-24 rounded-lg border border-border"
                      style={{ backgroundColor: brandColor }}
                    />
                  </div>
                </div>

                {/* Logo upload placeholder */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Company Logo
                  </label>
                  <div className="flex h-32 w-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-mid/30 text-text-muted">
                    <div className="text-center">
                      <Building2 className="mx-auto h-8 w-8 mb-1 opacity-50" />
                      <p className="text-xs">Logo upload coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Widget preview placeholder */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Widget Preview
                  </label>
                  <div className="h-64 w-full max-w-lg rounded-lg border border-border bg-surface-mid/30 flex items-center justify-center text-text-muted">
                    <div className="text-center">
                      <Globe className="mx-auto h-8 w-8 mb-1 opacity-50" />
                      <p className="text-xs">Widget preview will appear here</p>
                      <p className="text-xs mt-1 opacity-60">
                        Brand color:{' '}
                        <span className="font-mono" style={{ color: brandColor }}>
                          {brandColor}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
