import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "../../contracts/constants";
import { signSessionToken, verifySessionToken } from "../lib/auth";
import { findUserById } from "../queries/users";

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    return null;
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    return null;
  }
  const user = await findUserById(claim.userId);
  if (!user) {
    return null;
  }
  return user;
}

// OAuth handler removed to focus on local auth as requested
export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    return c.json({ error: "OAuth is disabled. Use local login." }, 400);
  };
}
