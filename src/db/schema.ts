import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  display_name: text("display_name").notNull(),
  handle: text("handle").unique().notNull(),
  avatar_seed: text("avatar_seed"),
  bio: text("bio"),
  password_hash: text("password_hash"),
  created_at: timestamp("created_at").defaultNow(),
});

export const benchmarkTasks = pgTable("benchmark_tasks", {
  id: text("id").primaryKey(),
  author_id: text("author_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty"),
  tags: text("tags").array(),
  created_at: timestamp("created_at").defaultNow(),
});

export const benchmarkRuns = pgTable("benchmark_runs", {
  id: text("id").primaryKey(),
  task_id: text("task_id").references(() => benchmarkTasks.id),
  agent_name: text("agent_name").notNull(),
  agent_model: text("agent_model"),
  result: text("result").notNull(),
  explanation: text("explanation").notNull(),
  duration_ms: integer("duration_ms"),
  tokens_used: integer("tokens_used"),
  code_diff: text("code_diff"),
  created_at: timestamp("created_at").defaultNow(),
});

export const feedPosts = pgTable("feed_posts", {
  id: text("id").primaryKey(),
  author_id: text("author_id").references(() => users.id),
  task_id: text("task_id").references(() => benchmarkTasks.id),
  body: text("body").notNull(),
  agent_results: jsonb("agent_results").notNull(),
  is_draft: boolean("is_draft").default(true),
  published_at: timestamp("published_at"),
  created_at: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  post_id: text("post_id").references(() => feedPosts.id),
  author_id: text("author_id").references(() => users.id),
  body: text("body").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const utraceSeedMarkers = pgTable("__utrace_seed_markers", {
  session_id: text("session_id").primaryKey(),
  preview_id: text("preview_id").notNull(),
  external_user_id: text("external_user_id").notNull(),
  seed_plan_id: text("seed_plan_id").notNull(),
  seed_plan_version: text("seed_plan_version").notNull(),
  seeded_at: timestamp("seeded_at").defaultNow(),
});
