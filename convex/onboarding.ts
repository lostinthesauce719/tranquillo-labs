import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new company during onboarding step 1.
 */
export const createCompany = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    timezone: v.string(),
    phone: v.optional(v.string()),
    businessTypes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("companies", {
      name: args.name,
      slug: args.slug,
      timezone: args.timezone,
      phone: args.phone,
      businessTypes: args.businessTypes,
      setupStatus: "onboarding",
    });
  },
});

/**
 * Create the owner membership for the onboarding user.
 */
export const createOwnerMembership = mutation({
  args: {
    companyId: v.id("companies"),
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memberships", {
      companyId: args.companyId,
      clerkUserId: args.clerkUserId,
      name: args.name,
      email: args.email,
      role: "owner",
      status: "active",
    });
  },
});

/**
 * Initialize default features for a company during onboarding.
 */
export const initializeFeatures = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const defaults = [
      { featureName: "webIntake", active: true, addOnMonthlyRate: 0 },
      { featureName: "smsIntake", active: false, addOnMonthlyRate: 49 },
      { featureName: "voiceAgent", active: false, addOnMonthlyRate: 99 },
      { featureName: "afterHoursMode", active: false, addOnMonthlyRate: 29 },
    ];

    const ids = [];
    for (const feat of defaults) {
      const id = await ctx.db.insert("companyFeatures", {
        companyId: args.companyId,
        ...feat,
      });
      ids.push(id);
    }
    return ids;
  },
});

/**
 * Mark onboarding as complete, set company to active.
 */
export const activateCompany = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.companyId, {
      setupStatus: "active",
    });
    return args.companyId;
  },
});
