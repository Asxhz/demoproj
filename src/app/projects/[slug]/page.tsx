import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProjectBySlug } from "@/lib/data";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createTask,
  setTaskStatus,
  addMember,
} from "@/lib/server/projects";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import RepoConnectForm from "@/components/project/RepoConnectForm";
import BrowserbaseLaunch from "@/components/tools/BrowserbaseLaunch";
import DiscordInvite from "@/components/tools/DiscordInvite";
import { browserbase, discord } from "@/lib/config";
import type { TaskStatus } from "@/types";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "doing", label: "In progress" },
  { key: "done", label: "Done" },
];

const NEXT: Record<TaskStatus, { to: TaskStatus; label: string }[]> = {
  todo: [{ to: "doing", label: "Start" }],
  doing: [
    { to: "done", label: "Finish" },
    { to: "todo", label: "Back" },
  ],
  done: [{ to: "doing", label: "Reopen" }],
};

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();
  const detail = await getProjectBySlug(slug, user);
  if (!detail) notFound();

  if (!detail.access) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[#e7e9ea]">No access</h1>
        <p className="text-[14px] text-[#8b8d93] mt-2">
          You are not a member of this project.
        </p>
      </div>
    );
  }

  const { project, tasks, members } = detail;
  const allUsers = await db
    .select({ id: users.id, display_name: users.display_name })
    .from(users);
  const memberIds = new Set(members.map((m) => m.user_id));
  const nonMembers = allUsers.filter((u) => !memberIds.has(u.id));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#e7e9ea]">
              {project.name}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="text-[14px] text-[#8b8d93] mt-1">{project.description}</p>
          )}
        </div>
        {project.repo_url && (
          <a
            href={project.repo_url}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] text-[#1d9bf0] hover:underline font-mono"
          >
            {project.repo_full_name}
          </a>
        )}
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-[#0e0f10] p-4 mb-8">
        <p className="text-[12px] uppercase tracking-wider text-[#536471] mb-2">
          GitHub repo
        </p>
        <RepoConnectForm
          projectId={project.id}
          slug={slug}
          current={project.repo_full_name}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Board */}
        <section className="lg:col-span-2">
          <div className="grid sm:grid-cols-3 gap-3">
            {COLUMNS.map((col) => {
              const items = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="space-y-2">
                  <p className="text-[12px] uppercase tracking-wider text-[#536471] flex items-center justify-between">
                    {col.label}
                    <span className="tabular-nums">{items.length}</span>
                  </p>
                  {items.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg border border-white/[0.06] bg-[#0e0f10] p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[14px] text-[#e7e9ea] leading-snug">
                          {t.title}
                        </span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      {t.assignee_name && (
                        <p className="text-[12px] text-[#536471] mt-1.5">
                          {t.assignee_name}
                        </p>
                      )}
                      <div className="flex gap-1.5 mt-2">
                        {NEXT[t.status as TaskStatus].map((move) => (
                          <form key={move.to} action={setTaskStatus}>
                            <input type="hidden" name="task_id" value={t.id} />
                            <input type="hidden" name="status" value={move.to} />
                            <input type="hidden" name="slug" value={slug} />
                            <button
                              type="submit"
                              className="text-[12px] text-[#8b8d93] hover:text-[#e7e9ea] border border-white/[0.08] hover:border-white/[0.18] rounded-full px-2.5 py-0.5 transition-colors cursor-pointer"
                            >
                              {move.label}
                            </button>
                          </form>
                        ))}
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-[12px] text-[#3d3f45] py-2">Empty</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* New task */}
          <form
            action={createTask}
            className="mt-6 rounded-lg border border-white/[0.06] bg-[#0e0f10] p-4 space-y-3"
          >
            <p className="text-[12px] uppercase tracking-wider text-[#536471]">
              Add task
            </p>
            <input type="hidden" name="project_id" value={project.id} />
            <input type="hidden" name="slug" value={slug} />
            <input
              name="title"
              required
              placeholder="Task title"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[14px] text-[#e7e9ea]"
            />
            <div className="flex gap-2">
              <select
                name="priority"
                defaultValue="med"
                className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-[#e7e9ea]"
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                name="assignee_id"
                defaultValue=""
                className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-[#e7e9ea]"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.display_name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium text-[14px] rounded-full px-5 py-2 transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </form>
        </section>

        {/* Sidebar: members + tools */}
        <section className="space-y-8">
          <div>
            <h2 className="text-[12px] uppercase tracking-wider text-[#536471] mb-3">
              Members
            </h2>
            <div className="space-y-1.5">
              {members.map((m) => (
                <div
                  key={m.user_id}
                  className="flex items-center justify-between text-[14px]"
                >
                  <span className="text-[#e7e9ea]">{m.display_name}</span>
                  <span className="text-[12px] text-[#536471]">{m.role}</span>
                </div>
              ))}
            </div>
            {user.role === "founder" && nonMembers.length > 0 && (
              <form action={addMember} className="flex gap-2 mt-3">
                <input type="hidden" name="project_id" value={project.id} />
                <input type="hidden" name="slug" value={slug} />
                <select
                  name="user_id"
                  defaultValue=""
                  required
                  className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-[#e7e9ea]"
                >
                  <option value="" disabled>
                    Add member
                  </option>
                  {nonMembers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.display_name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-white/[0.06] hover:bg-white/[0.1] text-[#e7e9ea] text-[13px] rounded-full px-4 py-2 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}
          </div>

          <div>
            <h2 className="text-[12px] uppercase tracking-wider text-[#536471] mb-3">
              Browser automation
            </h2>
            <BrowserbaseLaunch configured={browserbase.configured()} />
            {!browserbase.configured() && (
              <p className="text-[12px] text-[#536471] mt-2">
                Set {browserbase.missing().join(", ")}.
              </p>
            )}
          </div>

          {user.role === "founder" && (
            <div>
              <h2 className="text-[12px] uppercase tracking-wider text-[#536471] mb-3">
                Invite over Discord
              </h2>
              <DiscordInvite configured={discord.configured()} />
              {!discord.configured() && (
                <p className="text-[12px] text-[#536471] mt-2">
                  Set {discord.missing().join(", ")}.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
