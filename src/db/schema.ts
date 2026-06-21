import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";

// Accounts. role = "founder" (admin) | "customer".
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  display_name: text("display_name").notNull(),
  handle: text("handle").unique().notNull(),
  role: text("role").notNull().default("customer"),
  avatar_seed: text("avatar_seed"),
  bio: text("bio"),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// A unit of work the platform tracks. Optionally bound to a GitHub repo.
export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    owner_id: text("owner_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description").default("").notNull(),
    status: text("status").notNull().default("active"), // active | archived
    repo_full_name: text("repo_full_name"), // "owner/repo"
    repo_url: text("repo_url"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => [index("projects_owner_idx").on(t.owner_id)],
);

// Who can see / is assigned to a project. role = owner | member.
export const projectMembers = pgTable(
  "project_members",
  {
    id: text("id").primaryKey(),
    project_id: text("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    user_id: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").notNull().default("member"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => [index("project_members_project_idx").on(t.project_id)],
);

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    project_id: text("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    description: text("description").default("").notNull(),
    status: text("status").notNull().default("todo"), // todo | doing | done
    priority: text("priority").notNull().default("med"), // low | med | high
    assignee_id: text("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    created_by: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => [index("tasks_project_idx").on(t.project_id)],
);

// Per-user connection to an external provider.
// provider = github | discord | browserbase
export const integrations = pgTable(
  "integrations",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider").notNull(),
    access_token: text("access_token"),
    account_label: text("account_label"),
    meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
    connected_at: timestamp("connected_at").defaultNow(),
  },
  (t) => [index("integrations_user_idx").on(t.user_id)],
);

// Short-lived CSRF tokens for OAuth round-trips.
export const oauthStates = pgTable("oauth_states", {
  id: text("id").primaryKey(), // the state value
  user_id: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  provider: text("provider").notNull(),
  redirect: text("redirect"),
  created_at: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").default("").notNull(),
    link: text("link"),
    read: boolean("read").notNull().default(false),
    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.user_id)],
);
