import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { learnArticles } from "../db/schema.js";

export const learnRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.enum(["beginner", "strategy", "how-to", "tools"]).optional(),
        language: z.enum(["en", "lg"]).optional().default("en"),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(learnArticles.isPublished, true)];
      
      if (input?.category) conditions.push(eq(learnArticles.category, input.category));
      if (input?.language) conditions.push(eq(learnArticles.language, input.language));

      const articles = await db.query.learnArticles.findMany({
        where: and(...conditions),
        orderBy: learnArticles.createdAt,
      });

      return articles;
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const article = await db.query.learnArticles.findFirst({
        where: eq(learnArticles.slug, input.slug),
      });
      return article;
    }),

  categories: publicQuery.query(async () => {
    const db = getDb();
    const articles = await db.query.learnArticles.findMany({
      where: eq(learnArticles.isPublished, true),
    });

    const categories = [...new Set(articles.map(a => a.category))];
    return categories;
  }),
});
