import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .collect();

    return all.filter((n) => n.userId === args.userId).slice(0, 50);
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      read: true,
      readAt: Date.now(),
    });
    return args.id;
  },
});

export const markAllRead = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const unread = all.filter((n) => n.userId === args.userId && !n.read);
    const now = Date.now();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, {
        read: true,
        readAt: now,
      });
    }

    return unread.length;
  },
});

export const getUnreadCount = query({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    return all.filter((n) => n.userId === args.userId && !n.read).length;
  },
});
