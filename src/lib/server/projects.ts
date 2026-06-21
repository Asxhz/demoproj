"use server";

import { db } from "@/db";
import { projects, projectMembers, tasks } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { generateId, slugify } from "@/lib/utils";
import { notify } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "project";
  let slug = base;
  for (let i = 0; i < 50; i++) {
    const hit = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);
    if (!hit.length) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${generateId("x").slice(-4)}`;
}

async function assertMember(projectId: string, userId: string) {
  const rows = await db
    .select({ id: projectMembers.id })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.project_id, projectId),
        eq(projectMembers.user_id, userId),
      ),
    )
    .limit(1);
  if (!rows.length) throw new Error("forbidden");
}

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const description = String(formData.get("description") || "").trim();
  const repo_full_name = String(formData.get("repo_full_name") || "").trim() || null;
  const repo_url = repo_full_name ? `https://github.com/${repo_full_name}` : null;

  const id = generateId("proj");
  const slug = await uniqueSlug(name);

  await db.insert(projects).values({
    id,
    owner_id: user.id,
    name,
    description,
    slug,
    repo_full_name,
    repo_url,
  });
  await db.insert(projectMembers).values({
    id: generateId("pm"),
    project_id: id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/projects");
  redirect(`/projects/${slug}`);
}

export async function attachRepo(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("project_id") || "");
  const repo_full_name = String(formData.get("repo_full_name") || "").trim();
  const slug = String(formData.get("slug") || "");
  await assertMember(projectId, user.id);

  await db
    .update(projects)
    .set({
      repo_full_name: repo_full_name || null,
      repo_url: repo_full_name ? `https://github.com/${repo_full_name}` : null,
    })
    .where(eq(projects.id, projectId));

  revalidatePath(`/projects/${slug}`);
}

export async function createTask(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("project_id") || "");
  const slug = String(formData.get("slug") || "");
  const title = String(formData.get("title") || "").trim();
  if (!projectId || !title) return;
  await assertMember(projectId, user.id);

  const description = String(formData.get("description") || "").trim();
  const priority = String(formData.get("priority") || "med");
  const assignee_id = String(formData.get("assignee_id") || "") || null;

  await db.insert(tasks).values({
    id: generateId("task"),
    project_id: projectId,
    title,
    description,
    priority,
    assignee_id,
    created_by: user.id,
  });

  if (assignee_id && assignee_id !== user.id) {
    await notify(assignee_id, {
      type: "assigned",
      title: "New task assigned",
      body: title,
      link: `/projects/${slug}`,
    });
  }

  revalidatePath(`/projects/${slug}`);
}

export async function setTaskStatus(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("task_id") || "");
  const status = String(formData.get("status") || "todo");
  const slug = String(formData.get("slug") || "");

  const rows = await db
    .select({ project_id: tasks.project_id })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);
  if (!rows.length) return;
  await assertMember(rows[0].project_id, user.id);

  await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));
  revalidatePath(`/projects/${slug}`);
}

export async function addMember(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("project_id") || "");
  const userId = String(formData.get("user_id") || "");
  const slug = String(formData.get("slug") || "");
  await assertMember(projectId, user.id);
  if (!userId) return;

  const existing = await db
    .select({ id: projectMembers.id })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.project_id, projectId),
        eq(projectMembers.user_id, userId),
      ),
    )
    .limit(1);
  if (existing.length) return;

  await db.insert(projectMembers).values({
    id: generateId("pm"),
    project_id: projectId,
    user_id: userId,
    role: "member",
  });
  await notify(userId, {
    type: "project",
    title: "Added to a project",
    body: "You now have access to a new project.",
    link: `/projects/${slug}`,
  });

  revalidatePath(`/projects/${slug}`);
}
