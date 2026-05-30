import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";

const connection = postgres(process.env.DATABASE_URL!);
const db = drizzle(connection);

const DROP_TABLES = [
  "comments",
  "feed_posts",
  "benchmark_runs",
  "benchmark_tasks",
  "sessions",
  "__utrace_seed_markers",
  "users",
];

async function migrate() {
  console.log("Dropping existing tables...");
  for (const table of DROP_TABLES) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
    console.log(`  ✓ Dropped ${table}`);
  }

  console.log("Creating tables...");
  const migrationSql = readFileSync(
    join(__dirname, "../../drizzle/0000_past_hellcat.sql"),
    "utf-8"
  );

  const statements = migrationSql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(sql.raw(statement));
    console.log("  ✓", statement.slice(0, 60) + "...");
  }

  console.log("Migration complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
