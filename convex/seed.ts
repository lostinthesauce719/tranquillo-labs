import { mutation } from "./_generated/server";

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // 1. Create demo company
    const companyId = await ctx.db.insert("companies", {
      name: "Comfort Zone HVAC & Plumbing",
      phone: "(512) 555-0190",
      email: "dispatch@comfortzonehvac.com",
      address: "4820 Industrial Blvd, Suite 200, Austin, TX 78745",
      website: "https://comfortzonehvac.com",
      timezone: "America/Chicago",
      logoUrl: "",
      settings: {
        defaultUrgencyThreshold: 7,
        autoEscalateAfterMinutes: 30,
        businessHoursStart: "07:00",
        businessHoursEnd: "18:00",
        enableSmsNotifications: true,
        enableEmailNotifications: true,
      },
      createdAt: now - 90 * 86400000,
      updatedAt: now,
    });

    // 2. Create team members
    const members = [
      { name: "Maria Santos", email: "maria@comfortzonehvac.com", role: "owner", phone: "(512) 555-0101", userId: "user_maria" },
      { name: "Jake Thompson", email: "jake@comfortzonehvac.com", role: "dispatcher", phone: "(512) 555-0102", userId: "user_jake" },
      { name: "Ravi Patel", email: "ravi@comfortzonehvac.com", role: "technician", phone: "(512) 555-0103", userId: "user_ravi" },
      { name: "Sarah Chen", email: "sarah@comfortzonehvac.com", role: "technician", phone: "(512) 555-0104", userId: "user_sarah" },
      { name: "Marcus Johnson", email: "marcus@comfortzonehvac.com", role: "technician", phone: "(512) 555-0105", userId: "user_marcus" },
      { name: "Lisa Nguyen", email: "lisa@comfortzonehvac.com", role: "admin", phone: "(512) 555-0106", userId: "user_lisa" },
    ] as const;

    const memberIds: Record<string, any> = {};
    for (const m of members) {
      memberIds[m.userId] = await ctx.db.insert("memberships", {
        companyId,
        name: m.name,
        email: m.email,
        role: m.role,
        phone: m.phone,
        userId: m.userId,
        status: "active",
        createdAt: now - 80 * 86400000,
        updatedAt: now,
      });
    }

    // 3. Intake Sessions (20)
    const intakeData = [
      { customerName: "Robert Williams", customerPhone: "(512) 555-1001", customerAddress: "1423 Oak Hill Dr, Austin, TX 78749", channel: "phone", serviceType: "HVAC Repair", description: "AC unit not cooling, blowing warm air. House is at 85°F.", urgencyScore: 8, status: "new" },
      { customerName: "Jennifer Martinez", customerPhone: "(512) 555-1002", customerAddress: "890 Maple Creek Ln, Round Rock, TX 78681", channel: "web", serviceType: "Plumbing", description: "Kitchen sink leaking under cabinet. Water pooling on floor.", urgencyScore: 7, status: "in_progress" },
      { customerName: "David Lee", customerPhone: "(512) 555-1003", customerAddress: "2156 Sunset Blvd, Cedar Park, TX 78613", channel: "phone", serviceType: "HVAC Maintenance", description: "Annual AC tune-up before summer. System is 5 years old.", urgencyScore: 3, status: "scheduled" },
      { customerName: "Amanda Foster", customerPhone: "(512) 555-1004", customerAddress: "734 Elm Street, Austin, TX 78704", channel: "email", serviceType: "Electrical", description: "Multiple outlets in living room stopped working after storm.", urgencyScore: 6, status: "new" },
      { customerName: "Michael Brown", customerPhone: "(512) 555-1005", customerAddress: "5612 Congress Ave, Austin, TX 78745", channel: "phone", serviceType: "Plumbing", description: "Water heater making loud banging noises. No hot water.", urgencyScore: 8, status: "escalated" },
      { customerName: "Patricia Garcia", customerPhone: "(512) 555-1006", customerAddress: "321 Bluebonnet Ln, Pflugerville, TX 78660", channel: "chat", serviceType: "HVAC Repair", description: "Furnace won't ignite. House temp dropping. Family with infant.", urgencyScore: 10, status: "in_progress" },
      { customerName: "Thomas Anderson", customerPhone: "(512) 555-1007", customerAddress: "1890 Riverside Dr, Austin, TX 78741", channel: "phone", serviceType: "Plumbing", description: "Toilet running constantly. Already tried jiggling handle.", urgencyScore: 4, status: "resolved" },
      { customerName: "Sandra White", customerPhone: "(512) 555-1008", customerAddress: "456 Pecan St, Georgetown, TX 78628", channel: "web", serviceType: "HVAC Installation", description: "Want quote for new central AC system. 2400 sq ft home.", urgencyScore: 2, status: "scheduled" },
      { customerName: "James Wilson", customerPhone: "(512) 555-1009", customerAddress: "2234 Lamar Blvd, Austin, TX 78705", channel: "phone", serviceType: "Electrical", description: "Circuit breaker keeps tripping when running microwave and AC.", urgencyScore: 5, status: "new" },
      { customerName: "Karen Taylor", customerPhone: "(512) 555-1010", customerAddress: "678 Barton Springs Rd, Austin, TX 78704", channel: "walk_in", serviceType: "Plumbing", description: "Garbage disposal jammed and making grinding noise.", urgencyScore: 4, status: "resolved" },
      { customerName: "Christopher Davis", customerPhone: "(512) 555-1011", customerAddress: "1345 Burnet Rd, Austin, TX 78756", channel: "phone", serviceType: "HVAC Repair", description: "Weird smell coming from vents when AC runs. Musty odor.", urgencyScore: 6, status: "in_progress" },
      { customerName: "Nancy Miller", customerPhone: "(512) 555-1012", customerAddress: "890 Slaughter Ln, Austin, TX 78748", channel: "email", serviceType: "Plumbing", description: "Slow draining bathtub. Getting worse over past week.", urgencyScore: 3, status: "new" },
      { customerName: "Daniel Harris", customerPhone: "(512) 555-1013", customerAddress: "2345 Anderson Mill Rd, Austin, TX 78750", channel: "phone", serviceType: "Electrical", description: "Need ceiling fan installed in master bedroom. Have the fan already.", urgencyScore: 2, status: "scheduled" },
      { customerName: "Betty Robinson", customerPhone: "(512) 555-1014", customerAddress: "567 S 1st St, Austin, TX 78704", channel: "phone", serviceType: "HVAC Repair", description: "AC compressor making loud clicking sounds. Intermittent cooling.", urgencyScore: 7, status: "new" },
      { customerName: "Mark Jackson", customerPhone: "(512) 555-1015", customerAddress: "1234 Manchaca Rd, Austin, TX 78704", channel: "web", serviceType: "Plumbing", description: "Main sewer line backup. Water coming up in downstairs shower.", urgencyScore: 9, status: "escalated" },
      { customerName: "Dorothy Clark", customerPhone: "(512) 555-1016", customerAddress: "4567 Parmer Ln, Austin, TX 78727", channel: "phone", serviceType: "HVAC Maintenance", description: "Haven't had AC serviced in 3 years. Want full inspection.", urgencyScore: 3, status: "resolved" },
      { customerName: "Steven Lewis", customerPhone: "(512) 555-1017", customerAddress: "789 E Cesar Chavez, Austin, TX 78702", channel: "chat", serviceType: "Electrical", description: "Lights flickering throughout house. Started yesterday.", urgencyScore: 7, status: "in_progress" },
      { customerName: "Carol Walker", customerPhone: "(512) 555-1018", customerAddress: "2456 S Lamar Blvd, Austin, TX 78704", channel: "phone", serviceType: "Plumbing", description: "Pipe burst in wall. Water damage spreading. Need emergency service.", urgencyScore: 10, status: "new" },
      { customerName: "Paul Hall", customerPhone: "(512) 555-1019", customerAddress: "345 W 6th St, Austin, TX 78701", channel: "web", serviceType: "HVAC Repair", description: "Thermostat not responding. Display is blank. Tried batteries.", urgencyScore: 5, status: "resolved" },
      { customerName: "Ruth Allen", customerPhone: "(512) 555-1020", customerAddress: "1678 N Lamar Blvd, Austin, TX 78752", channel: "phone", serviceType: "Electrical", description: "Want whole-house surge protector installed. Had lightning strike nearby.", urgencyScore: 4, status: "scheduled" },
    ];

    const intakeIds: any[] = [];
    for (let i = 0; i < intakeData.length; i++) {
      const d = intakeData[i];
      const createdAt = now - (20 - i) * 3600000 * (1 + Math.random());
      const techKeys = ["user_ravi", "user_sarah", "user_marcus"];
      const assignedTech =
        d.status !== "new"
          ? memberIds[techKeys[i % 3]]
          : undefined;

      const id = await ctx.db.insert("intakeSessions", {
        companyId,
        customerName: d.customerName,
        customerPhone: d.customerPhone,
        customerEmail: undefined,
        customerAddress: d.customerAddress,
        channel: d.channel as any,
        serviceType: d.serviceType,
        description: d.description,
        urgencyScore: d.urgencyScore,
        notes: "",
        status: d.status as any,
        assignedTechId: assignedTech,
        createdAt,
        updatedAt: createdAt + (d.status !== "new" ? 600000 : 0),
        resolvedAt: d.status === "resolved" ? createdAt + 7200000 : undefined,
        escalatedAt: d.status === "escalated" ? createdAt + 1800000 : undefined,
      });
      intakeIds.push(id);
    }

    // 4. Bookings (15)
    const bookingData = [
      { customerName: "David Lee", customerPhone: "(512) 555-1003", customerAddress: "2156 Sunset Blvd, Cedar Park, TX 78613", serviceType: "HVAC Maintenance", description: "Annual AC tune-up", scheduledDate: today, scheduledTime: "09:00", estimatedDuration: 90, priority: "normal", status: "confirmed" },
      { customerName: "Sandra White", customerPhone: "(512) 555-1008", customerAddress: "456 Pecan St, Georgetown, TX 78628", serviceType: "HVAC Installation", description: "New central AC system quote and assessment", scheduledDate: today, scheduledTime: "10:30", estimatedDuration: 120, priority: "normal", status: "in_progress" },
      { customerName: "Daniel Harris", customerPhone: "(512) 555-1013", customerAddress: "2345 Anderson Mill Rd, Austin, TX 78750", serviceType: "Electrical", description: "Ceiling fan installation", scheduledDate: today, scheduledTime: "13:00", estimatedDuration: 60, priority: "low", status: "scheduled" },
      { customerName: "Ruth Allen", customerPhone: "(512) 555-1020", customerAddress: "1678 N Lamar Blvd, Austin, TX 78752", serviceType: "Electrical", description: "Whole-house surge protector installation", scheduledDate: today, scheduledTime: "14:30", estimatedDuration: 120, priority: "normal", status: "scheduled" },
      { customerName: "Jennifer Martinez", customerPhone: "(512) 555-1002", customerAddress: "890 Maple Creek Ln, Round Rock, TX 78681", serviceType: "Plumbing", description: "Kitchen sink leak repair", scheduledDate: today, scheduledTime: "15:00", estimatedDuration: 60, priority: "high", status: "scheduled" },
      { customerName: "Robert Williams", customerPhone: "(512) 555-1001", customerAddress: "1423 Oak Hill Dr, Austin, TX 78749", serviceType: "HVAC Repair", description: "AC not cooling diagnosis and repair", scheduledDate: tomorrow, scheduledTime: "08:00", estimatedDuration: 120, priority: "high", status: "scheduled" },
      { customerName: "Amanda Foster", customerPhone: "(512) 555-1004", customerAddress: "734 Elm Street, Austin, TX 78704", serviceType: "Electrical", description: "Diagnose dead outlets in living room", scheduledDate: tomorrow, scheduledTime: "10:00", estimatedDuration: 90, priority: "normal", status: "scheduled" },
      { customerName: "Nancy Miller", customerPhone: "(512) 555-1012", customerAddress: "890 Slaughter Ln, Austin, TX 78748", serviceType: "Plumbing", description: "Clear bathtub drain blockage", scheduledDate: tomorrow, scheduledTime: "13:00", estimatedDuration: 60, priority: "low", status: "scheduled" },
      { customerName: "Betty Robinson", customerPhone: "(512) 555-1014", customerAddress: "567 S 1st St, Austin, TX 78704", serviceType: "HVAC Repair", description: "AC compressor inspection", scheduledDate: dayAfter, scheduledTime: "09:00", estimatedDuration: 90, priority: "high", status: "scheduled" },
      { customerName: "James Wilson", customerPhone: "(512) 555-1009", customerAddress: "2234 Lamar Blvd, Austin, TX 78705", serviceType: "Electrical", description: "Circuit breaker panel inspection", scheduledDate: dayAfter, scheduledTime: "11:00", estimatedDuration: 60, priority: "normal", status: "scheduled" },
      { customerName: "Thomas Anderson", customerPhone: "(512) 555-1007", customerAddress: "1890 Riverside Dr, Austin, TX 78741", serviceType: "Plumbing", description: "Toilet repair - running constantly", scheduledDate: yesterday, scheduledTime: "09:00", estimatedDuration: 45, priority: "normal", status: "completed" },
      { customerName: "Karen Taylor", customerPhone: "(512) 555-1010", customerAddress: "678 Barton Springs Rd, Austin, TX 78704", serviceType: "Plumbing", description: "Garbage disposal replacement", scheduledDate: yesterday, scheduledTime: "11:00", estimatedDuration: 60, priority: "normal", status: "completed" },
      { customerName: "Dorothy Clark", customerPhone: "(512) 555-1016", customerAddress: "4567 Parmer Ln, Austin, TX 78727", serviceType: "HVAC Maintenance", description: "Full system inspection and cleaning", scheduledDate: yesterday, scheduledTime: "14:00", estimatedDuration: 120, priority: "low", status: "completed" },
      { customerName: "Paul Hall", customerPhone: "(512) 555-1019", customerAddress: "345 W 6th St, Austin, TX 78701", serviceType: "HVAC Repair", description: "Thermostat replacement", scheduledDate: yesterday, scheduledTime: "16:00", estimatedDuration: 45, priority: "normal", status: "completed" },
      { customerName: "Mark Jackson", customerPhone: "(512) 555-1015", customerAddress: "1234 Manchaca Rd, Austin, TX 78704", serviceType: "Plumbing", description: "Emergency sewer line assessment", scheduledDate: today, scheduledTime: "07:30", estimatedDuration: 180, priority: "emergency", status: "in_progress" },
    ];

    const techKeys = ["user_ravi", "user_sarah", "user_marcus"];
    for (let i = 0; i < bookingData.length; i++) {
      const b = bookingData[i];
      const createdAt = now - (15 - i) * 7200000;
      await ctx.db.insert("bookings", {
        companyId,
        intakeSessionId: i < 5 ? intakeIds[i] : undefined,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        customerEmail: undefined,
        customerAddress: b.customerAddress,
        serviceType: b.serviceType,
        description: b.description,
        scheduledDate: b.scheduledDate,
        scheduledTime: b.scheduledTime,
        estimatedDuration: b.estimatedDuration,
        techId: memberIds[techKeys[i % 3]],
        priority: b.priority as any,
        status: b.status as any,
        notes: "",
        createdAt,
        updatedAt: createdAt,
        completedAt: b.status === "completed" ? createdAt + 3600000 : undefined,
        cancelledAt: undefined,
      });
    }

    // 5. Activity feed entries
    const activities = [
      { type: "call_received", actorName: "System", description: "Incoming call from Carol Walker (512) 555-1018 — pipe burst emergency", offset: 1 },
      { type: "intake_created", actorName: "Jake Thompson", description: "Created intake for Carol Walker — Pipe burst in wall, urgency 10/10", offset: 2 },
      { type: "intake_escalated", actorName: "Jake Thompson", description: "Escalated Mark Jackson's sewer line backup to emergency priority", offset: 3 },
      { type: "booking_created", actorName: "Jake Thompson", description: "Scheduled emergency sewer assessment for Mark Jackson at 7:30 AM", offset: 4 },
      { type: "call_received", actorName: "System", description: "Incoming call from Betty Robinson (512) 555-1014 — AC compressor clicking", offset: 5 },
      { type: "intake_assigned", actorName: "Jake Thompson", description: "Assigned Steven Lewis's flickering lights issue to Marcus Johnson", offset: 6 },
      { type: "booking_completed", actorName: "Ravi Patel", description: "Completed thermostat replacement for Paul Hall — installed Nest Learning Thermostat", offset: 8 },
      { type: "booking_completed", actorName: "Sarah Chen", description: "Completed HVAC inspection for Dorothy Clark — system in good condition, replaced filter", offset: 10 },
      { type: "intake_resolved", actorName: "Marcus Johnson", description: "Resolved Karen Taylor's garbage disposal issue — replaced unit", offset: 12 },
      { type: "booking_completed", actorName: "Marcus Johnson", description: "Completed garbage disposal replacement for Karen Taylor", offset: 12 },
      { type: "call_received", actorName: "System", description: "Incoming call from Patricia Garcia (512) 555-1006 — furnace won't ignite, infant at home", offset: 14 },
      { type: "intake_created", actorName: "Jake Thompson", description: "Created urgent intake for Patricia Garcia — furnace failure, urgency 10/10", offset: 14 },
      { type: "intake_assigned", actorName: "Jake Thompson", description: "Assigned Patricia Garcia's furnace emergency to Sarah Chen", offset: 15 },
      { type: "call_received", actorName: "System", description: "Incoming call from Michael Brown (512) 555-1005 — water heater noises", offset: 16 },
      { type: "booking_completed", actorName: "Ravi Patel", description: "Completed toilet repair for Thomas Anderson — replaced flapper valve", offset: 18 },
      { type: "intake_resolved", actorName: "Ravi Patel", description: "Resolved Thomas Anderson's running toilet issue", offset: 18 },
      { type: "call_received", actorName: "System", description: "Incoming call from Robert Williams (512) 555-1001 — AC blowing warm air", offset: 20 },
      { type: "intake_created", actorName: "Jake Thompson", description: "Created intake for Robert Williams — AC not cooling, urgency 8/10", offset: 20 },
      { type: "member_invited", actorName: "Maria Santos", description: "Invited Lisa Nguyen as admin", offset: 24 },
      { type: "settings_updated", actorName: "Maria Santos", description: "Updated auto-escalation timer to 30 minutes", offset: 48 },
      { type: "call_received", actorName: "System", description: "Incoming call from David Lee (512) 555-1003 — annual AC tune-up request", offset: 30 },
      { type: "call_received", actorName: "System", description: "Incoming call from Christopher Davis (512) 555-1011 — musty smell from vents", offset: 22 },
      { type: "intake_assigned", actorName: "Jake Thompson", description: "Assigned Christopher Davis's HVAC issue to Ravi Patel", offset: 22 },
      { type: "call_received", actorName: "System", description: "Incoming call from James Wilson (512) 555-1009 — circuit breaker tripping", offset: 17 },
      { type: "call_received", actorName: "System", description: "Incoming call from Daniel Harris (512) 555-1013 — ceiling fan install request", offset: 25 },
    ];

    for (const a of activities) {
      await ctx.db.insert("activityFeed", {
        companyId,
        type: a.type as any,
        actorName: a.actorName,
        actorId: undefined,
        description: a.description,
        entityType: undefined,
        entityId: undefined,
        metadata: undefined,
        createdAt: now - a.offset * 3600000,
      });
    }

    // 6. Notifications for the owner
    const notificationData = [
      { title: "Emergency Intake", body: "Carol Walker — pipe burst in wall. Urgency 10/10.", read: false, offset: 1 },
      { title: "Escalation Alert", body: "Mark Jackson's sewer backup escalated to emergency.", read: false, offset: 3 },
      { title: "New Intake", body: "Betty Robinson — AC compressor clicking sounds.", read: false, offset: 5 },
      { title: "Urgent Intake", body: "Patricia Garcia — furnace failure with infant at home.", read: true, offset: 14 },
      { title: "Booking Completed", body: "Ravi Patel completed thermostat replacement for Paul Hall.", read: true, offset: 8 },
      { title: "Booking Completed", body: "Sarah Chen completed HVAC inspection for Dorothy Clark.", read: true, offset: 10 },
      { title: "New Intake", body: "Michael Brown — water heater making banging noises.", read: true, offset: 16 },
      { title: "Daily Summary", body: "Yesterday: 4 bookings completed, 3 intakes resolved, 0 escalations.", read: true, offset: 24 },
    ];

    for (const n of notificationData) {
      await ctx.db.insert("notifications", {
        companyId,
        userId: "user_maria",
        title: n.title,
        body: n.body,
        read: n.read,
        readAt: n.read ? now - n.offset * 3600000 + 600000 : undefined,
        createdAt: now - n.offset * 3600000,
      });
    }

    return { companyId, message: "Demo data seeded successfully" };
  },
});
