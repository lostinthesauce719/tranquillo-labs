# Tranquillo Labs — Cannabis Platform: Accounting + Unified Ops + Delivery

## Plan: From Start to End and Future Scope (Inside & Outside)

**Date:** 2026-04-03
**Parent Platform:** Tranquillo Labs (tranquillo-labs repo)
**Existing Stack:** Next.js 14, Convex, Clerk, Tailwind
**Working Name:** "Tranquillo Green" (cannabis vertical under Tranquillo Labs)

---

## 1. Goal

Build a cannabis industry platform under Tranquillo Labs that attacks three
compounding pain points:

1. **Cannabis-Specific Accounting** — Zero purpose-built competitors exist
2. **Unified Operations Hub** — Replace 5-10 fragmented tools with one
3. **Delivery Infrastructure** — $15B market by 2033, no DoorDash/Uber allowed

These three pillars form a flywheel: accounting hooks operators in (zero
competition), unified ops expands the relationship, delivery owns the last mile.

---

## 2. Current Context & Assumptions

### What We Have
- Tranquillo Labs monorepo at `/tmp/tranquillo-labs` (GitHub: lostinthesauce719)
- Next.js 14 + Convex + Clerk + Tailwind fully wired
- Existing Convex schema for home services (companies, memberships, bookings,
  intake sessions, calls, activity feed, notifications, plans, features)
- Multi-tenant architecture already built (company → memberships → roles)

### Key Assumptions
- Cannabis app will be a NEW Next.js app under Tranquillo Labs umbrella
  (separate repo or monorepo workspace — TBD)
- Can reuse Convex backend patterns but needs cannabis-specific schema
- Clerk auth can be shared across Tranquillo Labs apps
- MVP targets California first (most mature market, largest operator count)
- 280E is still in effect but rescheduling is imminent — platform must
  handle BOTH 280E and post-280E accounting

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANQUILLO LABS                           │
│                  (Parent Platform)                           │
├────────────────┬──────────────────┬─────────────────────────┤
│  "Tranquillo"  │ "Tranquillo      │  Future Apps...         │
│  (Home Svcs)   │  Green" (Cannabis)│                         │
└────────────────┴──────────────────┴─────────────────────────┘

Tranquillo Green Internal Architecture:

┌──────────────────────────────────────────────────────────────┐
│                    NEXT.JS 14 FRONTEND                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │Dashboard │  │Accounting│  │Inventory │  │Delivery Mgmt │ │
│  │& Reports │  │  Module  │  │  Module  │  │   Module     │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                      CONVEX BACKEND                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │Companies │  │Financial │  │Cannabis  │  │  Delivery    │ │
│  │& Auth    │  │  Engine  │  │Inventory │  │  Engine      │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                    INTEGRATIONS LAYER                         │
│  ┌──────┐  ┌────────┐  ┌──────────┐  ┌────────┐  ┌───────┐ │
│  │Metrc │  │BioTrack│  │QuickBooks│  │Payment │  │Maps / │ │
│  │ API  │  │  API   │  │  Export  │  │  ACH   │  │ GPS   │ │
│  └──────┘  └────────┘  └──────────┘  └────────┘  └───────┘ │
├──────────────────────────────────────────────────────────────┤
│                      AI AGENTS LAYER                         │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐│
│  │280E Allocation│  │Compliance    │  │Route Optimization  ││
│  │   Agent       │  │Monitor Agent │  │     Agent          ││
│  └───────────────┘  └──────────────┘  └────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 4. PILLAR 1: Cannabis Accounting Engine (MVP Priority #1)

### Why First
- ZERO direct competitors (no purpose-built cannabis accounting software)
- Easiest wedge into the market — every operator feels this pain
- Financial data is stickiest — once you're the system of record, you own
  the customer relationship
- ~15,000+ active cannabis licenses in the US

### 4.1 Core Feature Set

#### A) Cannabis Chart of Accounts (Pre-built)
- Industry-standard chart of accounts with 280E-compliant structure
- **Assets (1000s):** Cash/vault, receivables, granular inventory
  (raw materials, WIP by growth stage, finished goods by product type,
  purchased-for-resale, packaging, non-cannabis accessories)
- **Liabilities (2000s):** AP, accrued payroll (production vs admin split),
  excise/cultivation/local cannabis taxes payable, state/federal income tax
- **Revenue (4000s):** Split by product type (flower, concentrates, edibles,
  pre-rolls, topicals, accessories) AND by channel (retail, wholesale,
  delivery, medical)
- **COGS (5000s):** The critical 280E section — direct materials, direct
  labor (cultivation, processing, packaging, QC), facility costs (utilities,
  rent, depreciation), lab testing, extraction supplies, freight-in,
  shrinkage/waste
- **Operating Expenses (6000s):** Everything NON-deductible under 280E —
  admin salaries, marketing, retail rent, security, software, professional
  fees, banking fees
- Auto-template by business type (cultivator, manufacturer, retailer,
  distributor, vertically integrated)

#### B) 280E Tax Engine
- **COGS Allocation Engine:** Automatically allocates shared costs between
  production (deductible) and operating (non-deductible) using configurable
  methods:
  - Square footage allocation (production space vs admin/retail)
  - Time-based allocation (% employee time on production tasks)
  - Activity-based costing
  - Hybrid/custom allocation methods
- **Real-time Tax Liability Dashboard:** Shows estimated federal tax at
  280E-adjusted rate (typically 50-70% effective) vs what it would be
  post-rescheduling
- **Quarterly Estimated Payment Calculator:** Auto-calculates Form 1040-ES /
  1120-ES amounts with 280E adjustments
- **Dual-Mode Accounting:** Simultaneously maintains books under 280E AND
  models post-280E scenario for planning
- **Amended Return Calculator:** When rescheduling finalizes, auto-generates
  data for amended returns on open tax years

#### C) Multi-State Tax Compliance
State-specific tax rules engine for:

| State | Excise Tax | Sales Tax | Cultivation Tax | Local Taxes |
|-------|-----------|-----------|-----------------|-------------|
| CA    | 15% retail | 7.25%+ local | Eliminated 2022 | Up to 10% |
| CO    | 15% wholesale + 15% retail | 2.9% | — | Up to 6% |
| MI    | 10% retail | 6% | — | None |
| IL    | 10-25% (THC tiered) | 6.25% | 7% cultivator | Up to 6.75% |
| OR    | 17% retail | None | — | Up to 3% |
| WA    | 37% retail | 6.5%+ local | — | Local applies |
| NY    | 9% wholesale + 13% retail | 4%+ | — | TBD |

- Auto-generates state-specific excise tax returns (monthly filing)
- Tracks filing deadlines with alerts
- Handles states that DECOUPLE from 280E (CA, CO, OR allow normal
  deductions at state level — must track federal vs state taxable income
  separately)

#### D) Cash Management
- Vault/safe balance tracking (critical for cash-heavy operations)
- Cash reconciliation: POS sales → cash drawer → vault → bank deposit
- Form 8300 auto-generation for cash transactions >$10,000
- Armored car service reconciliation
- Daily cash flow tracking with variance alerts

#### E) Inventory Cost Accounting
- Support for FIFO, Weighted Average, Specific Identification, Standard Cost
- WIP inventory tracking by growth stage:
  - Clone/seedling → Vegetative → Flowering → Drying/Curing → Finished
- Cost accumulation through each stage
- Bill of Materials for manufactured products (edibles, concentrates)
- Batch-level costing tied to Metrc package UIDs
- Shrinkage/waste tracking with compliance documentation
- Yield analysis (cost per gram/pound by batch, strain, room)

#### F) AI Agents for Accounting

**Agent 1: 280E Allocation Agent**
- Monitors all transactions in real-time
- Auto-classifies expenses as COGS vs Operating using ML trained on
  cannabis chart of accounts
- Flags ambiguous expenses for human review
- Learns from CPA corrections over time
- Suggests optimal (legal) allocation ratios
- Target: reduce manual categorization work by 60-70%

**Agent 2: Compliance Monitor Agent**
- Tracks regulatory changes across all active states
- Alerts when tax rates change, new filing requirements emerge, or
  deadlines approach
- Monitors Metrc-to-books reconciliation and flags discrepancies
- Detects anomalies that could trigger IRS audit (excessive COGS ratio,
  inconsistent allocation methods, missing Form 8300s)
- Generates audit-ready documentation packages on demand

**Agent 3: Tax Optimization Agent**
- Analyzes entity structure and suggests optimization (separate management
  company, real estate holding company, IP licensing entity)
- Models tax scenarios for S-corp election, entity restructuring
- Projects quarterly estimated payments with cash flow impact
- Post-rescheduling: identifies newly available deductions (R&D credits,
  Section 179 depreciation, employee benefit deductions)

### 4.2 Integrations (Accounting)

**Priority 1 (MVP):**
- Metrc API (CA, CO, MI, OR) — inventory data, package tracking
- QuickBooks Online export (most operators already use QBO)
- POS data import (Dutchie, Flowhub, Treez — read-only initially)
- Manual bank statement upload + reconciliation

**Priority 2 (Post-MVP):**
- BioTrack API (NY, NJ, IL)
- Xero export
- Sage Intacct integration (enterprise)
- Plaid-based bank feed (where available for cannabis accounts)
- Wurk payroll import (labor cost allocation)

**Priority 3 (Scale):**
- Leaf Data Systems API (WA)
- NetSuite integration
- Direct ACH payment origination
- Multi-state consolidated reporting

### 4.3 Revenue Model (Accounting)

| Tier | Target | Price/mo | Features |
|------|--------|----------|----------|
| Starter | Single-location dispensary | $149/mo | Chart of accounts, basic 280E, 1 state, QBO export |
| Pro | Multi-location or cultivator | $349/mo | Full 280E engine, 3 states, AI categorization, Metrc sync |
| Enterprise | MSO / vertically integrated | $799+/mo | Unlimited states, all integrations, dedicated support, audit prep |
| Social Equity | Qualifying licensees | $49/mo | Full Pro features at subsidized rate |

Estimated TAM: 15,000 active licenses × $250/mo avg = $45M ARR opportunity

---

## 5. PILLAR 2: Unified Operations Hub (Phase 2)

### Why Second
- Once you have their financial data, expanding to operations is a natural
  upsell ("your POS data doesn't match your books — let us unify that")
- Operators spend $2-3K/mo on 5-10 tools — consolidation saves them money
- Operations data feeds the accounting engine, making both better

### 5.1 Core Feature Set

#### A) POS / Point of Sale
- Transaction processing with cannabis-specific workflows
- Product catalog with strain database, THC/CBD potency tracking
- Customer management (loyalty, purchase history, medical card tracking)
- Discount/promo engine with compliance guardrails (no advertising violations)
- Cash + ACH + PIN debit payment support
- Daily sales auto-sync to accounting module

#### B) Inventory Management
- Real-time inventory across all locations
- Metrc two-way sync (not just read — write manifests, report sales)
- Automated reorder points and purchase orders
- Multi-location transfer management
- Barcode/QR scanning for receiving and cycle counts
- Shrinkage tracking with compliance documentation
- Expiration date management for perishable products

#### C) Compliance Dashboard
- License expiration tracking and renewal alerts
- State-specific packaging/labeling requirement checker
- Employee license/badge status tracking
- Mandatory reporting deadline calendar
- Audit trail for every action (who, what, when)
- Auto-generated state compliance reports

#### D) CRM / Customer Management
- Customer profiles with purchase history
- Medical card management and expiration alerts
- Loyalty program with configurable rewards
- Communication tools (SMS/email within advertising restrictions)
- Customer segmentation for targeted promotions

#### E) Workforce Management
- Employee scheduling with compliance-aware constraints
- Time tracking with 280E production/non-production allocation
- Tip management and reporting
- Background check status tracking
- Training completion tracking (state-required certifications)
- Payroll data export to Wurk / Gusto / accounting module

#### F) AI Agent for Operations

**Agent 4: Demand Forecasting Agent**
- Analyzes historical sales data by product, day, weather, events
- Predicts demand by SKU to optimize purchasing
- Identifies slow-moving inventory before it expires
- Suggests pricing adjustments to move aged inventory
- Connects cultivation data to retail performance (seed-to-shelf analytics)

### 5.2 Revenue Model (Ops Hub)

| Tier | Price/mo (add-on to accounting) | Features |
|------|------|----------|
| Ops Lite | +$199/mo | POS + basic inventory + compliance dashboard |
| Ops Pro | +$399/mo | Full POS + inventory + CRM + workforce + Metrc write |
| Ops Enterprise | +$699/mo | Multi-location, advanced analytics, API access |

---

## 6. PILLAR 3: Delivery Infrastructure (Phase 3)

### Why Third
- Once you manage their inventory + orders + compliance, adding delivery
  is a natural extension ("want to offer delivery? It's already integrated")
- Every delivery generates transaction data that flows back into accounting
  + operations automatically — the flywheel closes
- $15B projected market by 2033

### 6.1 Core Feature Set

#### A) Order Management
- Online ordering storefront (consumer-facing)
- Order queue with dispatch management
- Scheduled + on-demand delivery modes
- Order bundling for route efficiency
- Real-time order status tracking for customers

#### B) Driver Management
- Driver onboarding with background check tracking
- Shift scheduling with zone coverage optimization
- Compliance training tracking (state-required certifications)
- W-2 employee management (NOT 1099 — most states require employees)
- Pre-shift checklists (vehicle inspection, manifest prep, cash bank count)
- Post-shift reconciliation (manifest, cash, returned product)
- Pay calculation (hourly + per-delivery bonus + tips + mileage)

#### C) Dispatch & Routing

**Agent 5: Route Optimization Agent**
- AI-powered multi-stop route planning (5-15 orders per run)
- Cannabis-specific constraints:
  - Product value limits per vehicle ($10K in CA)
  - Delivery zone boundaries (municipal opt-in/opt-out areas)
  - Delivery hour restrictions (typically 8am-10pm)
  - Geofencing for licensed zones
- Dynamic re-routing for traffic, cancellations, new orders
- Predictive ETA with customer notifications
- Capacity optimization (maximize deliveries per shift)

#### D) Compliance at the Door
- ID scanning with age verification (21+ rec, 18+ medical)
- Medical card verification and logging
- Digital signature capture for proof of delivery
- Photo capture for compliance records
- Timestamp logging of every verification event
- Refusal protocol if ID doesn't match or impairment detected

#### E) Manifest Management
- Auto-generate Metrc sales delivery manifests before product leaves
- Manifest includes: all package UIDs, quantities, driver info, vehicle
  info, destination addresses, departure time
- Real-time manifest status (pending → in-transit → delivered)
- Return reconciliation for undelivered items
- Manifest voiding and modification handling

#### F) GPS & Tracking
- Real-time GPS tracking of all delivery vehicles
- Complete location history retention (90+ days for audits)
- Geofencing alerts (driver leaves licensed zone)
- Customer-facing live tracking ("your driver is 5 min away")
- State compliance reporting of GPS data

#### G) Payment at Door
- ACH bank transfer (primary — most stable for cannabis)
- PIN debit where available
- Cash with compliance limits and reconciliation
- Digital receipt with all tax breakdowns
- Tip collection

#### H) AI Agent for Delivery

**Agent 6: Delivery Intelligence Agent**
- Predicts peak demand windows by zone for staffing
- Optimizes driver scheduling based on historical patterns
- Identifies high-value delivery zones for expansion
- Monitors driver performance (on-time %, customer ratings)
- Fraud detection (unusual cash discrepancies, route deviations)

### 6.2 Revenue Model (Delivery)

| Model | Rate | Description |
|-------|------|-------------|
| Per-delivery fee | $3-5/delivery | Charged to dispensary per completed delivery |
| Consumer delivery fee | $3-7/order | Charged to customer (optional, dispensary configurable) |
| Monthly platform fee | $299-599/mo | Base access to delivery platform |
| Payment processing | 2.5-3.5% | On ACH/debit transactions processed through platform |

---

## 7. Convex Schema Design (Cannabis)

### New Tables Needed

```
# CORE
cannabisCompanies        — extends companies with license types, Metrc creds
cannabisLicenses         — per-state license tracking (type, number, expiry)
cannabisLocations        — physical locations tied to licenses

# ACCOUNTING
chartOfAccounts          — cannabis-specific COA templates + custom accounts
transactions             — journal entries, auto-entries from POS/Metrc
taxProfiles              — per-state tax configuration (rates, rules, deadlines)
taxFilings               — scheduled/completed tax filings with status
cogsAllocations          — 280E allocation records (method, ratios, documentation)
cashReconciliations      — vault → drawer → bank deposit tracking
auditTrails              — immutable log of every financial action

# INVENTORY
products                 — strain database, product catalog
inventoryBatches         — batch-level tracking tied to Metrc UIDs
inventoryMovements       — receipt, sale, transfer, waste, adjustment
billOfMaterials          — recipes for manufactured products
purchaseOrders           — ordering from suppliers

# DELIVERY
deliveryOrders           — customer orders for delivery
deliveryDrivers          — driver profiles, compliance, background check status
deliveryShifts           — scheduled shifts with zone assignments
deliveryRoutes           — optimized routes with stops
deliveryManifests        — Metrc manifests tied to routes
deliveryVerifications    — ID scans, signatures, photos at door
gpsLogs                  — location history for compliance

# COMPLIANCE
complianceRules          — state-specific rule engine
complianceAlerts         — deadline alerts, regulatory changes
complianceDocuments      — generated reports, audit packages

# AI
aiAgentLogs              — all AI agent actions and decisions
aiClassifications        — expense categorization decisions + confidence
aiRecommendations        — optimization suggestions with status
```

---

## 8. AI Agents Summary

| # | Agent | Pillar | Purpose | Deploy |
|---|-------|--------|---------|--------|
| 1 | 280E Allocation Agent | Accounting | Auto-classify expenses COGS vs Operating | Convex action + OpenAI |
| 2 | Compliance Monitor Agent | Accounting | Track regulatory changes, flag discrepancies | Cron job + web scraping |
| 3 | Tax Optimization Agent | Accounting | Entity structuring, deduction optimization | On-demand advisory |
| 4 | Demand Forecasting Agent | Ops | Predict demand, optimize purchasing | Daily batch + real-time |
| 5 | Route Optimization Agent | Delivery | Multi-stop routing with cannabis constraints | Real-time per dispatch |
| 6 | Delivery Intelligence Agent | Delivery | Staffing optimization, fraud detection | Hourly batch analysis |

**Agent Implementation Stack:**
- Convex actions for real-time agents (1, 5)
- Convex cron jobs for batch agents (2, 4, 6)
- OpenAI/Anthropic API for LLM-powered agents (1, 3)
- Custom ML models for prediction agents (4, 5, 6)
- Web scraping + RSS for regulatory monitoring (2)

---

## 9. Step-by-Step Implementation Plan

### Phase 0: Foundation (Weeks 1-2)
1. Create new repo `tranquillo-green` (or monorepo workspace)
2. Scaffold Next.js 14 + Convex + Clerk + Tailwind (copy patterns from tranquillo-labs)
3. Deploy Convex schema for core tables (companies, licenses, locations, auth)
4. Set up multi-tenant architecture with cannabis-specific roles
   (owner, accountant, manager, budtender, driver)
5. Configure Clerk with cannabis-specific onboarding flow
6. Set up CI/CD pipeline

### Phase 1: Accounting MVP (Weeks 3-8)
1. Build cannabis chart of accounts system (templates by business type)
2. Implement transaction entry (manual + import)
3. Build 280E COGS allocation engine (square footage + time-based methods)
4. Implement multi-state tax rate engine (start with CA, CO, MI)
5. Build cash reconciliation workflow (vault → drawer → bank)
6. Create financial reports (P&L with 280E split, Balance Sheet, COGS schedule)
7. Build QuickBooks Online export functionality
8. Implement quarterly estimated tax payment calculator
9. Build tax filing deadline tracker with alerts
10. **Deploy Agent 1:** 280E Allocation Agent (expense auto-categorization)
11. **Deploy Agent 2:** Compliance Monitor Agent (deadline alerts, Metrc reconciliation)

### Phase 2: Metrc Integration (Weeks 9-12)
1. Apply for Metrc Validated Integrator status (CA first)
2. Complete Metrc training + sandbox testing
3. Build Metrc API abstraction layer
4. Implement inventory sync (Metrc packages → local inventory)
5. Build batch cost tracking tied to Metrc UIDs
6. Implement Metrc-to-books reconciliation reports
7. Auto-generate Metrc compliance reports

### Phase 3: Unified Ops (Weeks 13-20)
1. Build POS module (product catalog, transaction processing)
2. Implement inventory management (receiving, transfers, waste)
3. Build compliance dashboard (license tracking, deadline calendar)
4. Implement CRM/customer management
5. Build workforce management (scheduling, time tracking with 280E split)
6. POS → Accounting auto-sync
7. **Deploy Agent 4:** Demand Forecasting Agent

### Phase 4: Delivery (Weeks 21-28)
1. Build online ordering storefront
2. Implement driver management (onboarding, scheduling, compliance)
3. Build dispatch system with order queue
4. Implement Metrc manifest generation for deliveries
5. Build driver mobile app (route navigation, ID scanning, signature capture)
6. Implement GPS tracking with geofencing
7. Build payment processing at door (ACH + cash)
8. Implement customer-facing order tracking
9. **Deploy Agent 5:** Route Optimization Agent
10. **Deploy Agent 6:** Delivery Intelligence Agent

### Phase 5: Scale & Optimize (Weeks 29+)
1. Add BioTrack integration (NY, NJ, IL)
2. Add Leaf Data Systems integration (WA)
3. Expand state tax engine to all legal states
4. Build advanced analytics / BI dashboard
5. **Deploy Agent 3:** Tax Optimization Agent (entity structuring advisory)
6. Build post-280E migration tools (amended return calculator, COA restructuring)
7. Add POS integrations (Dutchie, Flowhub, Treez) for operators who keep
   existing POS but want our accounting + delivery
8. Build wholesale/B2B marketplace features
9. Build hemp-cannabis dual-compliance module

---

## 10. Future Scope

### Inside the Platform (Product Expansion)
- **B2B Wholesale Marketplace:** Connect cultivators/manufacturers to retailers
  with price discovery, automated reordering, compliance documentation
- **Hemp-Cannabis Dual Compliance:** Handle both hemp (<0.3% THC) and cannabis
  regulatory frameworks for operators in both markets
- **Seed-to-Shelf Analytics:** Connect grow conditions → product quality →
  retail performance → customer satisfaction for end-to-end optimization
- **Banking/Fintech Layer:** Partner with cannabis-friendly banks to offer
  embedded banking (checking accounts, payment processing, lending) directly
  within the platform
- **Insurance Marketplace:** Connect operators with cannabis-specific insurance
  providers for general liability, product liability, crop insurance
- **Investor Reporting:** Auto-generated investor packages, financial
  statements, compliance reports for fundraising
- **White-Label Delivery:** Allow operators to offer delivery under their own
  brand with our infrastructure

### Outside the Platform (Market Expansion)
- **Other Regulated Industries:** Apply the same compliance-first accounting
  + ops + delivery playbook to:
  - Hemp/CBD businesses (different regulations, similar pain)
  - Psychedelics (Oregon, Colorado legalizing — nascent market)
  - Alcohol delivery (similar age verification + compliance needs)
  - Firearms dealers (similar regulatory burden, 280E-like constraints)
- **Cannabis Consulting Marketplace:** Connect operators with specialized
  CPAs, lawyers, compliance consultants through the platform
- **Data/Insights Business:** Anonymized, aggregated industry data
  (pricing trends, demand patterns, compliance benchmarks) sold to
  investors, researchers, regulators
- **International Expansion:** Canada, Germany, Thailand, Colombia — each
  with growing legal cannabis markets and similar pain points

---

## 11. Risks, Tradeoffs & Open Questions

### Risks
1. **Federal rescheduling timeline uncertainty** — 280E could be eliminated
   before we ship, removing the biggest hook. MITIGATION: Platform is
   useful post-280E (multi-state compliance, cash management, inventory
   costing still complex). Rescheduling actually creates transition demand.
2. **Metrc API access is slow** — Becoming a Validated Integrator takes
   months. MITIGATION: Build with manual import first, add Metrc later.
3. **Cannabis operators are cash-strapped** — Price compression means tight
   budgets. MITIGATION: Social equity tier at $49/mo, show immediate ROI
   (save $1000+/mo vs current CPA costs).
4. **Regulatory whiplash** — Rules change constantly. MITIGATION: Agent 2
   (Compliance Monitor) + modular rules engine, not hardcoded rules.
5. **Eaze-style failure** — Delivery-only model died. MITIGATION: Delivery
   is pillar 3, not pillar 1. We're integrated, not marketplace.

### Tradeoffs
- **New repo vs monorepo workspace:** New repo is cleaner separation but
  loses code sharing. Recommendation: monorepo with Turborepo for shared
  UI components and Convex patterns.
- **Build POS vs integrate existing POS:** Building our own POS is a bigger
  lift but eliminates dependency on Dutchie/Flowhub. Recommendation: Build
  our own for full control, but also support POS import for operators who
  don't want to switch.
- **CA-first vs multi-state MVP:** CA has the most operators but also the
  most competition. Recommendation: CA first (largest TAM, most mature
  Metrc integration), then expand.

### Open Questions
1. Should this be a separate Convex deployment or extend the existing
   tranquillo-labs Convex instance?
2. Monorepo (Turborepo) or separate repo?
3. Mobile app strategy — React Native, Expo, or PWA for driver app?
4. Payment processing partner — who for ACH at the door?
5. Do we want to pursue Metrc Validated Integrator status ourselves or
   use a middleware like Confident Cannabis / Distru's API layer?
6. Pricing validation — should we do customer discovery interviews before
   building?

---

## 12. Files Likely to Change / Create

### New Repo Structure (if separate repo)
```
tranquillo-green/
├── src/
│   ├── app/
│   │   ├── (auth)/           # sign-in, sign-up, onboarding
│   │   ├── dashboard/
│   │   │   ├── accounting/   # P&L, balance sheet, COGS, tax
│   │   │   ├── inventory/    # products, batches, movements
│   │   │   ├── compliance/   # licenses, deadlines, alerts
│   │   │   ├── delivery/     # orders, drivers, routes, manifests
│   │   │   ├── customers/    # CRM, loyalty, medical cards
│   │   │   ├── workforce/    # scheduling, time tracking
│   │   │   ├── settings/     # company, integrations, billing
│   │   │   └── page.tsx      # overview dashboard
│   │   ├── storefront/       # consumer-facing ordering
│   │   └── driver/           # driver mobile interface
│   ├── components/
│   │   ├── accounting/       # transaction forms, reports, charts
│   │   ├── inventory/        # batch tracking, receiving, counts
│   │   ├── delivery/         # dispatch board, route map, manifests
│   │   ├── compliance/       # license cards, deadline calendar
│   │   └── ui/               # shared components (from tranquillo-labs)
│   ├── lib/
│   │   ├── metrc/            # Metrc API client
│   │   ├── biotrack/         # BioTrack API client
│   │   ├── tax-engine/       # multi-state tax calculations
│   │   ├── allocation/       # 280E COGS allocation logic
│   │   └── routing/          # route optimization
│   └── hooks/
├── convex/
│   ├── schema.ts             # cannabis-specific schema
│   ├── accounting/           # financial mutations/queries
│   ├── inventory/            # inventory mutations/queries
│   ├── delivery/             # delivery mutations/queries
│   ├── compliance/           # compliance mutations/queries
│   ├── agents/               # AI agent actions
│   └── integrations/         # Metrc, QBO, payment APIs
└── package.json
```

---

## 13. Validation & Testing

- [ ] Unit tests for 280E allocation calculations across all methods
- [ ] Unit tests for multi-state tax rate engine (all 7+ initial states)
- [ ] Integration tests for Metrc API sync (sandbox environment)
- [ ] E2E tests for complete accounting workflow (transaction → COGS → tax)
- [ ] E2E tests for delivery workflow (order → manifest → dispatch → verify → deliver)
- [ ] Load testing for POS transaction throughput
- [ ] Compliance audit simulation (generate audit package, verify completeness)
- [ ] Cash reconciliation accuracy tests
- [ ] AI agent accuracy benchmarks (280E categorization precision/recall)
- [ ] Route optimization benchmarks (delivery time, capacity utilization)
- [ ] Security audit (financial data encryption, access controls, audit trails)
