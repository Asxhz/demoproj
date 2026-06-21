import { db } from "@/db";
import {
  projects,
  projectMembers,
  tasks,
  users,
  notifications,
} from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { Project, SessionUser, Task } from "@/types";

export type ProjectWithStats = Project & {
  counts: { todo: number; doing: number; done: number; total: number };
};

// Founders see every project; customers see projects they belong to.
export async function getUserProjects(
  user: SessionUser,
): Promise<ProjectWithStats[]> {
  let rows: Project[];
  if (user.role === "founder") {
    rows = (await db
      .select()
      .from(projects)
      .orderBy(desc(projects.created_at))) as Project[];
  } else {
    rows = (await db
      .select({
        id: projects.id,
        owner_id: projects.owner_id,
        name: projects.name,
        slug: projects.slug,
        description: projects.description,
        status: projects.status,
        repo_full_name: projects.repo_full_name,
        repo_url: projects.repo_url,
        created_at: projects.created_at,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.project_id, projects.id))
      .where(eq(projectMembers.user_id, user.id))
      .orderBy(desc(projects.created_at))) as Project[];
  }

  const ids = rows.map((p) => p.id);
  const allTasks = ids.length
    ? await db.select().from(tasks).where(inArray(tasks.project_id, ids))
    : [];

  return rows.map((p) => {
    const t = allTasks.filter((x) => x.project_id === p.id);
    return {
      ...p,
      counts: {
        todo: t.filter((x) => x.status === "todo").length,
        doing: t.filter((x) => x.status === "doing").length,
        done: t.filter((x) => x.status === "done").length,
        total: t.length,
      },
    };
  });
}

export type ProjectDetail = {
  project: Project;
  tasks: (Task & { assignee_name: string | null })[];
  members: { user_id: string; display_name: string; handle: string; role: string }[];
  access: boolean;
};

export async function getProjectBySlug(
  slug: string,
  user: SessionUser,
): Promise<ProjectDetail | null> {
  const found = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  if (!found.length) return null;
  const project = found[0] as Project;

  const members = await db
    .select({
      user_id: projectMembers.user_id,
      display_name: users.display_name,
      handle: users.handle,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.user_id, users.id))
    .where(eq(projectMembers.project_id, project.id));

  const isMember = members.some((m) => m.user_id === user.id);
  if (!isMember && user.role !== "founder") {
    return { project, tasks: [], members, access: false };
  }

  const taskRows = await db
    .select({
      id: tasks.id,
      project_id: tasks.project_id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      assignee_id: tasks.assignee_id,
      created_by: tasks.created_by,
      created_at: tasks.created_at,
      assignee_name: users.display_name,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assignee_id, users.id))
    .where(eq(tasks.project_id, project.id))
    .orderBy(desc(tasks.created_at));

  return {
    project,
    tasks: taskRows as ProjectDetail["tasks"],
    members,
    access: true,
  };
}

export async function getDashboardStats(user: SessionUser) {
  const list = await getUserProjects(user);
  const totals = list.reduce(
    (acc, p) => {
      acc.todo += p.counts.todo;
      acc.doing += p.counts.doing;
      acc.done += p.counts.done;
      acc.total += p.counts.total;
      return acc;
    },
    { todo: 0, doing: 0, done: 0, total: 0 },
  );

  // Tasks assigned to this user, across accessible projects.
  const projectIds = list.map((p) => p.id);
  const myTasks = projectIds.length
    ? ((await db
        .select({
          id: tasks.id,
          project_id: tasks.project_id,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          assignee_id: tasks.assignee_id,
          created_by: tasks.created_by,
          created_at: tasks.created_at,
        })
        .from(tasks)
        .where(
          and(
            inArray(tasks.project_id, projectIds),
            eq(tasks.assignee_id, user.id),
          ),
        )
        .orderBy(desc(tasks.created_at))
        .limit(8)) as Task[])
    : [];

  return { projects: list, totals, myTasks };
}

export async function getNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at))
    .limit(50);
}
