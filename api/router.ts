import { authRouter } from "./auth-router";
import { tipRouter } from "./tip-router";
import { tipsterRouter } from "./tipster-router";
import { subscriptionRouter } from "./subscription-router";
import { practiceRouter } from "./practice-router";
import { learnRouter } from "./learn-router";
import { notificationRouter } from "./notification-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  tip: tipRouter,
  tipster: tipsterRouter,
  subscription: subscriptionRouter,
  practice: practiceRouter,
  learn: learnRouter,
  notification: notificationRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
