import { authRouter } from "./auth-router.js";
import { tipRouter } from "./tip-router.js";
import { tipsterRouter } from "./tipster-router.js";
import { subscriptionRouter } from "./subscription-router.js";
import { practiceRouter } from "./practice-router.js";
import { learnRouter } from "./learn-router.js";
import { notificationRouter } from "./notification-router.js";
import { adminRouter } from "./admin-router.js";
import { createRouter, publicQuery } from "./middleware.js";

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
