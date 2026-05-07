import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies.js";
import { createRouter, authedQuery, publicQuery } from "./middleware.js";
import { hashPassword, verifyPassword, signSessionToken } from "./lib/auth.js";
import { findUserByEmail, createUser } from "./queries/users.js";

export const authRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        fullName: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists.",
        });
      }

      const hashedPassword = await hashPassword(input.password);
      const userId = await createUser({
        fullName: input.fullName,
        email: input.email,
        password: hashedPassword,
        unionId: null, // Local users don't have unionId
      });

      const token = await signSessionToken({ userId });
      const opts = getSessionCookieOptions(ctx.req.headers);

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          ...opts,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByEmail(input.email);
      if (!user || !user.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const isValid = await verifyPassword(input.password, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const token = await signSessionToken({ userId: user.id });
      const opts = getSessionCookieOptions(ctx.req.headers);

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          ...opts,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true };
    }),

  me: authedQuery.query((opts) => opts.ctx.user),

  logout: publicQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
        expires: new Date(0),
      }),
    );
    return { success: true };
  }),
});
