import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, tipsterProfiles, tips, follows } from "../db/schema.js";

export const tipsterRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        tier: z.enum(["BRONZE", "SILVER", "GOLD"]).optional(),
        sport: z.string().optional(),
        search: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? { page: 1, limit: 20 };

      const conditions = [eq(tipsterProfiles.isApproved, true)];
      if (params.tier) conditions.push(eq(tipsterProfiles.tier, params.tier));

      const offset = (params.page - 1) * params.limit;

      const results = await db.query.tipsterProfiles.findMany({
        where: and(...conditions),
        orderBy: desc(tipsterProfiles.winRate),
        limit: params.limit,
        offset,
        with: {
          user: true,
        },
      });

      return results;
    }),

  leaderboard: publicQuery
    .input(z.object({ limit: z.number().optional().default(10) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 10;

      const results = await db.query.tipsterProfiles.findMany({
        where: and(eq(tipsterProfiles.isApproved, true)),
        orderBy: desc(tipsterProfiles.winRate),
        limit,
        with: {
          user: true,
        },
      });

      return results;
    }),

  byUsername: publicQuery
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const user = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user) return null;

      const profile = await db.query.tipsterProfiles.findFirst({
        where: eq(tipsterProfiles.id, user.id),
        with: {
          user: true,
        },
      });

      return profile;
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const profile = await db.query.tipsterProfiles.findFirst({
        where: eq(tipsterProfiles.id, input.id),
        with: {
          user: true,
        },
      });
      return profile;
    }),

  stats: publicQuery
    .input(z.object({ tipsterId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const allTips = await db.query.tips.findMany({
        where: eq(tips.tipsterId, input.tipsterId),
        orderBy: desc(tips.createdAt),
      });

      const wonTips = allTips.filter(t => t.status === "won");
      const lostTips = allTips.filter(t => t.status === "lost");
      const resolvedTips = allTips.filter(t => t.status === "won" || t.status === "lost");
      
      const winRate = resolvedTips.length > 0 
        ? ((wonTips.length / resolvedTips.length) * 100).toFixed(1)
        : "0";

      // Calculate streak
      let currentStreak = 0;
      for (const tip of allTips) {
        if (tip.status === "won") currentStreak++;
        else if (tip.status === "lost") break;
      }

      return {
        totalTips: allTips.length,
        wonTips: wonTips.length,
        lostTips: lostTips.length,
        winRate,
        currentStreak,
        averageOdds: allTips.length > 0 
          ? (allTips.reduce((sum, t) => sum + parseFloat(t.odds.toString()), 0) / allTips.length).toFixed(2)
          : "0",
        recentForm: allTips.slice(0, 10).map(t => t.status),
      };
    }),

  follow: authedQuery
    .input(z.object({ tipsterId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const followerId = ctx.user.id;

      await db.insert(follows).values({
        followerId: followerId,
        tipsterId: input.tipsterId,
      });

      await db.update(tipsterProfiles)
        .set({ followerCount: sql`${tipsterProfiles.followerCount} + 1` })
        .where(eq(tipsterProfiles.id, input.tipsterId));

      return { success: true };
    }),

  unfollow: authedQuery
    .input(z.object({ tipsterId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const followerId = ctx.user.id;

      await db.delete(follows)
        .where(
          and(
            eq(follows.followerId, followerId),
            eq(follows.tipsterId, input.tipsterId)
          )
        );

      await db.update(tipsterProfiles)
        .set({ followerCount: sql`${tipsterProfiles.followerCount} - 1` })
        .where(eq(tipsterProfiles.id, input.tipsterId));

      return { success: true };
    }),

  isFollowing: authedQuery
    .input(z.object({ tipsterId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const follow = await db.query.follows.findFirst({
        where: and(
          eq(follows.followerId, ctx.user.id),
          eq(follows.tipsterId, input.tipsterId)
        ),
      });
      return !!follow;
    }),

  submitApplication: authedQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        phoneNumber: z.string().min(1),
        sports: z.array(z.string()),
        experienceDescription: z.string().min(1),
        sampleTips: z.string().min(1),
        socialLinks: z.object({
          facebook: z.string().optional(),
          twitter: z.string().optional(),
          whatsappGroup: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Update user role to tipster (pending approval)
      await db.update(users)
        .set({ role: "tipster" })
        .where(eq(users.id, ctx.user.id));

      // Create tipster profile
      await db.insert(tipsterProfiles).values({
        id: ctx.user.id,
        bio: input.experienceDescription,
        sports: input.sports,
        mtnMomoNumber: input.phoneNumber,
        isApproved: false,
      });

      // Create application record
      const { tipsterApplications } = await import("../db/schema.js");
      await db.insert(tipsterApplications).values({
        userId: ctx.user.id,
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        sports: input.sports,
        experienceDescription: input.experienceDescription,
        sampleTips: input.sampleTips,
        socialLinks: input.socialLinks,
      });

      return { success: true };
    }),
});
