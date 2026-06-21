import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0e0f10] p-5">
      <p className="text-[28px] font-semibold tabular-nums text-[#e7e9ea]">{value}</p>
      <p className="text-[13px] text-[#8b8d93] mt-1">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const { projects, totals, myTasks } = await getDashboardStats(user);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#e7e9ea]">
            Dashboard
          </h1>
          <p className="text-[14px] text-[#8b8d93] mt-0.5">
            {user.role === "founder" ? "Everything across the workspace." : "Your work at a glance."}
          </p>
        </div>
        <Link
          href="/projects"
          className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium text-[14px] rounded-full px-5 py-2 transition-colors"
        >
          New project
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="Projects" value={projects.length} />
        <Stat label="Open tasks" value={totals.todo + totals.doing} />
        <Stat label="In progress" value={totals.doing} />
        <Stat label="Done" value={totals.done} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <h2 className="text-[13px] uppercase tracking-wider text-[#536471] mb-3">
            Projects
          </h2>
          {projects.length === 0 ? (
            <EmptyProjects />
          ) : (
            <div className="space-y-2">
              {projects.map((p) => {
                const pct = p.counts.total
                  ? Math.round((p.counts.done / p.counts.total) * 100)
                  : 0;
                return (
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
                    {p.repo_full_name && (
                      <p className="text-[12px] text-[#536471] mt-1 font-mono">
                        {p.repo_full_name}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full bg-[#22C55E]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-[#8b8d93] tabular-nums">
                        {p.counts.done}/{p.counts.total}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-[13px] uppercase tracking-wider text-[#536471] mb-3">
            Assigned to you
          </h2>
          {myTasks.length === 0 ? (
            <p className="text-[14px] text-[#536471]">Nothing assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {myTasks.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-white/[0.06] bg-[#0e0f10] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] text-[#e7e9ea]">{t.title}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyProjects() {
  return (
    <div className="rounded-lg border border-dashed border-white/[0.1] p-8 text-center">
      <p className="text-[15px] text-[#e7e9ea]">No projects yet.</p>
      <p className="text-[13px] text-[#8b8d93] mt-1 mb-4">
        Create one and connect a repo to begin.
      </p>
      <Link
        href="/projects"
        className="inline-block bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium text-[14px] rounded-full px-5 py-2 transition-colors"
      >
        New project
      </Link>
    </div>
  );
}
