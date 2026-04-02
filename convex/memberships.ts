import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    if (!membership) return null;
    const company = await ctx.db.get(membership.companyId);
    return { membership, company };
  },
});

export const getMembers = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memberships")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
  },
});

export const getCurrentUser = query({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("memberships")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
    return members.find((m) => m.userId === args.userId) ?? null;
  },
});

export const inviteMember = mutation({
  args: {
    companyId: v.id("companies"),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("dispatcher"),
      v.literal("csr"),
      v.literal("tech")
    ),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("memberships", {
      companyId: args.companyId,
      email: args.email,
      name: args.name,
      role: args.role,
      clerkUserId: "", // Will be linked when user accepts invite
      status: "invited",
    });
    return id;
  },
});

export const updateRole = mutation({
  args: {
    membershipId: v.id("memberships"),
    role: v.union(
      v.literal("owner"),
      v.literal("dispatcher"),
      v.literal("csr"),
      v.literal("tech")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.membershipId, {
      role: args.role,
    });
    return args.membershipId;
  },
});

export const removeMember = mutation({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.membershipId);
  },
});
