// test/global-setup.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export async function setup() {
  const client = postgres(
    "postgresql://postgres:postgres@localhost:5432/starter_test",
    { max: 1 },
  );
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  await client.end();
}
