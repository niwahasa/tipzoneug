import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";

const fullSchema = { ...schema, ...relations };

const queryClient = postgres(env.databaseUrl);
export const db = drizzle(queryClient, { schema: fullSchema });

export function getDb() {
  return db;
}
