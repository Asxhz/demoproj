import Link from "next/link";
import type { User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

interface TopNavProps {
  user?: User | null;
}

export default function TopNav({ user }: TopNavProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-12 bg-[#09090B]/80 backdrop-blur-xl border-b border-white/[0.06] feed-hide-nav">
      <nav className="h-full max-w-5xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[15px] font-bold text-[#F4F4F5] tracking-tight group-hover:text-[#6366F1] transition-colors">
            Claudex
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/feed"
            className="rounded-full px-3 py-1.5 text-sm text-[rgba(244,244,245,0.55)] hover:text-[#F4F4F5] hover:bg-white/[0.04] transition-all"
          >
            Feed
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full px-3 py-1.5 text-sm text-[rgba(244,244,245,0.55)] hover:text-[#F4F4F5] hover:bg-white/[0.04] transition-all"
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href={`/u/${user.handle}`} className="flex items-center gap-2 group">
              <Avatar handle={user.handle} displayName={user.display_name} size="sm" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-xs">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" className="text-xs !rounded-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
