'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { format } from 'date-fns';
import {
  CreditCard,
  Download,
  RefreshCw,
  Zap,
  MessageSquare,
  PhoneCall,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Building2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const tierLabels: Record<string, string> = {
  foundation: 'Foundation',
  ops_pro: 'Ops Pro',
  enterprise: 'Enterprise',
};

const tierPrices: Record<string, string> = {
  foundation: '$99',
  ops_pro: '$249',
  enterprise: 'Custom',
};

// Tier comparison data
const tierFeatures = [
  { name: 'AI Intake (Web + SMS)', foundation: true, ops_pro: true, enterprise: true },
  { name: 'Smart Dispatch Board', foundation: true, ops_pro: true, enterprise: true },
  { name: 'Technician Mobile View', foundation: true, ops_pro: true, enterprise: true },
  { name: 'Voice AI Agent', foundation: false, ops_pro: true, enterprise: true },
  { name: 'Advanced Analytics', foundation: false, ops_pro: true, enterprise: true },
  { name: 'Multi-location Support', foundation: false, ops_pro: false, enterprise: true },
  { name: 'Custom Integrations', foundation: false, ops_pro: false, enterprise: true },
  { name: 'Priority Support', foundation: false, ops_pro: true, enterprise: true },
  { name: 'Dedicated Account Manager', foundation: false, ops_pro: false, enterprise: true },
  { name: 'Voice Minutes (included)', foundation: '50', ops_pro: '300', enterprise: 'Unlimited' },
  { name: 'SMS Volume (included)', foundation: '200', ops_pro: '1,000', enterprise: 'Unlimited' },
  { name: 'Intake Sessions / mo', foundation: '100', ops_pro: '500', enterprise: 'Unlimited' },
];

// Mock invoice history (in production this would come from Convex/Stripe)
const mockInvoices: Array<{ id: string; date: string; description: string; amount: number; status: 'paid' | 'pending' | 'failed' }> = [
  { id: '1', date: '2026-03-01', description: 'Monthly subscription — Ops Pro', amount: 249, status: 'paid' as const },
  { id: '2', date: '2026-03-01', description: 'Voice AI add-on', amount: 49, status: 'paid' as const },
  { id: '3', date: '2026-02-15', description: 'Setup financing — installment 3/12', amount: 83.25, status: 'paid' as const },
  { id: '4', date: '2026-02-01', description: 'Monthly subscription — Ops Pro', amount: 249, status: 'paid' as const },
  { id: '5', date: '2026-01-01', description: 'Monthly subscription — Ops Pro', amount: 249, status: 'paid' as const },
];

function UsageMeter({
  label,
  icon,
  used,
  limit,
  overageRate,
}: {
  label: string;
  icon: React.ReactNode;
  used: number;
  limit: number;
  overageRate: string;
}) {
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const variant = pct >= 95 ? 'danger' : pct >= 80 ? 'warning' : 'default';

  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
          {icon}
          {label}
        </div>
        <span className="text-xs text-text-muted">
          Overage: {overageRate}
        </span>
      </div>
      <Progress value={used} max={limit} variant={variant} size="md" />
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>
          {used.toLocaleString()} / {limit.toLocaleString()} used
        </span>
        <span className={pct >= 95 ? 'font-semibold text-danger' : pct >= 80 ? 'font-semibold text-warning' : ''}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { companyId, membership, isLoading: companyLoading } = useCurrentCompany();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  const plan = useQuery(
    api.companyPlans.getByCompany,
    companyId ? { companyId } : 'skip'
  );

  const features = useQuery(
    api.companyFeatures.listByCompany,
    companyId ? { companyId } : 'skip'
  );

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  // Owner-only gate
  if (membership?.role !== 'owner') {
    return (
      <div className="p-6">
        <EmptyState
          icon={<ShieldCheck className="h-6 w-6" />}
          heading="Owner access required"
          body="Billing settings are only available to company owners."
        />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<CreditCard className="h-6 w-6" />}
          heading="No company found"
          body="Please make sure you are signed in and assigned to a company."
        />
      </div>
    );
  }

  const activeAddOns = (features ?? []).filter((f: any) => f.active && (f.addOnMonthlyRate ?? 0) > 0);
  const addOnsTotal = activeAddOns.reduce((sum: number, f: any) => sum + (f.addOnMonthlyRate ?? 0), 0);
  const monthlyTotal = (plan?.monthlyRate ?? 0) + addOnsTotal;
  const hasBalance = (plan?.setupBalanceRemaining ?? 0) > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Billing & Plan</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your subscription, usage, and invoices.
        </p>
      </div>

      {/* Plan Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan Summary</CardTitle>
            <Button size="sm" onClick={() => setPlanDialogOpen(true)} className="gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Change Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {plan ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="accent" className="text-sm px-3 py-1">
                  {tierLabels[plan.tier] ?? plan.tier}
                </Badge>
                <span className="text-2xl font-bold text-text-primary">
                  ${plan.monthlyRate}
                  <span className="text-sm font-normal text-text-muted">/mo</span>
                </span>
              </div>

              {activeAddOns.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    Active Add-ons
                  </p>
                  {activeAddOns.map((f: any) => (
                    <div key={f._id} className="flex items-center justify-between text-sm">
                      <span className="text-text-primary">{f.featureName}</span>
                      <span className="text-text-muted">+${f.addOnMonthlyRate}/mo</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold text-text-primary">Total Monthly</span>
                <span className="text-lg font-bold text-text-primary">${monthlyTotal}</span>
              </div>

              {plan.nextBillingDate && (
                <p className="text-xs text-text-muted">
                  Next billing date: <span className="font-medium">{plan.nextBillingDate}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Loading plan details...</p>
          )}
        </CardContent>
      </Card>

      {/* Setup Financing Card */}
      {hasBalance && plan && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              Setup Financing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan.financingPlan && (
                <div className="text-sm text-text-muted">
                  Plan: <span className="font-medium text-text-primary">{plan.financingPlan}</span>
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Balance Remaining
                </p>
                <p className="text-3xl font-bold text-text-primary">
                  ${plan.setupBalanceRemaining?.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
                  <Zap className="h-3.5 w-3.5" />
                  Pay Now
                </Button>
              </div>

              {/* Payment History table stub */}
              <div className="mt-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                  Payment History
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-mid/50">
                        <th className="px-3 py-2 text-left font-medium text-text-muted">Date</th>
                        <th className="px-3 py-2 text-left font-medium text-text-muted">Amount</th>
                        <th className="px-3 py-2 text-left font-medium text-text-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border last:border-0">
                        <td className="px-3 py-2 text-text-muted">No payments yet</td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Meters */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Usage This Period</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <UsageMeter
            label="Voice Minutes"
            icon={<PhoneCall className="h-4 w-4 text-brand" />}
            used={plan?.voiceMinutesUsed ?? 0}
            limit={plan?.voiceMinutesLimit ?? 300}
            overageRate="$0.12/min"
          />
          <UsageMeter
            label="SMS Volume"
            icon={<MessageSquare className="h-4 w-4 text-accent" />}
            used={plan?.smsVolumeUsed ?? 0}
            limit={plan?.smsVolumeLimit ?? 1000}
            overageRate="$0.03/msg"
          />
          <UsageMeter
            label="Intake Sessions"
            icon={<Inbox className="h-4 w-4 text-success" />}
            used={plan?.intakeSessionsUsed ?? 0}
            limit={plan?.intakeSessionsLimit ?? 500}
            overageRate="$0.50/session"
          />
        </div>
      </div>

      {/* Invoice History */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Invoice History</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-mid/50">
                <th className="px-4 py-3 text-left font-medium text-text-muted">Date</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">Description</th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">Amount</th>
                <th className="px-4 py-3 text-center font-medium text-text-muted">Status</th>
                <th className="px-4 py-3 text-right font-medium text-text-muted"></th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-muted">{inv.date}</td>
                  <td className="px-4 py-3 text-text-primary">{inv.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-text-primary">
                    ${inv.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        inv.status === 'paid'
                          ? 'success'
                          : inv.status === 'pending'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {inv.status === 'paid' && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
                      {inv.status === 'failed' && <XCircle className="mr-1 inline h-3 w-3" />}
                      {inv.status === 'pending' && <Clock className="mr-1 inline h-3 w-3" />}
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                      title="Download invoice"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tier Comparison Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compare Plans</DialogTitle>
            <DialogDescription>
              Choose the plan that fits your business. Upgrade or downgrade anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-3 text-left text-text-muted">Feature</th>
                  <th className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Star className="h-4 w-4 text-text-muted" />
                      <span className="font-semibold text-text-primary">Foundation</span>
                      <span className="text-lg font-bold text-brand">$99<span className="text-xs font-normal">/mo</span></span>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Zap className="h-4 w-4 text-accent" />
                      <span className="font-semibold text-text-primary">Ops Pro</span>
                      <span className="text-lg font-bold text-accent">$249<span className="text-xs font-normal">/mo</span></span>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Building2 className="h-4 w-4 text-brand" />
                      <span className="font-semibold text-text-primary">Enterprise</span>
                      <span className="text-lg font-bold text-brand">Custom</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tierFeatures.map((feat, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5 text-text-primary">{feat.name}</td>
                    {(['foundation', 'ops_pro', 'enterprise'] as const).map((tier) => {
                      const val = feat[tier];
                      return (
                        <td key={tier} className="px-3 py-2.5 text-center">
                          {val === true ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                          ) : val === false ? (
                            <span className="text-text-muted">—</span>
                          ) : (
                            <span className="text-sm font-medium text-text-primary">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setPlanDialogOpen(false)}>
              Contact Sales
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
