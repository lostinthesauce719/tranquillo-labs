import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    companyId: v.id("companies"),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("in_progress"),
        v.literal("scheduled"),
        v.literal("resolved"),
        v.literal("escalated"),
        v.literal("cancelled")
      )
    ),
    channel: v.optional(
      v.union(
        v.literal("phone"),
        v.literal("web"),
        v.literal("email"),
        v.literal("chat"),
        v.literal("walk_in")
      )
    ),
    minUrgency: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("intakeSessions")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .collect();

    if (args.status) {
      results = results.filter((s) => s.status === args.status);
    }
    if (args.channel) {
      results = results.filter((s) => s.channel === args.channel);
    }
    if (args.minUrgency !== undefined) {
      results = results.filter(
        (s) => (s.urgencyScore ?? 0) >= args.minUrgency!
      );
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("intakeSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    channel: v.union(
      v.literal("phone"),
      v.literal("web"),
      v.literal("email"),
      v.literal("chat"),
      v.literal("walk_in")
    ),
    serviceType: v.string(),
    description: v.string(),
    urgencyScore: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("intakeSessions", {
      ...args,
      status: "new",
      assignedTechId: undefined,
      createdAt: now,
      updatedAt: now,
      resolvedAt: undefined,
      escalatedAt: undefined,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("intakeSessions"),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    description: v.optional(v.string()),
    urgencyScore: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    cleanUpdates.updatedAt = Date.now();
    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

export const createFromWeb = mutation({
  args: {
    companyId: v.id("companies"),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    addressStreet: v.optional(v.string()),
    addressCity: v.optional(v.string()),
    addressState: v.optional(v.string()),
    addressZip: v.optional(v.string()),
    serviceCategory: v.optional(v.string()),
    issueRaw: v.string(),
    isEmergency: v.optional(v.boolean()),
    accessNotes: v.optional(v.string()),
    pets: v.optional(v.string()),
    gateCode: v.optional(v.string()),
    timePreference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { isEmergency, timePreference, ...fields } = args;
    const now = Date.now();
    const id = await ctx.db.insert("intakeSessions", {
      ...fields,
      channel: "WEB",
      status: "new",
      urgencyScore: isEmergency ? 9 : 3,
      tags: timePreference ? [timePreference] : [],
      dispatchNotes: timePreference
        ? `Preferred time: ${timePreference}`
        : undefined,
      createdAt: now,
    });
    return id;
  },
});

export const assignTech = mutation({
  args: {
    id: v.id("intakeSessions"),
    techId: v.id("memberships"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      assignedTechId: args.techId,
      status: "in_progress",
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const markResolved = mutation({
  args: {
    id: v.id("intakeSessions"),
    resolutionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "resolved",
      resolvedAt: now,
      updatedAt: now,
      ...(args.resolutionNotes ? { notes: args.resolutionNotes } : {}),
    });
    return args.id;
  },
});

/**
 * updateAiScoring - Updates an intake session with AI-generated urgency score
 * and summary. Optionally escalates the session if score >= 9.
 * Called by the aiScoring.scoreIntake action.
 */
export const updateAiScoring = mutation({
  args: {
    intakeSessionId: v.id("intakeSessions"),
    urgencyScore: v.number(),
    aiSummary: v.string(),
    escalate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.intakeSessionId);
    if (!session) {
      throw new Error(`Intake session not found: ${args.intakeSessionId}`);
    }

    const updates: Record<string, unknown> = {
      urgencyScore: args.urgencyScore,
      aiSummary: args.aiSummary,
    };

    if (args.escalate) {
      updates.status = "escalated";
    }

    await ctx.db.patch(args.intakeSessionId, updates);
    return args.intakeSessionId;
  },
});

export const escalate = mutation({
  args: {
    id: v.id("intakeSessions"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const session = await ctx.db.get(args.id);
    await ctx.db.patch(args.id, {
      status: "escalated",
      escalatedAt: now,
      updatedAt: now,
      urgencyScore: Math.min((session?.urgencyScore ?? 5) + 2, 10),
      ...(args.reason
        ? { notes: `${session?.notes ?? ""}\n[ESCALATED] ${args.reason}` }
        : {}),
    });
    return args.id;
  },
});
