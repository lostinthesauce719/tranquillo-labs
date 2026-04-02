'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Check,
  Loader2,
  AlertTriangle,
  Phone,
  Clock,
  Wrench,
  Droplets,
  Zap,
  HelpCircle,
  Home,
  Building,
  Building2,
  Store,
  ChevronRight,
  Pencil,
  CheckCircle2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────

type ServiceType = 'HVAC' | 'Plumbing' | 'Electrical' | 'Other';
type PropertyType = 'House' | 'Apartment' | 'Condo' | 'Commercial';
type TimeWindow = 'Morning 8-12' | 'Afternoon 12-4' | 'Evening 4-7' | 'Any time';

interface FormData {
  serviceType: ServiceType | '';
  issueDescription: string;
  issueChips: string[];
  isEmergency: boolean | null;
  propertyType: PropertyType | '';
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  hasGateCode: boolean;
  gateCode: string;
  hasPets: boolean;
  pets: string;
  hasParkingNotes: boolean;
  parkingNotes: string;
  firstName: string;
  phone: string;
  email: string;
  timePreference: TimeWindow | '';
}

const INITIAL_FORM: FormData = {
  serviceType: '',
  issueDescription: '',
  issueChips: [],
  isEmergency: null,
  propertyType: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressZip: '',
  hasGateCode: false,
  gateCode: '',
  hasPets: false,
  pets: '',
  hasParkingNotes: false,
  parkingNotes: '',
  firstName: '',
  phone: '',
  email: '',
  timePreference: '',
};

const TOTAL_STEPS = 9;

const SERVICE_TYPES: { value: ServiceType; label: string; icon: typeof Wrench }[] = [
  { value: 'HVAC', label: 'HVAC', icon: Wrench },
  { value: 'Plumbing', label: 'Plumbing', icon: Droplets },
  { value: 'Electrical', label: 'Electrical', icon: Zap },
  { value: 'Other', label: 'Other', icon: HelpCircle },
];

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: typeof Home }[] = [
  { value: 'House', label: 'House', icon: Home },
  { value: 'Apartment', label: 'Apartment', icon: Building },
  { value: 'Condo', label: 'Condo', icon: Building2 },
  { value: 'Commercial', label: 'Commercial', icon: Store },
];

const TIME_WINDOWS: TimeWindow[] = [
  'Morning 8-12',
  'Afternoon 12-4',
  'Evening 4-7',
  'Any time',
];

const COMMON_ISSUES: Record<ServiceType, string[]> = {
  HVAC: ['No heat', 'No cooling', 'Strange noises', 'Thermostat issue', 'Poor airflow'],
  Plumbing: ['Clogged drain', 'Leaky faucet', 'No hot water', 'Running toilet', 'Burst pipe'],
  Electrical: ['Outlet sparking', 'Breaker tripping', 'Flickering lights', 'No power', 'Burning smell'],
  Other: ['General maintenance', 'Inspection needed', 'Not sure'],
};

// ── Helpers ─────────────────────────────────────────────────────────────

function isAfterHours(): boolean {
  const hour = new Date().getHours();
  return hour < 8 || hour >= 18;
}

// ── Component ───────────────────────────────────────────────────────────

export default function IntakePage({
  params,
}: {
  params: { companySlug: string };
}) {
  const company = useQuery(api.companies.getBySlug, { slug: params.companySlug });
  const createIntake = useMutation(api.intakeSessions.createFromWeb);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const afterHours = useMemo(() => isAfterHours(), []);

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const toggleChip = useCallback((chip: string) => {
    setForm((prev) => ({
      ...prev,
      issueChips: prev.issueChips.includes(chip)
        ? prev.issueChips.filter((c) => c !== chip)
        : [...prev.issueChips, chip],
    }));
  }, []);

  // Validation per step
  const validateStep = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!form.serviceType) errs.serviceType = 'Please select a service type';
        break;
      case 2:
        if (!form.issueDescription.trim() && form.issueChips.length === 0)
          errs.issueDescription = 'Please describe the issue or select a common problem';
        break;
      case 3:
        if (form.isEmergency === null) errs.isEmergency = 'Please indicate if this is an emergency';
        break;
      case 4:
        if (!form.propertyType) errs.propertyType = 'Please select a property type';
        break;
      case 5:
        if (!form.addressStreet.trim()) errs.addressStreet = 'Street address is required';
        if (!form.addressCity.trim()) errs.addressCity = 'City is required';
        if (!form.addressState.trim()) errs.addressState = 'State is required';
        if (!form.addressZip.trim()) errs.addressZip = 'ZIP code is required';
        break;
      case 7:
        if (!form.firstName.trim()) errs.firstName = 'First name is required';
        if (!form.phone.trim()) errs.phone = 'Phone number is required';
        break;
      case 8:
        if (!form.timePreference) errs.timePreference = 'Please select a time window';
        break;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [step, form]);

  const next = useCallback(() => {
    if (validateStep()) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [validateStep]);

  const back = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const goToStep = useCallback((s: number) => {
    setStep(s);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!company?._id) return;
    setSubmitting(true);
    try {
      const issueText = [
        ...form.issueChips,
        form.issueDescription,
      ]
        .filter(Boolean)
        .join('. ');

      const accessParts: string[] = [];
      if (form.hasParkingNotes && form.parkingNotes) accessParts.push(`Parking: ${form.parkingNotes}`);

      await createIntake({
        companyId: company._id,
        customerName: form.firstName,
        customerPhone: form.phone || undefined,
        customerEmail: form.email || undefined,
        propertyType: form.propertyType || undefined,
        addressStreet: form.addressStreet || undefined,
        addressCity: form.addressCity || undefined,
        addressState: form.addressState || undefined,
        addressZip: form.addressZip || undefined,
        serviceCategory: form.serviceType || undefined,
        issueRaw: issueText,
        isEmergency: form.isEmergency ?? false,
        accessNotes: accessParts.length > 0 ? accessParts.join('; ') : undefined,
        pets: form.hasPets && form.pets ? form.pets : undefined,
        gateCode: form.hasGateCode && form.gateCode ? form.gateCode : undefined,
        timePreference: form.timePreference || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit intake:', err);
    } finally {
      setSubmitting(false);
    }
  }, [company, form, createIntake]);

  // ── Loading / Error states ─────────────────────────────────────────

  if (company === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-mid">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (company === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-mid px-4">
        <AlertTriangle className="h-12 w-12 text-warning" />
        <h1 className="text-xl font-semibold text-text-primary">Company not found</h1>
        <p className="text-sm text-text-muted">
          The link you followed doesn&apos;t match any company in our system.
        </p>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-mid px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">Your request has been submitted!</h1>
          <p className="mt-2 text-text-muted">
            {company.name} will be in touch shortly.
          </p>
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="space-y-3 pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Service</span>
              <span className="font-medium text-text-primary">{form.serviceType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Name</span>
              <span className="font-medium text-text-primary">{form.firstName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Phone</span>
              <span className="font-medium text-text-primary">{form.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Time preference</span>
              <span className="font-medium text-text-primary">{form.timePreference}</span>
            </div>
            {form.isEmergency && (
              <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger font-medium">
                Marked as emergency — expect a priority callback
              </div>
            )}
          </CardContent>
        </Card>
        {afterHours && (
          <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent">
            <Clock className="h-4 w-4 shrink-0" />
            We&apos;re currently closed. We&apos;ll review your request first thing in the morning.
          </div>
        )}
      </div>
    );
  }

  // ── Progress dots ──────────────────────────────────────────────────

  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-200',
            i + 1 === step ? 'w-6 bg-brand' : i + 1 < step ? 'w-2 bg-brand/60' : 'w-2 bg-border'
          )}
        />
      ))}
    </div>
  );

  // ── Step renderers ─────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">What do you need help with?</h2>
              <p className="mt-1 text-sm text-text-muted">Select the type of service you need</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SERVICE_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    update('serviceType', value);
                    // Auto-advance on selection
                    setTimeout(() => setStep(2), 150);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all',
                    form.serviceType === value
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-border bg-surface text-text-primary hover:border-brand/40'
                  )}
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
            {errors.serviceType && (
              <p className="text-center text-xs text-danger">{errors.serviceType}</p>
            )}
          </div>
        );

      case 2: {
        const chips = form.serviceType
          ? COMMON_ISSUES[form.serviceType as ServiceType]
          : [];
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Describe the issue</h2>
              <p className="mt-1 text-sm text-text-muted">Select common issues or describe in your own words</p>
            </div>
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleChip(chip)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-all',
                      form.issueChips.includes(chip)
                        ? 'border-brand bg-brand/10 text-brand font-medium'
                        : 'border-border bg-surface text-text-muted hover:border-brand/40'
                    )}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
            <Textarea
              label="Additional details"
              placeholder="Tell us more about what's going on..."
              value={form.issueDescription}
              onChange={(e) => update('issueDescription', e.target.value)}
              error={errors.issueDescription}
              rows={4}
            />
          </div>
        );
      }

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Is this an active emergency?</h2>
              <p className="mt-1 text-sm text-text-muted">
                Examples: gas leak, flooding, sparking wires, no heat in freezing weather
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => update('isEmergency', true)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-base font-medium transition-all',
                  form.isEmergency === true
                    ? 'border-danger bg-danger/5 text-danger'
                    : 'border-border bg-surface text-text-primary hover:border-danger/40'
                )}
              >
                <AlertTriangle className="h-5 w-5" />
                Yes, emergency
              </button>
              <button
                type="button"
                onClick={() => {
                  update('isEmergency', false);
                  setTimeout(() => setStep(4), 150);
                }}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-base font-medium transition-all',
                  form.isEmergency === false
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-border bg-surface text-text-primary hover:border-brand/40'
                )}
              >
                No
              </button>
            </div>
            {form.isEmergency === true && (
              <div className="rounded-xl bg-danger/10 border border-danger/20 p-4 space-y-2">
                <p className="text-sm font-semibold text-danger flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  For immediate emergencies, call us directly:
                </p>
                <a
                  href={`tel:${company.phone || '911'}`}
                  className="flex items-center justify-center gap-2 rounded-lg bg-danger p-3 text-white font-semibold text-lg"
                >
                  <Phone className="h-5 w-5" />
                  {company.phone || '(555) 000-0000'}
                </a>
                <p className="text-xs text-text-muted text-center">
                  You can still continue submitting this form if you prefer
                </p>
              </div>
            )}
            {errors.isEmergency && (
              <p className="text-center text-xs text-danger">{errors.isEmergency}</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">What type of property?</h2>
              <p className="mt-1 text-sm text-text-muted">This helps us prepare the right equipment</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    update('propertyType', value);
                    setTimeout(() => setStep(5), 150);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all',
                    form.propertyType === value
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-border bg-surface text-text-primary hover:border-brand/40'
                  )}
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
            {errors.propertyType && (
              <p className="text-center text-xs text-danger">{errors.propertyType}</p>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Service address</h2>
              <p className="mt-1 text-sm text-text-muted">Where should we send the technician?</p>
            </div>
            <div className="space-y-4">
              <Input
                label="Street address"
                placeholder="123 Main Street"
                value={form.addressStreet}
                onChange={(e) => update('addressStreet', e.target.value)}
                error={errors.addressStreet}
              />
              <Input
                label="City"
                placeholder="Springfield"
                value={form.addressCity}
                onChange={(e) => update('addressCity', e.target.value)}
                error={errors.addressCity}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="State"
                  placeholder="IL"
                  value={form.addressState}
                  onChange={(e) => update('addressState', e.target.value)}
                  error={errors.addressState}
                />
                <Input
                  label="ZIP code"
                  placeholder="62704"
                  value={form.addressZip}
                  onChange={(e) => update('addressZip', e.target.value)}
                  error={errors.addressZip}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Access details</h2>
              <p className="mt-1 text-sm text-text-muted">Anything our technician should know about accessing the property?</p>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-surface-mid transition-colors">
                <input
                  type="checkbox"
                  checked={form.hasGateCode}
                  onChange={(e) => update('hasGateCode', e.target.checked)}
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                />
                <span className="text-sm font-medium text-text-primary">Gate code required</span>
              </label>
              {form.hasGateCode && (
                <Input
                  label="Gate code"
                  placeholder="e.g. #1234"
                  value={form.gateCode}
                  onChange={(e) => update('gateCode', e.target.value)}
                />
              )}

              <label className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-surface-mid transition-colors">
                <input
                  type="checkbox"
                  checked={form.hasPets}
                  onChange={(e) => update('hasPets', e.target.checked)}
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                />
                <span className="text-sm font-medium text-text-primary">Pets on property</span>
              </label>
              {form.hasPets && (
                <Input
                  label="Pet details"
                  placeholder="e.g. Friendly dog in backyard"
                  value={form.pets}
                  onChange={(e) => update('pets', e.target.value)}
                />
              )}

              <label className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-surface-mid transition-colors">
                <input
                  type="checkbox"
                  checked={form.hasParkingNotes}
                  onChange={(e) => update('hasParkingNotes', e.target.checked)}
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                />
                <span className="text-sm font-medium text-text-primary">Special parking instructions</span>
              </label>
              {form.hasParkingNotes && (
                <Input
                  label="Parking notes"
                  placeholder="e.g. Park in visitor spot #5"
                  value={form.parkingNotes}
                  onChange={(e) => update('parkingNotes', e.target.value)}
                />
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Your contact info</h2>
              <p className="mt-1 text-sm text-text-muted">So we can reach you to confirm the appointment</p>
            </div>
            <div className="space-y-4">
              <Input
                label="First name *"
                placeholder="John"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                error={errors.firstName}
              />
              <Input
                label="Phone number *"
                type="tel"
                placeholder="(555) 123-4567"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                error={errors.phone}
              />
              <Input
                label="Email (optional)"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Preferred time window</h2>
              <p className="mt-1 text-sm text-text-muted">When works best for a technician visit?</p>
            </div>
            <div className="space-y-3">
              {TIME_WINDOWS.map((window) => (
                <button
                  key={window}
                  type="button"
                  onClick={() => {
                    update('timePreference', window);
                    setTimeout(() => setStep(9), 150);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all',
                    form.timePreference === window
                      ? 'border-brand bg-brand/5'
                      : 'border-border bg-surface hover:border-brand/40'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    form.timePreference === window ? 'text-brand' : 'text-text-primary'
                  )}>
                    {window}
                  </span>
                  {form.timePreference === window && (
                    <Check className="h-5 w-5 text-brand" />
                  )}
                </button>
              ))}
            </div>
            {errors.timePreference && (
              <p className="text-center text-xs text-danger">{errors.timePreference}</p>
            )}
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Review your request</h2>
              <p className="mt-1 text-sm text-text-muted">Make sure everything looks good before submitting</p>
            </div>
            <Card>
              <CardContent className="divide-y divide-border pt-4">
                {/* Service */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-text-muted">Service type</p>
                    <p className="text-sm font-medium text-text-primary">{form.serviceType}</p>
                  </div>
                  <button type="button" onClick={() => goToStep(1)} className="text-brand hover:text-brand/80">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                {/* Issue */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1 pr-4">
                    <p className="text-xs text-text-muted">Issue</p>
                    <p className="text-sm font-medium text-text-primary">
                      {[...form.issueChips, form.issueDescription].filter(Boolean).join('. ') || '—'}
                    </p>
                  </div>
                  <button type="button" onClick={() => goToStep(2)} className="text-brand hover:text-brand/80">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                {/* Emergency */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-text-muted">Emergency</p>
                    <p className={cn('text-sm font-medium', form.isEmergency ? 'text-danger' : 'text-text-primary')}>
                      {form.isEmergency ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <button type="button" onClick={() => goToStep(3)} className="text-brand hover:text-brand/80">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                {/* Property */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-text-muted">Property type</p>
                    <p className="text-sm font-medium text-text-primary">{form.propertyType}</p>
                  </div>
                  <button type="button" onClick={() => goToStep(4)} className="text-brand hover:text-brand/80">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                {/* Address */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-text-muted">Address</p>
                    <p className="text-sm font-medium text-text-primary">
                      {form.addressStreet}, {form.addressCity}, {form.addressState} {form.addressZip}
                    </p>
                  </div>
                  <button type="button" onClick={() => goToStep(5)} className="text-brand hover:text-brand/80">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                {/* Access */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-text-muted">Access details</p>
                    <p className="text-sm font-medium text-text-primary">
                      {[
                        form.hasGateCode && `Gate: ${form.gateCode}`,
                        form.hasPets && `Pets: ${form.pets}`,
                        form.hasParkingNotes && `Parking: ${form.parkingNotes}`,
                      ].filter(Boolean).join(' · ') || 'None'}
                    </p>
                  </div>
                  <button type="button" onClick={() => goToStep(6)} className="text-brand hover:text-brand/80">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                {/* Contact */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-text-muted">Contact</p>
                    <p className="text-sm font-medium text-text-primary">
                      {form.firstName} · {form.phone}
                      {form.email ? ` · ${form.email}` : ''}
                    </p>
                  </div>
                  <button type="button" onClick={() => goToStep(7)} className="text-brand hover:text-brand/80">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                {/* Time */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-text-muted">Time preference</p>
                    <p className="text-sm font-medium text-text-primary">{form.timePreference}</p>
                  </div>
                  <button type="button" onClick={() => goToStep(8)} className="text-brand hover:text-brand/80">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-surface-mid">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-mid hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-text-primary">{company.name}</h1>
          </div>
          <span className="text-sm text-text-muted">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
      </header>

      {/* After hours banner */}
      {afterHours && (
        <div className="border-b border-accent/20 bg-accent/10 px-4 py-2">
          <div className="mx-auto flex max-w-2xl items-center gap-2 text-sm text-accent">
            <Clock className="h-4 w-4 shrink-0" />
            We&apos;re currently closed. We&apos;ll review your request first thing in the morning.
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="px-4 pt-6">
        <div className="mx-auto max-w-2xl">
          <ProgressDots />
        </div>
      </div>

      {/* Form content */}
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {renderStep()}
        </div>
      </main>

      {/* Footer nav */}
      <footer className="sticky bottom-0 border-t border-border bg-surface px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          {step > 1 ? (
            <Button variant="ghost" onClick={back}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < TOTAL_STEPS ? (
            <Button onClick={next}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="accent"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit request
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
