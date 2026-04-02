'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Crown,
  Zap,
  Shield,
  Users,
  Bell,
  Clock,
  Mail,
  Plus,
  X,
  Lock,
  Rocket,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
];

const BUSINESS_TYPES = ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Other'];

const ROLES = ['dispatcher', 'csr', 'tech'] as const;

const PLANS = [
  {
    key: 'foundation' as const,
    name: 'Foundation',
    price: 99,
    setupFee: 499,
    description: 'Essential tools to get started with AI-powered intake.',
    features: [
      'Web intake widget',
      'AI issue classification',
      'Up to 100 intakes/mo',
      'Email notifications',
      '1 user seat',
    ],
    icon: Shield,
  },
  {
    key: 'ops_pro' as const,
    name: 'Ops Pro',
    price: 249,
    setupFee: 999,
    description: 'Full operations suite for growing service companies.',
    popular: true,
    features: [
      'Everything in Foundation',
      'SMS + Voice intake',
      'Up to 500 intakes/mo',
      'Smart dispatching',
      'After-hours mode',
      '5 user seats',
      'Priority support',
    ],
    icon: Zap,
  },
  {
    key: 'enterprise' as const,
    name: 'Enterprise',
    price: 0,
    setupFee: 0,
    description: 'Custom solution for multi-location operations.',
    features: [
      'Everything in Ops Pro',
      'Unlimited intakes',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'Unlimited seats',
      'White-label option',
    ],
    icon: Crown,
  },
];

const FINANCING_OPTIONS = [
  { key: 'full', label: 'Pay in Full', description: 'One-time setup payment', discount: 0 },
  { key: '50-50', label: '50/50 Split', description: '50% now, 50% in 30 days', discount: 0 },
  { key: '3-pay', label: '3 Payments', description: '3 equal monthly payments', discount: 0 },
  { key: '6-month', label: '6 Monthly', description: '6 equal monthly payments', discount: 0 },
];

const ADDON_FEATURES = [
  {
    key: 'webIntake',
    name: 'Web Intake Widget',
    description: 'Embeddable form for your website.',
    cost: 0,
    includedIn: ['foundation', 'ops_pro', 'enterprise'],
  },
  {
    key: 'smsIntake',
    name: 'SMS Intake',
    description: 'Accept service requests via text message.',
    cost: 49,
    includedIn: ['ops_pro', 'enterprise'],
  },
  {
    key: 'voiceAgent',
    name: 'AI Voice Agent',
    description: 'AI phone agent for calls and booking.',
    cost: 99,
    includedIn: ['ops_pro', 'enterprise'],
  },
  {
    key: 'afterHoursMode',
    name: 'After-Hours Mode',
    description: 'Automated after-hours handling.',
    cost: 29,
    includedIn: ['ops_pro', 'enterprise'],
  },
];

const STEP_LABELS = [
  'Company Profile',
  'Select Plan',
  'Setup Financing',
  'Team & Notifications',
  'Activate Features',
];

// ══════════════════════════════════════════════════════════════════════════
//  ONBOARDING PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);

  // ── Convex mutations ─────────────────────────────────────────────────
  const createCompany = useMutation(api.onboarding.createCompany);
  const createOwnerMembership = useMutation(api.onboarding.createOwnerMembership);
  const createPlan = useMutation(api.companyPlans.create);
  const initializeFeatures = useMutation(api.onboarding.initializeFeatures);
  const activateCompany = useMutation(api.onboarding.activateCompany);
  const updateCompany = useMutation(api.companies.updateCompany);
  const inviteMember = useMutation(api.memberships.inviteMember);
  const updateFeature = useMutation(api.companyFeatures.update);

  // ── State: Step 1 — Company Profile ──────────────────────────────────
  const [companyName, setCompanyName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [phone, setPhone] = useState('');
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);

  // ── State: Step 2 — Plan Selection ───────────────────────────────────
  const [selectedTier, setSelectedTier] = useState<'foundation' | 'ops_pro' | 'enterprise'>('foundation');

  // ── State: Step 3 — Financing ────────────────────────────────────────
  const [financingPlan, setFinancingPlan] = useState('full');

  // ── State: Step 4 — Team & Notifications ─────────────────────────────
  const [invites, setInvites] = useState<{ email: string; role: string }[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('dispatcher');
  const [afterHoursStart, setAfterHoursStart] = useState('18:00');
  const [afterHoursEnd, setAfterHoursEnd] = useState('08:00');

  // ── State: Step 5 — Features ─────────────────────────────────────────
  const [activeFeatures, setActiveFeatures] = useState<Record<string, boolean>>({
    webIntake: true,
    smsIntake: false,
    voiceAgent: false,
    afterHoursMode: false,
  });

  // ── Derived ──────────────────────────────────────────────────────────
  const [companyId, setCompanyId] = useState<Id<'companies'> | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedPlan = PLANS.find((p) => p.key === selectedTier)!;
  const setupFee = selectedPlan.setupFee;

  const features = useQuery(
    api.companyFeatures.listByCompany,
    companyId ? { companyId } : 'skip'
  );

  function getFinancingBreakdown() {
    if (selectedTier === 'enterprise') return { payments: 0, perPayment: 0, total: 0 };
    switch (financingPlan) {
      case 'full':
        return { payments: 1, perPayment: setupFee, total: setupFee };
      case '50-50':
        return { payments: 2, perPayment: Math.ceil(setupFee / 2), total: setupFee };
      case '3-pay':
        return { payments: 3, perPayment: Math.ceil(setupFee / 3), total: setupFee };
      case '6-month':
        return { payments: 6, perPayment: Math.ceil(setupFee / 6), total: setupFee };
      default:
        return { payments: 1, perPayment: setupFee, total: setupFee };
    }
  }

  function addInvite() {
    if (!inviteEmail) return;
    if (invites.some((i) => i.email === inviteEmail)) return;
    setInvites([...invites, { email: inviteEmail, role: inviteRole }]);
    setInviteEmail('');
  }

  function removeInvite(email: string) {
    setInvites(invites.filter((i) => i.email !== email));
  }

  // ── Step navigation with auto-save ───────────────────────────────────
  async function handleNext() {
    setSaving(true);
    try {
      if (step === 1) {
        // Create company + owner membership
        if (!companyId) {
          const slug = companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          const newCompanyId = await createCompany({
            name: companyName,
            slug: slug || 'company',
            timezone,
            phone: phone || undefined,
            businessTypes,
          });

          setCompanyId(newCompanyId);

          // Store in localStorage for useCurrentCompany hook
          if (typeof window !== 'undefined') {
            localStorage.setItem('tranquillo_companyId', newCompanyId);
          }

          // Create owner membership
          if (user) {
            await createOwnerMembership({
              companyId: newCompanyId,
              clerkUserId: user.id,
              name: user.fullName || user.firstName || 'Owner',
              email: user.primaryEmailAddress?.emailAddress || '',
            });
          }

          // Initialize features
          await initializeFeatures({ companyId: newCompanyId });
        } else {
          // Update existing company
          await updateCompany({
            companyId,
            name: companyName || undefined,
            phone: phone || undefined,
            timezone: timezone || undefined,
          });
        }
        setStep(2);
      } else if (step === 2) {
        // Save plan
        if (companyId && selectedTier !== 'enterprise') {
          await createPlan({
            companyId,
            tier: selectedTier,
            monthlyRate: selectedPlan.price,
            setupFee,
            financingPlan: 'full', // default, will update in step 3
          });
        } else if (companyId && selectedTier === 'enterprise') {
          await createPlan({
            companyId,
            tier: 'enterprise',
            monthlyRate: 0,
            setupFee: 0,
          });
        }
        setStep(3);
      } else if (step === 3) {
        // Financing saved as part of plan (already created)
        // In production you'd update the plan here
        if (companyId) {
          await updateCompany({
            companyId,
            afterHoursStart,
            afterHoursEnd,
          } as any);
        }
        setStep(4);
      } else if (step === 4) {
        // Send invites
        if (companyId) {
          for (const inv of invites) {
            await inviteMember({
              companyId,
              email: inv.email,
              name: inv.email.split('@')[0],
              role: inv.role as any,
            });
          }
        }
        setStep(5);
      } else if (step === 5) {
        // Toggle features and activate
        if (companyId && features) {
          for (const feat of features) {
            const shouldBeActive = activeFeatures[feat.featureName] ?? false;
            if (feat.active !== shouldBeActive) {
              await updateFeature({
                featureId: feat._id,
                active: shouldBeActive,
              });
            }
          }
          await activateCompany({ companyId });
        }
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Onboarding step error:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  const progressPct = (step / 5) * 100;
  const canProceed =
    step === 1
      ? companyName.trim().length > 0
      : step === 2
        ? !!selectedTier
        : true;

  return (
    <div className="min-h-screen bg-surface-mid/30">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">Tranquillo Labs</h1>
              <p className="text-xs text-text-muted">Setup Wizard</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary">
              Step {step} of 5
            </p>
            <p className="text-xs text-text-muted">{STEP_LABELS[step - 1]}</p>
          </div>
        </div>
        <div className="mx-auto mt-3 max-w-3xl">
          <Progress value={progressPct} size="sm" variant="accent" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* ────────────────────────────────────────────────────────────────
            STEP 1: Company Profile
        ──────────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Company Profile</h2>
              <p className="text-sm text-text-muted mt-1">
                Tell us about your business so we can configure your account.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Company Name *"
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
                  <Input
                    label="Business Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    type="tel"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-text-primary mb-3">
                    Business Type (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {BUSINESS_TYPES.map((bt) => (
                      <label
                        key={bt}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                          businessTypes.includes(bt)
                            ? 'border-brand bg-brand/5 text-brand font-medium'
                            : 'border-border text-text-primary hover:bg-surface-mid/30'
                        }`}
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
                          className="sr-only"
                        />
                        {businessTypes.includes(bt) && (
                          <Check className="h-4 w-4" />
                        )}
                        {bt}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────
            STEP 2: Select Plan
        ──────────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Choose Your Plan</h2>
              <p className="text-sm text-text-muted mt-1">
                Select the tier that fits your business needs.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selectedTier === plan.key;
                return (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => setSelectedTier(plan.key)}
                    className={`relative flex flex-col rounded-xl border-2 p-6 text-left transition-all ${
                      isSelected
                        ? 'border-brand bg-brand/5 shadow-md'
                        : 'border-border bg-surface hover:border-brand/30'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="accent">Most Popular</Badge>
                      </div>
                    )}
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                    <div className="mt-2 mb-3">
                      {plan.price > 0 ? (
                        <div>
                          <span className="text-3xl font-bold text-text-primary">
                            ${plan.price}
                          </span>
                          <span className="text-text-muted">/mo</span>
                          {plan.setupFee > 0 && (
                            <p className="text-xs text-text-muted mt-0.5">
                              + ${plan.setupFee} setup fee
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="text-2xl font-bold text-text-primary">
                            Custom
                          </span>
                          <p className="text-xs text-text-muted mt-0.5">
                            Contact us for pricing
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mb-4">{plan.description}</p>
                    <ul className="space-y-2 mt-auto">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-text-primary">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {isSelected && (
                      <div className="mt-4 flex items-center justify-center rounded-lg bg-brand py-2 text-sm font-medium text-white">
                        <Check className="mr-1.5 h-4 w-4" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────
            STEP 3: Setup Financing
        ──────────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Setup Payment</h2>
              <p className="text-sm text-text-muted mt-1">
                Choose how you&apos;d like to pay the setup fee for your{' '}
                <strong>{selectedPlan.name}</strong> plan.
              </p>
            </div>

            {selectedTier === 'enterprise' ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Crown className="mx-auto h-12 w-12 text-accent mb-4" />
                  <h3 className="text-lg font-bold text-text-primary">
                    Enterprise Plan
                  </h3>
                  <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">
                    Our team will reach out to discuss custom pricing and
                    implementation for your organization.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {FINANCING_OPTIONS.map((opt) => {
                    const breakdown = (() => {
                      switch (opt.key) {
                        case 'full':
                          return { payments: 1, per: setupFee };
                        case '50-50':
                          return { payments: 2, per: Math.ceil(setupFee / 2) };
                        case '3-pay':
                          return { payments: 3, per: Math.ceil(setupFee / 3) };
                        case '6-month':
                          return { payments: 6, per: Math.ceil(setupFee / 6) };
                        default:
                          return { payments: 1, per: setupFee };
                      }
                    })();

                    const isSelected = financingPlan === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setFinancingPlan(opt.key)}
                        className={`flex flex-col rounded-xl border-2 p-5 text-left transition-all ${
                          isSelected
                            ? 'border-brand bg-brand/5'
                            : 'border-border bg-surface hover:border-brand/30'
                        }`}
                      >
                        <h3 className="font-semibold text-text-primary">{opt.label}</h3>
                        <p className="text-sm text-text-muted mt-1">{opt.description}</p>
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-lg font-bold text-text-primary">
                            ${breakdown.per}
                            {breakdown.payments > 1 && (
                              <span className="text-sm font-normal text-text-muted">
                                {' '}
                                × {breakdown.payments} payments
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-text-muted">
                            Total: ${setupFee}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="mt-3 flex items-center text-sm font-medium text-brand">
                            <Check className="mr-1 h-4 w-4" />
                            Selected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Summary */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">
                      Payment Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Plan</span>
                        <span className="font-medium">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Monthly rate</span>
                        <span className="font-medium">${selectedPlan.price}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Setup fee</span>
                        <span className="font-medium">${setupFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Payment plan</span>
                        <span className="font-medium">
                          {FINANCING_OPTIONS.find((o) => o.key === financingPlan)?.label}
                        </span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between font-semibold">
                        <span>Due today</span>
                        <span className="text-brand">${getFinancingBreakdown().perPayment}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────
            STEP 4: Team & Notifications
        ──────────────────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Team & Notifications</h2>
              <p className="text-sm text-text-muted mt-1">
                Invite your team and configure notification preferences.
              </p>
            </div>

            {/* Invite members */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <Users className="mr-2 inline h-5 w-5" />
                  Invite Team Members
                </CardTitle>
                <CardDescription>
                  You can always add more team members later from Settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Input
                      label="Email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="tech@example.com"
                      type="email"
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger label="Role" />
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addInvite} disabled={!inviteEmail}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {invites.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {invites.map((inv) => (
                      <div
                        key={inv.email}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-text-muted" />
                          <span className="text-sm font-medium">{inv.email}</span>
                          <Badge variant="outline">
                            {inv.role.charAt(0).toUpperCase() + inv.role.slice(1)}
                          </Badge>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInvite(inv.email)}
                          className="text-text-muted hover:text-danger"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {invites.length === 0 && (
                  <p className="mt-4 text-center text-sm text-text-muted py-4">
                    No invites yet. You can skip this and add team members later.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Browser notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <Bell className="mr-2 inline h-5 w-5" />
                  Browser Notifications
                </CardTitle>
                <CardDescription>
                  Enable browser notifications to get real-time alerts for new intake sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission().then((perm) => {
                        if (perm === 'granted') {
                          new Notification('Tranquillo Labs', {
                            body: 'Notifications enabled!',
                          });
                        }
                      });
                    }
                  }}
                >
                  <Bell className="mr-1.5 h-4 w-4" />
                  Enable Notifications
                </Button>
              </CardContent>
            </Card>

            {/* After-hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <Clock className="mr-2 inline h-5 w-5" />
                  After-Hours Schedule
                </CardTitle>
                <CardDescription>
                  Define when after-hours mode should activate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Starts at
                    </label>
                    <input
                      type="time"
                      value={afterHoursStart}
                      onChange={(e) => setAfterHoursStart(e.target.value)}
                      className="h-10 rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <span className="mt-5 text-text-muted">to</span>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Ends at
                    </label>
                    <input
                      type="time"
                      value={afterHoursEnd}
                      onChange={(e) => setAfterHoursEnd(e.target.value)}
                      className="h-10 rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────
            STEP 5: Activate Features
        ──────────────────────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Activate Features</h2>
              <p className="text-sm text-text-muted mt-1">
                Choose which features to enable. You can change these anytime in Settings.
              </p>
            </div>

            <div className="space-y-4">
              {ADDON_FEATURES.map((addon) => {
                const isIncluded = addon.includedIn.includes(selectedTier);
                const isActive = activeFeatures[addon.key] ?? false;
                const isLocked = !isIncluded && addon.cost > 0;

                return (
                  <Card
                    key={addon.key}
                    className={`transition-all ${
                      isLocked ? 'opacity-60' : ''
                    }`}
                  >
                    <CardContent className="flex items-center justify-between pt-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-text-primary">
                            {addon.name}
                          </h3>
                          {isIncluded && addon.cost === 0 && (
                            <Badge variant="success">Included</Badge>
                          )}
                          {isIncluded && addon.cost > 0 && (
                            <Badge variant="default">
                              ${addon.cost}/mo
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="muted">
                              <Lock className="mr-1 h-3 w-3" />
                              Upgrade Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-text-muted mt-1">
                          {addon.description}
                        </p>
                        {isLocked && (
                          <p className="text-xs text-accent mt-1">
                            Available on Ops Pro and Enterprise plans.
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <Switch
                          checked={isActive}
                          disabled={isLocked}
                          onCheckedChange={(checked) =>
                            setActiveFeatures((prev) => ({
                              ...prev,
                              [addon.key]: checked,
                            }))
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Navigation buttons ──────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <Button variant="ghost" onClick={handleBack} disabled={saving}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed || saving}
            size="lg"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </span>
            ) : step === 5 ? (
              <>
                <Rocket className="mr-1.5 h-4 w-4" />
                Launch Dashboard
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
