import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { practiceBets, tips, users } from "../db/schema.js";

export const practiceRouter = createRouter({
  myBets: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const bets = await db.query.practiceBets.findMany({
      where: eq(practiceBets.userId, ctx.user.id),
      orderBy: desc(practiceBets.createdAt),
      with: {
        tip: true,
      },
    });

    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    return { bets, credits: user?.practiceCredits ?? 0 };
  }),

  placeBet: authedQuery
    .input(
      z.object({
        tipId: z.number(),
        stake: z.number().min(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check user credits
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user || (user.practiceCredits ?? 0) < input.stake) {
        throw new Error("Insufficient practice credits");
      }

      // Get tip details
      const tip = await db.query.tips.findFirst({
        where: eq(tips.id, input.tipId),
      });

      if (!tip) throw new Error("Tip not found");

      const odds = parseFloat(tip.odds.toString());
      const potentialReturn = Math.round(input.stake * odds);

      // Deduct credits
      await db.update(users)
        .set({ practiceCredits: (user.practiceCredits ?? 0) - input.stake })
        .where(eq(users.id, userId));

      // Create practice bet
      const bet = await db.insert(practiceBets).values({
        userId: userId,
        tipId: input.tipId,
        stake: input.stake,
        potentialReturn,
      });

      return { success: true, bet, potentialReturn };
    }),

  leaderboard: authedQuery.query(async () => {
    const db = getDb();
    
    // Get all users with practice mode stats
    const allUsers = await db.query.users.findMany({
      orderBy: desc(users.practiceCredits),
      limit: 50,
    });

    return allUsers.map((u, index) => ({
      rank: index + 1,
      username: u.username ?? u.fullName ?? "Anonymous",
      avatar: u.avatar,
      credits: u.practiceCredits ?? 0,
    }));
  }),

  resetBalance: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    
    await db.update(users)
      .set({ practiceCredits: 100000 })
      .where(eq(users.id, ctx.user.id));

    return { success: true, newBalance: 100000 };
  }),
});
