import { z } from "zod";
import { eq, and, gte, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subscriptions, transactions, users, tipsterProfiles } from "@db/schema";

export const subscriptionRouter = createRouter({
  mySubscriptions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const results = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.subscriberId, ctx.user.id),
        eq(subscriptions.status, "active")
      ),
      with: {
        tipster: true,
      },
    });
    return results;
  }),

  checkAccess: authedQuery
    .input(z.object({ tipsterId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const now = new Date();

      // Check platform VIP
      const platformVip = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.subscriberId, ctx.user.id),
          eq(subscriptions.plan, "platform_vip"),
          eq(subscriptions.status, "active"),
          gte(subscriptions.expiresAt, now)
        ),
      });

      if (platformVip) return { hasAccess: true, type: "platform_vip" };

      // Check tipster-specific subscription
      if (input.tipsterId) {
        const tipsterSub = await db.query.subscriptions.findFirst({
          where: and(
            eq(subscriptions.subscriberId, ctx.user.id),
            eq(subscriptions.tipsterId, input.tipsterId),
            eq(subscriptions.plan, "tipster"),
            eq(subscriptions.status, "active"),
            gte(subscriptions.expiresAt, now)
          ),
        });

        if (tipsterSub) return { hasAccess: true, type: "tipster" };
      }

      return { hasAccess: false, type: null };
    }),

  create: authedQuery
    .input(
      z.object({
        plan: z.enum(["tipster", "platform_vip"]),
        tipsterId: z.number().optional(),
        amount: z.number(),
        duration: z.enum(["monthly", "quarterly", "annual"]),
        phoneNumber: z.string(),
        paymentMethod: z.enum(["mtn_momo", "airtel_money"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Calculate expiry date
      const now = new Date();
      const expiresAt = new Date(now);
      switch (input.duration) {
        case "monthly":
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          break;
        case "quarterly":
          expiresAt.setMonth(expiresAt.getMonth() + 3);
          break;
        case "annual":
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          break;
      }

      const txRef = `TZ-${Date.now()}-${ctx.user.id}`;

      // Create subscription
      await db.insert(subscriptions).values({
        subscriberId: ctx.user.id,
        tipsterId: input.tipsterId,
        plan: input.plan,
        amount: input.amount,
        expiresAt,
        flutterwaveTxRef: txRef,
      });

      // Create transaction record
      await db.insert(transactions).values({
        userId: ctx.user.id,
        type: "subscription",
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        phoneNumber: input.phoneNumber,
        flutterwaveTxRef: txRef,
        description: `Subscription: ${input.plan} (${input.duration})`,
      });

      // If tipster subscription, update subscriber count
      if (input.tipsterId) {
        await db.update(tipsterProfiles)
          .set({ subscriberCount: sql`${tipsterProfiles.subscriberCount} + 1` })
          .where(eq(tipsterProfiles.id, input.tipsterId));
      }

      // Update user VIP status
      await db.update(users)
        .set({ isVip: true, vipExpiresAt: expiresAt })
        .where(eq(users.id, ctx.user.id));

      return { success: true, txRef, expiresAt };
    }),

  pricing: publicQuery.query(async () => {
    const db = getDb();
    const { platformSettings } = await import("@db/schema");
    
    const monthly = await db.query.platformSettings.findFirst({
      where: eq(platformSettings.key, "vip_monthly_price"),
    });
    const quarterly = await db.query.platformSettings.findFirst({
      where: eq(platformSettings.key, "vip_quarterly_price"),
    });
    const annual = await db.query.platformSettings.findFirst({
      where: eq(platformSettings.key, "vip_annual_price"),
    });

    return {
      monthly: parseInt(monthly?.value ?? "15000"),
      quarterly: parseInt(quarterly?.value ?? "35000"),
      annual: parseInt(annual?.value ?? "100000"),
    };
  }),
});
