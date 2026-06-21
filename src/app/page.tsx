import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p className="text-[12px] text-[#536471] uppercase tracking-[0.2em] mb-6">
          Claudex
        </p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-[#e7e9ea] leading-[1.05] max-w-3xl">
          Your projects. Your tools. One place that ships.
        </h1>
        <p className="mt-6 text-lg text-[#8b8d93] max-w-xl leading-relaxed">
          Connect GitHub, run the work, invite your team over Discord. No noise,
          no busywork.
        </p>
        <div className="mt-9 flex items-center gap-3">
          <Link
            href="/signup"
            className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium text-[15px] rounded-full px-7 py-3 transition-colors"
          >
            Start free
          </Link>
          <Link
            href="/login"
            className="border border-white/[0.12] hover:border-white/[0.22] text-[#e7e9ea] font-medium text-[15px] rounded-full px-7 py-3 transition-colors hover:bg-white/[0.03]"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 py-14 grid sm:grid-cols-3 gap-px bg-white/[0.04]">
          {[
            { k: "Connect", v: "Link a GitHub repo to any project in one click." },
            { k: "Assign", v: "Spin up tasks, set priority, hand them off." },
            { k: "Invite", v: "Send signup and call invites straight from Discord." },
          ].map((f) => (
            <div key={f.k} className="bg-black p-6">
              <p className="text-[13px] text-[#1d9bf0] font-medium uppercase tracking-wider">
                {f.k}
              </p>
              <p className="mt-2 text-[15px] text-[#e7e9ea] leading-relaxed">
                {f.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 py-7 text-[13px] text-[#3d3f45]">
          Claudex
        </div>
      </footer>
    </div>
  );
}
