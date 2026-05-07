import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tips, tipsterProfiles } from "../db/schema.js";

export const tipRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        sortBy: z.enum(["latest", "confidence", "odds", "myTipsters"]).optional().default("latest"),
        league: z.string().optional(),
        sport: z.string().optional(),
        tier: z.enum(["BRONZE", "SILVER", "GOLD"]).optional(),
        status: z.enum(["pending", "won", "lost", "void", "postponed"]).optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        userId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? { sortBy: "latest", page: 1, limit: 20 };
      const { sortBy, league, status, page, limit } = params;

      let orderBy;
      switch (sortBy) {
        case "confidence":
          orderBy = desc(tips.confidence);
          break;
        case "odds":
          orderBy = desc(tips.odds);
          break;
        default:
          orderBy = desc(tips.createdAt);
      }

      const conditions = [];
      if (league) conditions.push(eq(tips.league, league));
      if (status) conditions.push(eq(tips.status, status));

      const offset = (page - 1) * limit;

      const results = await db.query.tips.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy,
        limit,
        offset,
        with: {
          tipster: {
            with: {
              tipsterProfile: true,
            },
          },
        },
      });

      return results;
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const tip = await db.query.tips.findFirst({
        where: eq(tips.id, input.id),
        with: {
          tipster: {
            with: {
              tipsterProfile: true,
            },
          },
        },
      });
      return tip;
    }),

  byTipster: publicQuery
    .input(z.object({ tipsterId: z.number(), page: z.number().optional().default(1), limit: z.number().optional().default(20) }))
    .query(async ({ input }) => {
      const db = getDb();
      const { tipsterId, page, limit } = input;
      const offset = (page - 1) * limit;
      
      const results = await db.query.tips.findMany({
        where: eq(tips.tipsterId, tipsterId),
        orderBy: desc(tips.createdAt),
        limit,
        offset,
      });
      return results;
    }),

  create: authedQuery
    .input(
      z.object({
        matchName: z.string().min(1),
        league: z.string().min(1),
        matchDatetime: z.string(),
        pick: z.string().min(1),
        odds: z.string().or(z.number()),
        stakeAdvice: z.string().optional(),
        analysis: z.string().optional(),
        confidence: z.number().min(1).max(100).optional(),
        isFree: z.boolean().optional(),
        tipType: z.enum(["single", "accumulator"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check if user is a tipster
      const tipster = await db.query.tipsterProfiles.findFirst({
        where: eq(tipsterProfiles.id, userId),
      });

      if (!tipster || !tipster.isApproved) {
        throw new Error("Only approved tipsters can post tips");
      }

      const oddsNum = typeof input.odds === "string" ? parseFloat(input.odds) : input.odds;

      const newTip = await db.insert(tips).values({
        tipsterId: userId,
        matchName: input.matchName,
        league: input.league,
        matchDatetime: new Date(input.matchDatetime),
        pick: input.pick,
        odds: oddsNum.toString(),
        stakeAdvice: input.stakeAdvice,
        analysis: input.analysis,
        confidence: input.confidence,
        isFree: input.isFree ?? false,
        tipType: input.tipType ?? "single",
      });

      // Update tipster total tips count
      await db.update(tipsterProfiles)
        .set({ totalTips: sql`${tipsterProfiles.totalTips} + 1` })
        .where(eq(tipsterProfiles.id, userId));

      return newTip;
    }),

  updateResult: authedQuery
    .input(
      z.object({
        tipId: z.number(),
        status: z.enum(["won", "lost", "void", "postponed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can update results");
      }

      const tip = await db.query.tips.findFirst({
        where: eq(tips.id, input.tipId),
      });

      if (!tip) throw new Error("Tip not found");

      await db.update(tips)
        .set({
          status: input.status,
          resultUpdatedAt: new Date(),
        })
        .where(eq(tips.id, input.tipId));

      // Update tipster stats
      const tipsterId = Number(tip.tipsterId);
      const tipster = await db.query.tipsterProfiles.findFirst({
        where: eq(tipsterProfiles.id, tipsterId),
      });

      if (tipster) {
        const newTotalWins = input.status === "won" 
          ? tipster.totalWins + 1 
          : tipster.totalWins;
        
        const resolvedTips = tipster.totalTips;
        const newWinRate = resolvedTips > 0 
          ? ((newTotalWins / resolvedTips) * 100).toFixed(2)
          : "0";

        const newStreak = input.status === "won" 
          ? tipster.currentStreak + 1 
          : 0;

        await db.update(tipsterProfiles)
          .set({
            totalWins: newTotalWins,
            winRate: newWinRate,
            currentStreak: newStreak,
          })
          .where(eq(tipsterProfiles.id, tipsterId));
      }

      return { success: true };
    }),

  leagues: publicQuery.query(async () => {
    const db = getDb();
    const results = await db.selectDistinct({ league: tips.league }).from(tips);
    return results.map(r => r.league);
  }),
});
