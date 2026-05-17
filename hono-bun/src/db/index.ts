import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";
import { env } from "@/env";

const client = postgres(env.DATABASE_URL, {
  max: env.PG_POOL_MAX,
});

export const db = drizzle(client, { schema });

export type Db = typeof db;
export type Schema = typeof schema;
