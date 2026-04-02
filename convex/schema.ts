import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Companies ──────────────────────────────────────────────────────
  companies: defineTable({
    name: v.string(),
    slug: v.string(),
    timezone: v.string(),
    phone: v.optional(v.string()),
    businessTypes: v.array(v.string()),
    operatingHours: v.optional(
      v.object({
        start: v.string(), // e.g. "08:00"
        end: v.string(),   // e.g. "18:00"
        days: v.array(v.string()), // e.g. ["mon","tue",...]
      })
    ),
    afterHoursStart: v.optional(v.string()),
    afterHoursEnd: v.optional(v.string()),
    setupStatus: v.union(
      v.literal("onboarding"),
      v.literal("active"),
      v.literal("suspended")
    ),
    brandingColor: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_setupStatus", ["setupStatus"]),

  // ── Memberships (users with roles) ─────────────────────────────────
  memberships: defineTable({
    companyId: v.id("companies"),
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("dispatcher"),
      v.literal("csr"),
      v.literal("tech")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("invited"),
      v.literal("inactive")
    ),
  })
    .index("by_company", ["companyId"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_company_role", ["companyId", "role"])
    .index("by_company_status", ["companyId", "status"])
    .index("by_company_clerkUserId", ["companyId", "clerkUserId"]),

  // ── Intake Sessions ────────────────────────────────────────────────
  intakeSessions: defineTable({
    companyId: v.id("companies"),
    channel: v.union(
      v.literal("WEB"),
      v.literal("SMS"),
      v.literal("VOICE")
    ),
    // Customer info
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    // Property info
    propertyType: v.optional(v.string()),
    addressStreet: v.optional(v.string()),
    addressCity: v.optional(v.string()),
    addressState: v.optional(v.string()),
    addressZip: v.optional(v.string()),
    // Issue details
    issueRaw: v.string(),
    aiSummary: v.optional(v.string()),
    serviceCategory: v.optional(v.string()),
    urgencyScore: v.optional(v.number()), // 1-10
    tags: v.optional(v.array(v.string())),
    // Status & assignment
    status: v.union(
      v.literal("new"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("escalated")
    ),
    assignedTechId: v.optional(v.id("memberships")),
    // Access details
    accessNotes: v.optional(v.string()),
    pets: v.optional(v.string()),
    gateCode: v.optional(v.string()),
    // Dispatch
    dispatchNotes: v.optional(v.string()),
    createdAt: v.number(), // timestamp ms
  })
    .index("by_company", ["companyId"])
    .index("by_company_status", ["companyId", "status"])
    .index("by_company_createdAt", ["companyId", "createdAt"])
    .index("by_company_urgency", ["companyId", "urgencyScore"])
    .index("by_company_channel", ["companyId", "channel"])
    .index("by_assignedTech", ["assignedTechId"])
    .index("by_company_serviceCategory", ["companyId", "serviceCategory"]),

  // ── Bookings ───────────────────────────────────────────────────────
  bookings: defineTable({
    companyId: v.id("companies"),
    intakeSessionId: v.optional(v.id("intakeSessions")),
    // Customer info
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    // Service info
    serviceCategory: v.optional(v.string()),
    priority: v.union(
      v.literal("EMERGENCY"),
      v.literal("URGENT"),
      v.literal("STANDARD"),
      v.literal("LOW")
    ),
    // Schedule
    scheduledDate: v.string(), // ISO date string YYYY-MM-DD
    timeWindow: v.optional(v.string()), // e.g. "8am-12pm"
    // Technician
    technicianId: v.optional(v.id("memberships")),
    technicianName: v.optional(v.string()),
    // Status
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    // Details
    diagnosticFee: v.optional(v.number()),
    accessNotes: v.optional(v.string()),
    dispatchNotes: v.optional(v.string()),
    source: v.union(
      v.literal("web"),
      v.literal("sms"),
      v.literal("voice"),
      v.literal("manual")
    ),
    createdAt: v.number(), // timestamp ms
  })
    .index("by_company", ["companyId"])
    .index("by_company_status", ["companyId", "status"])
    .index("by_company_scheduledDate", ["companyId", "scheduledDate"])
    .index("by_company_priority", ["companyId", "priority"])
    .index("by_technician", ["technicianId"])
    .index("by_company_createdAt", ["companyId", "createdAt"])
    .index("by_intakeSession", ["intakeSessionId"])
    .index("by_company_source", ["companyId", "source"]),

  // ── Calls ──────────────────────────────────────────────────────────
  calls: defineTable({
    companyId: v.id("companies"),
    callerPhone: v.optional(v.string()),
    callerName: v.optional(v.string()),
    duration: v.optional(v.number()), // seconds
    outcome: v.union(
      v.literal("booked"),
      v.literal("escalated"),
      v.literal("abandoned"),
      v.literal("voicemail")
    ),
    urgencyScore: v.optional(v.number()), // 1-10
    transcriptText: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
    callSid: v.optional(v.string()), // Twilio SID
    linkedIntakeSessionId: v.optional(v.id("intakeSessions")),
    createdAt: v.number(), // timestamp ms
  })
    .index("by_company", ["companyId"])
    .index("by_company_createdAt", ["companyId", "createdAt"])
    .index("by_company_outcome", ["companyId", "outcome"])
    .index("by_callSid", ["callSid"])
    .index("by_linkedIntakeSession", ["linkedIntakeSessionId"]),

  // ── Activity Feed ──────────────────────────────────────────────────
  activityFeed: defineTable({
    companyId: v.id("companies"),
    type: v.union(
      v.literal("intake"),
      v.literal("booking"),
      v.literal("call"),
      v.literal("assign"),
      v.literal("escalation")
    ),
    text: v.string(),
    linkedId: v.optional(v.string()), // generic ID reference
    createdAt: v.number(), // timestamp ms
  })
    .index("by_company", ["companyId"])
    .index("by_company_createdAt", ["companyId", "createdAt"])
    .index("by_company_type", ["companyId", "type"]),

  // ── Notifications ──────────────────────────────────────────────────
  notifications: defineTable({
    companyId: v.id("companies"),
    userId: v.string(), // clerkUserId
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    linkedRoute: v.optional(v.string()),
    createdAt: v.number(), // timestamp ms
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"])
    .index("by_company", ["companyId"])
    .index("by_user_createdAt", ["userId", "createdAt"]),

  // ── Company Plans (billing / tier) ─────────────────────────────────
  companyPlans: defineTable({
    companyId: v.id("companies"),
    tier: v.union(
      v.literal("foundation"),
      v.literal("ops_pro"),
      v.literal("enterprise")
    ),
    monthlyRate: v.number(),
    setupFee: v.optional(v.number()),
    financingPlan: v.optional(v.string()),
    setupBalanceRemaining: v.optional(v.number()),
    nextBillingDate: v.optional(v.string()), // ISO date
    // Usage tracking
    voiceMinutesUsed: v.optional(v.number()),
    voiceMinutesLimit: v.optional(v.number()),
    smsVolumeUsed: v.optional(v.number()),
    smsVolumeLimit: v.optional(v.number()),
    intakeSessionsUsed: v.optional(v.number()),
    intakeSessionsLimit: v.optional(v.number()),
  })
    .index("by_company", ["companyId"])
    .index("by_tier", ["tier"]),

  // ── Company Features (add-ons / feature flags) ─────────────────────
  companyFeatures: defineTable({
    companyId: v.id("companies"),
    featureName: v.string(),
    active: v.boolean(),
    addOnMonthlyRate: v.optional(v.number()),
  })
    .index("by_company", ["companyId"])
    .index("by_company_feature", ["companyId", "featureName"])
    .index("by_company_active", ["companyId", "active"]),
});
