import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listIntegrations } from "@/lib/integrations";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import SignOutButton from "@/components/nav/SignOutButton";

export default async function SettingsPage() {
  const user = await requireUser();
  const integrations = await listIntegrations(user.id);
  const connected = new Set(integrations.map((i) => i.provider));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[#e7e9ea] mb-6">
        Settings
      </h1>

      <section className="rounded-lg border border-white/[0.06] bg-[#0e0f10] p-5 mb-4">
        <div className="flex items-center gap-4">
          <Avatar seed={user.avatar_seed ?? user.handle} displayName={user.display_name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-medium text-[#e7e9ea]">
                {user.display_name}
              </p>
              <Badge color={user.role === "founder" ? "blue" : "gray"}>
                {user.role}
              </Badge>
            </div>
            <p className="text-[13px] text-[#8b8d93]">{user.email}</p>
            <p className="text-[12px] text-[#536471] font-mono">@{user.handle}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/[0.06] bg-[#0e0f10] p-5 mb-4">
        <h2 className="text-[14px] font-medium text-[#e7e9ea] mb-3">
          Connected tools
        </h2>
        <div className="space-y-2 text-[14px]">
          {(["github", "discord", "browserbase"] as const).map((p) => (
            <div key={p} className="flex items-center justify-between">
              <span className="text-[#e7e9ea] capitalize">{p}</span>
              {connected.has(p) ? (
                <Badge color="green">Connected</Badge>
              ) : (
                <Badge color="gray">Not connected</Badge>
              )}
            </div>
          ))}
        </div>
        <Link
          href="/tools"
          className="inline-block mt-4 text-[13px] text-[#1d9bf0] hover:underline"
        >
          Manage tools
        </Link>
      </section>

      <section className="rounded-lg border border-white/[0.06] bg-[#0e0f10] p-5">
        <h2 className="text-[14px] font-medium text-[#e7e9ea] mb-1">Session</h2>
        <p className="text-[13px] text-[#8b8d93] mb-3">
          Sign out of this device.
        </p>
        <SignOutButton className="text-[#EF4444]" />
      </section>
    </div>
  );
}
