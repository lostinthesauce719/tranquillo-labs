import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    companyId: v.id("companies"),
    outcome: v.optional(
      v.union(
        v.literal("booked"),
        v.literal("escalated"),
        v.literal("abandoned"),
        v.literal("voicemail")
      )
    ),
    startDate: v.optional(v.number()), // timestamp ms
    endDate: v.optional(v.number()),   // timestamp ms
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("calls")
      .withIndex("by_company_createdAt", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .collect();

    if (args.outcome) {
      results = results.filter((c) => c.outcome === args.outcome);
    }
    if (args.startDate !== undefined) {
      results = results.filter((c) => c.createdAt >= args.startDate!);
    }
    if (args.endDate !== undefined) {
      results = results.filter((c) => c.createdAt <= args.endDate!);
    }

    return results;
  },
});

export const getById = query({
  args: { id: v.id("calls") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTodayStats = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    // Get start of today (UTC)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todayCalls = await ctx.db
      .query("calls")
      .withIndex("by_company_createdAt", (q) =>
        q.eq("companyId", args.companyId).gte("createdAt", startOfDay)
      )
      .collect();

    const totalCalls = todayCalls.length;

    const totalDuration = todayCalls.reduce((sum, c) => sum + (c.duration ?? 0), 0);
    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    const bookedCount = todayCalls.filter((c) => c.outcome === "booked").length;
    const escalatedCount = todayCalls.filter((c) => c.outcome === "escalated").length;

    return {
      totalCalls,
      avgDuration,
      bookedCount,
      escalatedCount,
    };
  },
});
