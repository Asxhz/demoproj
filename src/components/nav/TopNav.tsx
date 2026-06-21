import Link from "next/link";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { SessionUser } from "@/types";
import Avatar from "@/components/ui/Avatar";
import SignOutButton from "./SignOutButton";

export default async function TopNav({ user }: { user: SessionUser | null }) {
  let unread = 0;
  if (user) {
    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(eq(notifications.user_id, user.id), eq(notifications.read, false)),
      );
    unread = rows.length;
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-white/[0.06] bg-black/80 backdrop-blur">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-[15px] font-semibold tracking-tight text-[#e7e9ea]"
        >
          Claudex
        </Link>

        {user ? (
          <nav className="flex items-center gap-5 text-[14px]">
            <Link href="/dashboard" className="text-[#8b8d93] hover:text-[#e7e9ea] transition-colors">
              Dashboard
            </Link>
            <Link href="/projects" className="text-[#8b8d93] hover:text-[#e7e9ea] transition-colors">
              Projects
            </Link>
            <Link href="/tools" className="text-[#8b8d93] hover:text-[#e7e9ea] transition-colors">
              Tools
            </Link>
            <Link
              href="/notifications"
              className="relative text-[#8b8d93] hover:text-[#e7e9ea] transition-colors"
            >
              Inbox
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-3 min-w-[16px] h-4 px-1 rounded-full bg-[#1d9bf0] text-white text-[10px] font-semibold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
            <Link href="/settings" className="flex items-center gap-2 group">
              <Avatar seed={user.avatar_seed ?? user.handle} displayName={user.display_name} size="sm" />
            </Link>
            <SignOutButton />
          </nav>
        ) : (
          <nav className="flex items-center gap-4 text-[14px]">
            <Link href="/login" className="text-[#8b8d93] hover:text-[#e7e9ea] transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium rounded-full px-4 py-1.5 transition-colors"
            >
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
