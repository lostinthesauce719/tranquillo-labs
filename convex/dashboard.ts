import { query } from "./_generated/server";
import { v } from "convex/values";

export const getKPIs = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const todayStart = new Date(today).getTime();
    const todayEnd = todayStart + 86400000; // +24h

    // Calls today: intake sessions via phone channel created today
    const allIntakes = await ctx.db
      .query("intakeSessions")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const callsToday = allIntakes.filter(
      (s) =>
        s.channel === "phone" &&
        s.createdAt >= todayStart &&
        s.createdAt < todayEnd
    ).length;

    // Open intakes: status is new, in_progress, or escalated
    const openIntakes = allIntakes.filter(
      (s) =>
        s.status === "new" ||
        s.status === "in_progress" ||
        s.status === "escalated"
    ).length;

    // Bookings today
    const allBookings = await ctx.db
      .query("bookings")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const bookingsToday = allBookings.filter(
      (b) => b.scheduledDate === today && b.status !== "cancelled"
    ).length;

    // Average response time: time from creation to first assignment (for resolved/in_progress intakes)
    const respondedIntakes = allIntakes.filter(
      (s) =>
        s.assignedTechId &&
        (s.status === "resolved" ||
          s.status === "in_progress" ||
          s.status === "scheduled")
    );

    let avgResponseTimeMinutes = 0;
    if (respondedIntakes.length > 0) {
      const totalMs = respondedIntakes.reduce((sum, s) => {
        // Use updatedAt as a proxy for assignment time vs createdAt
        return sum + (s.updatedAt - s.createdAt);
      }, 0);
      avgResponseTimeMinutes = Math.round(
        totalMs / respondedIntakes.length / 60000
      );
    }

    return {
      callsToday,
      openIntakes,
      bookingsToday,
      avgResponseTimeMinutes,
      totalIntakes: allIntakes.length,
      totalBookings: allBookings.length,
    };
  },
});

export const getRecentActivity = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityFeed")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .take(10);
  },
});
