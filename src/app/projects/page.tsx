import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserProjects } from "@/lib/data";
import { createProject } from "@/lib/server/projects";
import { StatusBadge } from "@/components/ui/Badge";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await getUserProjects(user);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[#e7e9ea] mb-6">
        Projects
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          {projects.length === 0 ? (
            <p className="text-[14px] text-[#536471]">
              No projects yet. Create your first one.
            </p>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="block rounded-lg border border-white/[0.06] bg-[#0e0f10] p-4 hover:border-white/[0.14] transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-medium text-[#e7e9ea]">
                      {p.name}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  {p.description && (
                    <p className="text-[13px] text-[#8b8d93] mt-1 line-clamp-1">
                      {p.description}
                    </p>
                  )}
                  <p className="text-[12px] text-[#536471] mt-2 tabular-nums">
                    {p.counts.done}/{p.counts.total} tasks done
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-[13px] uppercase tracking-wider text-[#536471] mb-3">
            New project
          </h2>
          <form
            action={createProject}
            className="rounded-lg border border-white/[0.06] bg-[#0e0f10] p-4 space-y-3"
          >
            <input
              name="name"
              required
              placeholder="Project name"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[14px] text-[#e7e9ea]"
            />
            <textarea
              name="description"
              rows={2}
              placeholder="What is this project?"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[14px] text-[#e7e9ea] resize-none"
            />
            <input
              name="repo_full_name"
              placeholder="GitHub repo (owner/repo, optional)"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[14px] text-[#e7e9ea] font-mono"
            />
            <button
              type="submit"
              className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium text-[14px] rounded-full px-4 py-2 transition-colors cursor-pointer"
            >
              Create project
            </button>
          </form>
          <p className="text-[12px] text-[#536471] mt-2">
            Connect a repo from{" "}
            <Link href="/tools" className="text-[#1d9bf0] hover:underline">
              Tools
            </Link>{" "}
            to pick from your GitHub.
          </p>
        </section>
      </div>
    </div>
  );
}
