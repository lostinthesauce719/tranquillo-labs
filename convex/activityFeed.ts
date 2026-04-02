import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityFeed")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .take(50);
  },
});

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    type: v.union(
      v.literal("intake_created"),
      v.literal("intake_assigned"),
      v.literal("intake_resolved"),
      v.literal("intake_escalated"),
      v.literal("booking_created"),
      v.literal("booking_completed"),
      v.literal("booking_cancelled"),
      v.literal("member_invited"),
      v.literal("member_removed"),
      v.literal("call_received"),
      v.literal("note_added"),
      v.literal("settings_updated")
    ),
    actorName: v.string(),
    actorId: v.optional(v.string()),
    description: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("activityFeed", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});
