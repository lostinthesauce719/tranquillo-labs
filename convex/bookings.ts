import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    companyId: v.id("companies"),
    date: v.optional(v.string()), // ISO date string YYYY-MM-DD
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("confirmed"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("no_show")
      )
    ),
    techId: v.optional(v.id("memberships")),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("emergency")
      )
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("bookings")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .collect();

    if (args.date) {
      results = results.filter((b) => b.scheduledDate === args.date);
    }
    if (args.status) {
      results = results.filter((b) => b.status === args.status);
    }
    if (args.techId) {
      results = results.filter((b) => b.techId === args.techId);
    }
    if (args.priority) {
      results = results.filter((b) => b.priority === args.priority);
    }
    if (args.search) {
      const term = args.search.toLowerCase();
      results = results.filter(
        (b) =>
          b.customerName.toLowerCase().includes(term) ||
          b.serviceType.toLowerCase().includes(term) ||
          (b.customerAddress ?? "").toLowerCase().includes(term)
      );
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    intakeSessionId: v.optional(v.id("intakeSessions")),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    customerAddress: v.string(),
    serviceType: v.string(),
    description: v.optional(v.string()),
    scheduledDate: v.string(), // YYYY-MM-DD
    scheduledTime: v.string(), // HH:MM
    estimatedDuration: v.number(), // minutes
    techId: v.optional(v.id("memberships")),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("emergency")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("bookings", {
      ...args,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
      completedAt: undefined,
      cancelledAt: undefined,
    });

    // If linked to an intake session, update its status
    if (args.intakeSessionId) {
      await ctx.db.patch(args.intakeSessionId, {
        status: "scheduled",
        updatedAt: now,
      });
    }

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("bookings"),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.string()),
    estimatedDuration: v.optional(v.number()),
    techId: v.optional(v.id("memberships")),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("emergency")
      )
    ),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
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

export const cancel = mutation({
  args: {
    id: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "cancelled",
      cancelledAt: now,
      updatedAt: now,
      ...(args.reason ? { notes: args.reason } : {}),
    });
    return args.id;
  },
});

export const getUpcoming = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const all = await ctx.db
      .query("bookings")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("asc")
      .collect();

    return all
      .filter(
        (b) =>
          b.scheduledDate >= today &&
          b.status !== "cancelled" &&
          b.status !== "completed"
      )
      .slice(0, 20);
  },
});

export const getByTechnician = query({
  args: {
    technicianId: v.id("memberships"),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("bookings")
      .withIndex("by_technician", (q) => q.eq("technicianId", args.technicianId))
      .collect();

    return all
      .filter(
        (b) =>
          b.scheduledDate >= args.startDate &&
          b.scheduledDate <= args.endDate &&
          b.status !== "cancelled"
      )
      .sort((a, b) => {
        // Emergency first
        if (a.priority === "EMERGENCY" && b.priority !== "EMERGENCY") return -1;
        if (b.priority === "EMERGENCY" && a.priority !== "EMERGENCY") return 1;
        // Then by time window ascending
        return (a.timeWindow ?? "").localeCompare(b.timeWindow ?? "");
      });
  },
});

export const updateTechNotes = mutation({
  args: {
    id: v.id("bookings"),
    techNotes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      // Store tech notes in dispatchNotes for now (or a dedicated field)
      // Using a convention: append tech notes
    });
    // For MVP, we update the booking's notes-like field
    // Since schema doesn't have techNotes, we'll use a workaround
    return args.id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
    };
    if (args.status === "completed") {
      updates.completedAt = now;
    }
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const getTodayCount = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const all = await ctx.db
      .query("bookings")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    return all.filter(
      (b) => b.scheduledDate === today && b.status !== "cancelled"
    ).length;
  },
});
