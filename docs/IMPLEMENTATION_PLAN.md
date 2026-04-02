# Tranquillo Labs — Implementation Plan

## Current State
- 2 static pages (landing + dashboard mockup)
- 3 UI components (button, badge, card)
- 627-line UI spec
- Zero backend, zero auth, zero interactivity

## Target State
Fully functional MVP matching v1.3 spec with real data, auth, real-time updates.

---

## Phase 1: Foundation (Backend + Auth + Schema)
**Goal:** Convex backend running, Clerk auth working, data schema defined, seed data available.

### 1.1 Install Dependencies
- convex, @clerk/nextjs, @clerk/clerk-react
- shadcn/ui components (dialog, drawer, tabs, toast, input, select, textarea, calendar, dropdown-menu, separator, switch, progress, avatar, combobox, alert)
- @tanstack/react-table (for sortable/filterable tables)
- date-fns (date formatting)

### 1.2 Convex Schema
Tables: companies, users/memberships, intakeSessions, bookings, calls, activityFeed, notifications, companyPlans, companyFeatures

### 1.3 Clerk Auth Integration
- Sign up / sign in flows
- Role-based middleware (owner, dispatcher, csr, tech)
- Convex <-> Clerk user sync

### 1.4 Seed Data
- Script to populate a demo company with realistic data
- 20+ intake sessions, 15+ bookings, mock call records

---

## Phase 2: Core Screens (Real Data + Interactivity)

### 2.1 Shell Layout
- Authenticated layout wrapper with TopNav + Sidebar
- Role-based nav item visibility
- Notification bell (real)
- Sound toggle (localStorage)
- Mobile sidebar collapse

### 2.2 Dashboard (real-time)
- KPI strip from live Convex queries
- Upcoming bookings table (clickable rows)
- Recent intake sessions (clickable)
- Activity feed (live Convex subscription)
- Tier gating (Foundation vs Ops Pro vs Enterprise)
- Empty states

### 2.3 Intake Inbox
- Two-panel layout (list + detail)
- Filters: All / New / Assigned / Emergency / Channel
- Sort: Urgency / Newest / Oldest
- Session detail panel with all fields
- Actions: assign tech, create booking, add note, mark resolved, escalate
- Real-time updates via Convex live query
- Mobile: full-screen list → drawer detail

### 2.4 Bookings
- Tab bar: Today / Upcoming / All / Cancelled
- Filter bar: date range, status, tech, priority, search
- Bookings table with @tanstack/react-table
- Booking drawer (create/edit) — right-side
- Actions: view, assign, reschedule, cancel
- Empty states per tab

### 2.5 Intake Detail Page (/dashboard/intake/[id])
- Full-page version of inbox detail
- Breadcrumbs
- Voice transcript display
- Linked booking inline

---

## Phase 3: Public Intake + AI

### 3.1 Web Intake Widget + Hosted Page
- /intake/[companySlug] — public, SSR
- 9-step intake flow
- Google Places autocomplete for address
- Emergency detection
- After-hours handling
- Creates intakeSession in Convex
- Sends browser notification to dispatchers

### 3.2 AI Urgency Scoring
- On intake submission: call LLM to score urgency 1-10
- Generate aiSummary for issue description
- Store on intakeSession record
- Emergency auto-escalation (score >= 9)

### 3.3 SMS Notifications (Twilio)
- Booking confirmation SMS to customer
- Emergency escalation SMS to owner
- Status update SMS to customer

---

## Phase 4: Supporting Screens

### 4.1 Call Log (/dashboard/calls)
- Stats strip
- Call log table
- Transcript dialog
- Voice add-on gating

### 4.2 My Jobs (/dashboard/my-jobs) — Tech view
- Today / This Week toggle
- Job cards with status updates
- Real-time dispatcher updates
- Emergency job treatment

### 4.3 Settings (/dashboard/settings)
- 6 tabs: Company, Team, Notifications, Intake Config, Add-Ons, Branding
- Clerk team invitation
- Widget embed code generation

### 4.4 Billing (/dashboard/billing)
- Plan summary
- Usage meters
- Invoice history (mock for MVP)

### 4.5 Onboarding (/onboarding)
- 5-step wizard
- Company profile, plan selection, financing, team, features

---

## Phase 5: Polish
- Browser notifications (Notification API)
- Sound alerts
- Dark mode (optional)
- Mobile responsive pass on all screens
- Error boundaries
- Loading states
- Tests

---

## Execution Order
We build bottom-up: schema → auth → shell → dashboard → inbox → bookings → intake widget → AI → supporting screens.

Each phase builds on the previous. No screen gets built until its data layer exists.
