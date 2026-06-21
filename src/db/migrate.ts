import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(connection);

// Old demo tables + current tables. Dropped via CASCADE so order is safe.
const DROP_TABLES = [
  "comments",
  "feed_posts",
  "benchmark_runs",
  "benchmark_tasks",
  "__utrace_seed_markers",
  "notifications",
  "oauth_states",
  "integrations",
  "tasks",
  "project_members",
  "projects",
  "sessions",
  "users",
];

const DDL = [
  `CREATE TABLE "users" (
    "id" text PRIMARY KEY,
    "email" text UNIQUE NOT NULL,
    "display_name" text NOT NULL,
    "handle" text UNIQUE NOT NULL,
    "role" text NOT NULL DEFAULT 'customer',
    "avatar_seed" text,
    "bio" text,
    "password_hash" text NOT NULL,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE "sessions" (
    "id" text PRIMARY KEY,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE "projects" (
    "id" text PRIMARY KEY,
    "owner_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "slug" text UNIQUE NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "status" text NOT NULL DEFAULT 'active',
    "repo_full_name" text,
    "repo_url" text,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE INDEX "projects_owner_idx" ON "projects" ("owner_id")`,
  `CREATE TABLE "project_members" (
    "id" text PRIMARY KEY,
    "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role" text NOT NULL DEFAULT 'member',
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE INDEX "project_members_project_idx" ON "project_members" ("project_id")`,
  `CREATE TABLE "tasks" (
    "id" text PRIMARY KEY,
    "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "status" text NOT NULL DEFAULT 'todo',
    "priority" text NOT NULL DEFAULT 'med',
    "assignee_id" text REFERENCES "users"("id") ON DELETE SET NULL,
    "created_by" text REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE INDEX "tasks_project_idx" ON "tasks" ("project_id")`,
  `CREATE TABLE "integrations" (
    "id" text PRIMARY KEY,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "provider" text NOT NULL,
    "access_token" text,
    "account_label" text,
    "meta" jsonb DEFAULT '{}'::jsonb,
    "connected_at" timestamp DEFAULT now()
  )`,
  `CREATE INDEX "integrations_user_idx" ON "integrations" ("user_id")`,
  `CREATE TABLE "oauth_states" (
    "id" text PRIMARY KEY,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "provider" text NOT NULL,
    "redirect" text,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE "notifications" (
    "id" text PRIMARY KEY,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" text NOT NULL,
    "title" text NOT NULL,
    "body" text NOT NULL DEFAULT '',
    "link" text,
    "read" boolean NOT NULL DEFAULT false,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE INDEX "notifications_user_idx" ON "notifications" ("user_id")`,
];

async function migrate() {
  console.log("Dropping existing tables...");
  for (const table of DROP_TABLES) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
    console.log(`  dropped ${table}`);
  }

  console.log("Creating tables...");
  for (const statement of DDL) {
    await db.execute(sql.raw(statement));
    console.log("  ok", statement.slice(0, 48).replace(/\s+/g, " ") + "...");
  }

  console.log("Migration complete.");
  await connection.end();
}

migrate().catch(async (err) => {
  console.error("Migration failed:", err);
  await connection.end();
  process.exit(1);
});
