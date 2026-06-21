import { requireUser } from "@/lib/auth";
import { listIntegrations } from "@/lib/integrations";
import { github, discord, browserbase, appUrl } from "@/lib/config";
import DisconnectButton from "@/components/tools/DisconnectButton";
import BrowserbaseLaunch from "@/components/tools/BrowserbaseLaunch";
import DiscordInvite from "@/components/tools/DiscordInvite";
import Badge from "@/components/ui/Badge";

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0e0f10] p-5">
      <h2 className="text-[16px] font-medium text-[#e7e9ea]">{title}</h2>
      <p className="text-[13px] text-[#8b8d93] mt-0.5 mb-4">{desc}</p>
      {children}
    </div>
  );
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const integrations = await listIntegrations(user.id);
  const gh = integrations.find((i) => i.provider === "github");
  const bb = integrations.find((i) => i.provider === "browserbase");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[#e7e9ea] mb-1">
        Tools
      </h1>
      <p className="text-[14px] text-[#8b8d93] mb-6">
        Connect once, use everywhere across your projects.
      </p>

      {sp.connected && (
        <div className="mb-4 rounded-lg border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] px-4 py-2.5 text-[13px] text-[#22C55E]">
          {sp.connected} connected.
        </div>
      )}
      {sp.error && (
        <div className="mb-4 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] px-4 py-2.5 text-[13px] text-[#EF4444]">
          {sp.error.replace(/_/g, " ")}
        </div>
      )}

      <div className="space-y-4">
        {/* GitHub */}
        <Card title="GitHub" desc="Link repos to projects and pull commits.">
          {gh?.access_token ? (
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#e7e9ea]">
                Connected as{" "}
                <span className="font-mono text-[#1d9bf0]">@{gh.account_label}</span>
              </span>
              <DisconnectButton provider="github" />
            </div>
          ) : github.configured() ? (
            <a
              href="/api/integrations/github/start"
              className="inline-block bg-[#e7e9ea] hover:bg-white text-black font-medium text-[14px] rounded-full px-4 py-2 transition-colors"
            >
              Connect GitHub
            </a>
          ) : (
            <p className="text-[13px] text-[#536471]">
              Not configured. Set {github.missing().join(", ")} in your environment.
            </p>
          )}
        </Card>

        {/* Discord */}
        <Card
          title="Discord"
          desc="Invite people to sign up and join a call from the bot."
        >
          <div className="flex items-center gap-2 mb-3">
            {discord.configured() ? (
              <Badge color="green">Bot ready</Badge>
            ) : (
              <Badge color="gray">Not configured</Badge>
            )}
          </div>
          {discord.configured() ? (
            user.role === "founder" ? (
              <DiscordInvite configured />
            ) : (
              <p className="text-[13px] text-[#536471]">
                Ask a founder to send invites, or use the bot commands in your
                server.
              </p>
            )
          ) : (
            <p className="text-[13px] text-[#536471]">
              Set {discord.missing().join(", ")}.
            </p>
          )}
          <p className="text-[12px] text-[#3d3f45] mt-3 break-all">
            Interactions endpoint: {appUrl()}/api/integrations/discord/interactions
            <br />
            Slash commands: /signup, /join
          </p>
        </Card>

        {/* Browserbase */}
        <Card title="Browserbase" desc="Spin up a cloud browser session on demand.">
          <BrowserbaseLaunch configured={browserbase.configured()} />
          {bb?.account_label && (
            <p className="text-[12px] text-[#536471] mt-2">
              Project {bb.account_label}
            </p>
          )}
          {!browserbase.configured() && (
            <p className="text-[13px] text-[#536471] mt-2">
              Set {browserbase.missing().join(", ")}.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
