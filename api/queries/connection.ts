import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

const dbUrl = env.databaseUrl;
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
console.log(`[Database] Connecting to: ${maskedUrl}`);

const queryClient = postgres(dbUrl, {
  connect_timeout: 10,
  onnotice: console.log,
  ssl: false, // Try without explicit SSL first
});
export const db = drizzle(queryClient, { schema: fullSchema });

export function getDb() {
  try {
    return db;
  } catch (err: any) {
    console.error(`[Database Connection Error] ${err.message}`);
    throw err;
  }
}
