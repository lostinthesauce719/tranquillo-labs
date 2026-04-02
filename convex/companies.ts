import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.companyId);
  },
});

export const updateCompany = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    timezone: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    brandingColor: v.optional(v.string()),
    businessTypes: v.optional(v.array(v.string())),
    afterHoursStart: v.optional(v.string()),
    afterHoursEnd: v.optional(v.string()),
    operatingHours: v.optional(
      v.object({
        start: v.string(),
        end: v.string(),
        days: v.array(v.string()),
      })
    ),
    settings: v.optional(
      v.object({
        defaultUrgencyThreshold: v.optional(v.number()),
        autoEscalateAfterMinutes: v.optional(v.number()),
        businessHoursStart: v.optional(v.string()),
        businessHoursEnd: v.optional(v.string()),
        enableSmsNotifications: v.optional(v.boolean()),
        enableEmailNotifications: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { companyId, ...updates } = args;
    // Remove undefined fields
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    cleanUpdates.updatedAt = Date.now();
    await ctx.db.patch(companyId, cleanUpdates);
    return companyId;
  },
});
