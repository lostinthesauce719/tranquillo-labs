# Tranquillo Labs

**AI-powered operations platform for home service businesses.**

HVAC. Plumbing. Electrical. Roofing. We handle the intake, you handle the work.

---

## What We're Building

A complete trade operations infrastructure:
- **Intake Inbox** — Web, SMS, Voice channels with urgency scoring
- **Bookings Management** — Schedule, dispatch, track
- **Tech Dispatch** — Real-time job assignment and status
- **Customer Portal** — Widget + hosted page for service requests
- **Billing & Usage** — Tiered plans, add-ons, overage tracking
- **Call Log** — Track calls, transcripts, outcomes
- **Onboarding** — 5-step wizard for new companies

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), React 18, Tailwind CSS
- **UI Components:** 17 custom components built on CVA patterns (no Radix)
- **Icons:** Lucide React
- **Backend:** Convex (real-time database, functions, auth)
- **Auth:** Clerk (sign-in, sign-up, role management)
- **State:** Convex live queries (real-time subscriptions)

## Project Structure

```
convex/                     # Backend
  schema.ts                 # 9 tables, 40+ indexes
  companies.ts              # Company CRUD
  memberships.ts            # Team members + roles
  intakeSessions.ts         # Intake session management
  bookings.ts               # Booking CRUD + filters
  calls.ts                  # Call log queries
  dashboard.ts              # KPI computations
  activityFeed.ts           # Activity log
  notifications.ts          # User notifications
  companyPlans.ts           # Billing/tier management
  companyFeatures.ts        # Feature flags/add-ons
  onboarding.ts             # Company setup mutations
  seed.ts                   # Demo data population
  auth.config.ts            # Clerk auth config
  http.ts                   # Webhook handlers

src/
  app/
    page.tsx                # Landing page
    layout.tsx              # Root layout with providers
    providers.tsx           # Clerk + Convex providers
    onboarding/page.tsx     # 5-step onboarding wizard
    sign-in/                # Clerk sign-in
    sign-up/                # Clerk sign-up
    intake/[companySlug]/   # Public intake form (9-step wizard)
    dashboard/
      layout.tsx            # Dashboard shell (TopNav + Sidebar)
      page.tsx              # Dashboard — live KPIs, tables, activity
      inbox/page.tsx        # Intake Inbox — two-panel view
      intake/[id]/page.tsx  # Intake session detail
      bookings/page.tsx     # Bookings — tabs, filters, CRUD
      calls/page.tsx        # Call log + transcripts
      my-jobs/page.tsx      # Tech-only job view
      settings/page.tsx     # Settings — 6 tabs
      billing/page.tsx      # Billing + usage meters
  components/
    shell/                  # Dashboard layout components
      top-nav.tsx           # Top navigation bar
      sidebar.tsx           # Left sidebar with role-based nav
      dashboard-layout.tsx  # Layout wrapper
    ui/                     # 17 reusable UI components
      avatar.tsx            badge.tsx       button.tsx
      calendar.tsx          card.tsx        dialog.tsx
      drawer.tsx            dropdown-menu.tsx  empty-state.tsx
      input.tsx             progress.tsx    select.tsx
      separator.tsx         switch.tsx      tabs.tsx
      textarea.tsx          toast.tsx
  hooks/
    useCurrentCompany.ts    # Resolves Clerk user → company
  lib/
    utils.ts                # cn() class merge utility
  middleware.ts             # Clerk route protection
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/sign-in` | Public | Clerk sign-in |
| `/sign-up` | Public | Clerk sign-up |
| `/onboarding` | Auth | 5-step company setup |
| `/intake/[slug]` | Public | Customer intake form |
| `/dashboard` | Auth | Operations overview |
| `/dashboard/inbox` | Owner/Dispatch | Intake session queue |
| `/dashboard/intake/[id]` | Owner/Dispatch | Session detail |
| `/dashboard/bookings` | Owner/Dispatch | Booking management |
| `/dashboard/calls` | Owner/Dispatch | Call log |
| `/dashboard/my-jobs` | Tech only | Assigned jobs |
| `/dashboard/settings` | Owner only | Company settings |
| `/dashboard/billing` | Owner only | Plans & billing |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# Fill in your Convex and Clerk keys

# Start Convex dev server
npx convex dev

# In another terminal, start Next.js
npm run dev

# Seed demo data (run once)
# Call the seed.seedDemoData mutation from the Convex dashboard
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Environment Variables

See `.env.local.example` for all required variables:
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- `CLERK_SECRET_KEY` — Clerk backend key
- `CLERK_WEBHOOK_SECRET` — For user sync webhook

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `brand` | `#1B2A4A` | Nav, primary buttons |
| `accent` | `#C47B2B` | Urgency indicators, copper highlights |
| `success` | `#166534` | Confirmed, resolved states |
| `warning` | `#92400E` | Pending, at-risk states |
| `danger` | `#991B1B` | Emergency, escalated states |
| `info` | `#1E40AF` | Informational badges |

## Role Permissions

| Role | Screens | Capabilities |
|------|---------|-------------|
| Owner | All | Full access, settings, billing |
| Dispatcher | Dashboard, Inbox, Bookings, Calls | Manage operations |
| CSR | Dashboard, Inbox | View/respond to intakes |
| Tech | My Jobs | Update own job status |

---

*Building generational wealth, one service call at a time.* 🎲
