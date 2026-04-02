import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("companyPlans")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
    return plans[0] ?? null;
  },
});
