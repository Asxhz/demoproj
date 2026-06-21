import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/data";
import { timeAgo } from "@/lib/utils";
import MarkAllRead from "@/components/MarkAllRead";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await getNotifications(user.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#e7e9ea]">
          Inbox
        </h1>
        {items.some((n) => !n.read) && <MarkAllRead />}
      </div>

      {items.length === 0 ? (
        <p className="text-[14px] text-[#536471]">Nothing here yet.</p>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {items.map((n) => {
            const inner = (
              <div className="py-3.5 flex items-start gap-3">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    n.read ? "bg-transparent" : "bg-[#1d9bf0]"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-medium text-[#e7e9ea]">
                      {n.title}
                    </p>
                    <span className="text-[12px] text-[#536471] shrink-0">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  {n.body && (
                    <p className="text-[13px] text-[#8b8d93] mt-0.5">{n.body}</p>
                  )}
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block hover:opacity-80">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
