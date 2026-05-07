import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";

export const notificationRouter = createRouter({
  myNotifications: authedQuery
    .input(z.object({ limit: z.number().optional().default(50) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      
      const notifs = await db.query.notifications.findMany({
        where: eq(notifications.userId, ctx.user.id),
        orderBy: desc(notifications.createdAt),
        limit,
      });

      const unreadCount = notifs.filter(n => !n.isRead).length;

      return { notifications: notifs, unreadCount };
    }),

  markRead: authedQuery
    .input(z.object({ id: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (input.id) {
        await db.update(notifications)
          .set({ isRead: true })
          .where(and(
            eq(notifications.id, input.id),
            eq(notifications.userId, ctx.user.id)
          ));
      } else {
        // Mark all as read
        await db.update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.userId, ctx.user.id));
      }

      return { success: true };
    }),

  create: authedQuery
    .input(
      z.object({
        userId: z.number(),
        title: z.string(),
        body: z.string(),
        type: z.enum(["new_tip", "result_update", "subscription", "payout", "announcement"]),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      
      const notif = await db.insert(notifications).values({
        userId: input.userId,
        title: input.title,
        body: input.body,
        type: input.type,
        actionUrl: input.actionUrl,
      });

      return notif;
    }),
});
