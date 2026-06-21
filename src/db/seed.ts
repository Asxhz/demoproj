import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { hashSync } from "bcryptjs";
import * as schema from "./schema";

const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(connection, { schema });

const PASSWORD = hashSync("claudex-demo-2026", 10);
const rid = (p: string) =>
  `${p}_${Date.now().toString(36)}_${Math.round(performance.now() * 1000).toString(36)}`;

async function seed() {
  console.log("Seeding accounts...");

  const founderId = "user_founder";
  const customerId = "user_customer";

  await db
    .insert(schema.users)
    .values([
      {
        id: founderId,
        email: "founder@claudex.dev",
        display_name: "Demo Founder",
        handle: "founder",
        role: "founder",
        avatar_seed: "founder",
        bio: "Runs the show.",
        password_hash: PASSWORD,
      },
      {
        id: customerId,
        email: "customer@claudex.dev",
        display_name: "Demo Customer",
        handle: "customer",
        role: "customer",
        avatar_seed: "customer",
        bio: "Ships features.",
        password_hash: PASSWORD,
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding project...");
  const projectId = "proj_demo";
  await db
    .insert(schema.projects)
    .values({
      id: projectId,
      owner_id: founderId,
      name: "Launch Claudex",
      slug: "launch-claudex",
      description: "Ship the platform. Connect the repo. Move fast.",
      status: "active",
    })
    .onConflictDoNothing();

  await db
    .insert(schema.projectMembers)
    .values([
      { id: rid("pm"), project_id: projectId, user_id: founderId, role: "owner" },
      { id: rid("pm"), project_id: projectId, user_id: customerId, role: "member" },
    ])
    .onConflictDoNothing();

  console.log("Seeding tasks...");
  await db
    .insert(schema.tasks)
    .values([
      {
        id: rid("task"),
        project_id: projectId,
        title: "Connect GitHub repo",
        description: "Link the production repo so commits flow in.",
        status: "todo",
        priority: "high",
        assignee_id: founderId,
        created_by: founderId,
      },
      {
        id: rid("task"),
        project_id: projectId,
        title: "Invite the team over Discord",
        description: "Send signup and meeting invites from the bot.",
        status: "doing",
        priority: "med",
        assignee_id: customerId,
        created_by: founderId,
      },
      {
        id: rid("task"),
        project_id: projectId,
        title: "Wire the dashboard",
        description: "Real analytics, no placeholder numbers.",
        status: "done",
        priority: "low",
        assignee_id: customerId,
        created_by: founderId,
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding notifications...");
  await db
    .insert(schema.notifications)
    .values([
      {
        id: rid("ntf"),
        user_id: founderId,
        type: "welcome",
        title: "Welcome to Claudex",
        body: "Connect a repo and invite your team to begin.",
        link: "/tools",
      },
      {
        id: rid("ntf"),
        user_id: customerId,
        type: "assigned",
        title: "You were assigned a task",
        body: "Invite the team over Discord.",
        link: "/projects/launch-claudex",
      },
    ])
    .onConflictDoNothing();

  console.log("Seed complete.");
  console.log("  founder@claudex.dev / claudex-demo-2026");
  console.log("  customer@claudex.dev / claudex-demo-2026");
  await connection.end();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await connection.end();
  process.exit(1);
});
