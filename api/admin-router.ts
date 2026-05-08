import { z } from "zod";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import {
  users,
  tipsterProfiles,
  tips,
  transactions,
  tipsterApplications,
  notifications,
} from "../db/schema.js";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();

    const totalUsers = await db.select({ count: count() }).from(users);
    const totalTipsters = await db.select({ count: count() }).from(tipsterProfiles);
    const totalTips = await db.select({ count: count() }).from(tips);
    const totalTransactions = await db.select({ count: count() }).from(transactions);
    
    const pendingApplications = await db.select({ count: count() })
      .from(tipsterApplications)
      .where(eq(tipsterApplications.status, "pending"));

    const totalRevenue = await db.select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
      .from(transactions)
      .where(eq(transactions.status, "successful"));

    return {
      totalUsers: totalUsers[0]?.count ?? 0,
      totalTipsters: totalTipsters[0]?.count ?? 0,
      totalTips: totalTips[0]?.count ?? 0,
      totalTransactions: totalTransactions[0]?.count ?? 0,
      pendingApplications: pendingApplications[0]?.count ?? 0,
      totalRevenue: totalRevenue[0]?.total ?? 0,
    };
  }),

  users: adminQuery
    .input(z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const offset = (page - 1) * limit;

      const results = await db.query.users.findMany({
        orderBy: desc(users.createdAt),
        limit,
        offset,
      });

      return results;
    }),

  applications: adminQuery
    .input(z.object({ status: z.enum(["pending", "approved", "rejected"]).optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      const conditions = [];
      if (input?.status) conditions.push(eq(tipsterApplications.status, input.status));

      const results = await db.query.tipsterApplications.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: desc(tipsterApplications.createdAt),
        with: {
          user: true,
        },
      });

      return results;
    }),

  reviewApplication: adminQuery
    .input(
      z.object({
        applicationId: z.number(),
        status: z.enum(["approved", "rejected"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const app = await db.query.tipsterApplications.findFirst({
        where: eq(tipsterApplications.id, input.applicationId),
      });

      if (!app) throw new Error("Application not found");

      // Update application status
      await db.update(tipsterApplications)
        .set({
          status: input.status,
          adminNotes: input.adminNotes,
        })
        .where(eq(tipsterApplications.id, input.applicationId));

      // If approved, update tipster profile
      if (input.status === "approved") {
        await db.update(tipsterProfiles)
          .set({ isApproved: true, isVerified: true })
          .where(eq(tipsterProfiles.id, Number(app.userId)));
      }

      return { success: true };
    }),

  allTips: adminQuery
    .input(z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const offset = (page - 1) * limit;

      const results = await db.query.tips.findMany({
        orderBy: desc(tips.createdAt),
        limit,
        offset,
        with: {
          tipster: true,
        },
      });

      return results;
    }),

  transactions: adminQuery
    .input(z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const offset = (page - 1) * limit;

      const results = await db.query.transactions.findMany({
        orderBy: desc(transactions.createdAt),
        limit,
        offset,
        with: {
          user: true,
        },
      });

      return results;
    }),

  payouts: adminQuery.query(async () => {
    const db = getDb();
    
    const pendingPayouts = await db.query.tipsterProfiles.findMany({
      where: sql`${tipsterProfiles.pendingPayout} > 0`,
      orderBy: desc(tipsterProfiles.pendingPayout),
      with: {
        user: true,
      },
    });

    return pendingPayouts;
  }),

  processPayout: adminQuery
    .input(z.object({ tipsterId: z.number(), amount: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const tipster = await db.query.tipsterProfiles.findFirst({
        where: eq(tipsterProfiles.id, input.tipsterId),
      });

      if (!tipster) throw new Error("Tipster not found");
      if ((tipster.pendingPayout ?? 0) < input.amount) {
        throw new Error("Insufficient pending payout balance");
      }

      // Update tipster earnings
      await db.update(tipsterProfiles)
        .set({
          pendingPayout: sql`${tipsterProfiles.pendingPayout} - ${input.amount}`,
          totalEarnings: sql`${tipsterProfiles.totalEarnings} + ${input.amount}`,
        })
        .where(eq(tipsterProfiles.id, input.tipsterId));

      // Log transaction
      await db.insert(transactions).values({
        userId: input.tipsterId,
        type: "payout",
        amount: input.amount,
        status: "successful",
        description: `Payout to ${tipster.payoutPreference === "mtn" ? "MTN MoMo" : "Airtel Money"}`,
      });

      return { success: true };
    }),

  broadcastNotification: adminQuery
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        type: z.enum(["announcement", "new_tip", "result_update", "subscription", "payout"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get all users
      const allUsers = await db.query.users.findMany();

      // Create notification for each user
      for (const user of allUsers) {
        await db.insert(notifications).values({
          userId: user.id,
          title: input.title,
          body: input.body,
          type: input.type,
        });
      }

      return { success: true, sentTo: allUsers.length };
    }),
});
