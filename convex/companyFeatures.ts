import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companyFeatures")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
  },
});
