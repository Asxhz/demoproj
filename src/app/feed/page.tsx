import { db } from "@/db";
import { feedPosts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { FeedPost, User } from "@/types";
import FeedPostCard from "@/components/feed/FeedPostCard";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import Avatar from "@/components/ui/Avatar";

export default async function FeedPage() {
  const currentUser = await getCurrentUser();

  const posts = await db
    .select({
      id: feedPosts.id,
      author_id: feedPosts.author_id,
      task_id: feedPosts.task_id,
      body: feedPosts.body,
      agent_results: feedPosts.agent_results,
      is_draft: feedPosts.is_draft,
      published_at: feedPosts.published_at,
      created_at: feedPosts.created_at,
      author: {
        id: users.id,
        email: users.email,
        display_name: users.display_name,
        handle: users.handle,
        avatar_seed: users.avatar_seed,
        bio: users.bio,
        created_at: users.created_at,
      },
    })
    .from(feedPosts)
    .innerJoin(users, eq(feedPosts.author_id, users.id))
    .where(eq(feedPosts.is_draft, false))
    .orderBy(desc(feedPosts.published_at));

  return (
    <div className="min-h-screen bg-[#09090B] -mt-14">
      {/* Hide the global TopNav on feed pages via CSS override */}
      <style dangerouslySetInnerHTML={{ __html: `.feed-hide-nav { display: none !important; }` }} />

      <div className="flex justify-center">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col justify-between w-[275px] h-screen sticky top-0 px-3 py-4 border-r border-white/[0.08]">
          <div>
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 px-3 py-3 rounded-full hover:bg-white/[0.06] transition-colors mb-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="1.5"/>
                <path d="M14 10L20 13V19L14 22L8 19V13L14 10Z" fill="#6366F1"/>
              </svg>
              <span className="text-xl font-bold text-[#F4F4F5]">Claudex</span>
            </Link>

            {/* Nav items */}
            <nav className="flex flex-col gap-0.5 mt-2">
              <Link href="/" className="nav-item flex items-center gap-4 px-3 py-3 rounded-full text-[#F4F4F5] text-[20px]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Home</span>
              </Link>

              <Link href="/feed" className="nav-item active flex items-center gap-4 px-3 py-3 rounded-full text-[#F4F4F5] text-[20px] font-bold">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11a9 9 0 0 1 9 9"/>
                  <path d="M4 4a16 16 0 0 1 16 16"/>
                  <circle cx="5" cy="19" r="1" fill="currentColor"/>
                </svg>
                <span>Feed</span>
              </Link>

              <Link href="/benchmarks/new" className="nav-item flex items-center gap-4 px-3 py-3 rounded-full text-[#F4F4F5] text-[20px]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <span>Benchmarks</span>
              </Link>

              <Link href="/dashboard" className="nav-item flex items-center gap-4 px-3 py-3 rounded-full text-[#F4F4F5] text-[20px]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span>Dashboard</span>
              </Link>

              {/* Post button */}
              <Link href="/benchmarks/new" className="mt-4 flex items-center justify-center bg-[#6366F1] hover:bg-[#5558E6] text-white font-bold text-[17px] rounded-full py-3 px-6 transition-colors">
                Run Benchmark
              </Link>
            </nav>
          </div>

          {/* User avatar at bottom */}
          {currentUser ? (
            <Link href={`/u/${currentUser.handle}`} className="flex items-center gap-3 p-3 rounded-full hover:bg-white/[0.06] transition-colors">
              <Avatar handle={currentUser.handle} displayName={currentUser.display_name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#F4F4F5] truncate">{currentUser.display_name}</p>
                <p className="text-[13px] text-[rgba(244,244,245,0.45)] truncate">@{currentUser.handle}</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(244,244,245,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
              </svg>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center justify-center border border-white/[0.12] text-[#F4F4F5] font-bold text-[15px] rounded-full py-2.5 px-6 hover:bg-white/[0.04] transition-colors">
              Log in
            </Link>
          )}
        </aside>

        {/* Center Feed Column */}
        <main className="w-full max-w-[600px] min-h-screen border-r border-white/[0.08]">
          {/* Feed header */}
          <div className="sticky top-0 z-40 bg-[#09090B]/80 backdrop-blur-xl border-b border-white/[0.08]">
            <h1 className="px-4 py-3 text-[20px] font-bold text-[#F4F4F5]">Feed</h1>
            {/* Tab bar */}
            <div className="flex">
              <button className="flex-1 py-3 text-center text-[15px] font-bold text-[#F4F4F5] relative hover:bg-white/[0.04] transition-colors">
                For you
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#6366F1] rounded-full" />
              </button>
              <button className="flex-1 py-3 text-center text-[15px] text-[rgba(244,244,245,0.45)] hover:bg-white/[0.04] transition-colors font-medium">
                Following
              </button>
            </div>
          </div>

          {/* Posts */}
          <div>
            {posts.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-[15px] text-[rgba(244,244,245,0.45)]">
                  No posts yet. Be the first to run a benchmark.
                </p>
                <Link href="/benchmarks/new" className="inline-block mt-4 bg-[#6366F1] hover:bg-[#5558E6] text-white font-bold text-[15px] rounded-full py-2.5 px-6 transition-colors">
                  Run Benchmark
                </Link>
              </div>
            ) : (
              posts.map((row) => (
                <FeedPostCard
                  key={row.id}
                  post={
                    {
                      id: row.id,
                      author_id: row.author_id,
                      task_id: row.task_id,
                      body: row.body,
                      agent_results: row.agent_results as FeedPost["agent_results"],
                      is_draft: row.is_draft,
                      published_at: row.published_at,
                      created_at: row.created_at,
                      author: row.author as User,
                    } as FeedPost & { author: User }
                  }
                />
              ))
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-[350px] px-6 py-4 sticky top-0 h-screen overflow-y-auto">
          {/* Search bar */}
          <div className="relative mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(244,244,245,0.40)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search Claudex"
              className="w-full bg-[#111113] border border-white/[0.08] rounded-full pl-10 pr-4 py-2.5 text-[15px] text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.35)] focus:bg-[#09090B] focus:border-[#6366F1] transition-colors"
            />
          </div>

          {/* Trending Benchmarks */}
          <div className="bg-[#111113] rounded-2xl border border-white/[0.08] overflow-hidden mb-4">
            <h2 className="px-4 pt-3 pb-2 text-[20px] font-bold text-[#F4F4F5]">Trending Benchmarks</h2>

            <div className="hover:bg-white/[0.03] transition-colors px-4 py-3 cursor-pointer">
              <p className="text-[13px] text-[rgba(244,244,245,0.40)]">Coding Challenge</p>
              <p className="text-[15px] font-bold text-[#F4F4F5] mt-0.5">REST API Implementation</p>
              <p className="text-[13px] text-[rgba(244,244,245,0.40)] mt-0.5">847 runs</p>
            </div>

            <div className="hover:bg-white/[0.03] transition-colors px-4 py-3 cursor-pointer">
              <p className="text-[13px] text-[rgba(244,244,245,0.40)]">Algorithm</p>
              <p className="text-[15px] font-bold text-[#F4F4F5] mt-0.5">Binary Tree Traversal</p>
              <p className="text-[13px] text-[rgba(244,244,245,0.40)] mt-0.5">623 runs</p>
            </div>

            <div className="hover:bg-white/[0.03] transition-colors px-4 py-3 cursor-pointer">
              <p className="text-[13px] text-[rgba(244,244,245,0.40)]">Full Stack</p>
              <p className="text-[15px] font-bold text-[#F4F4F5] mt-0.5">Auth Flow with OAuth2</p>
              <p className="text-[13px] text-[rgba(244,244,245,0.40)] mt-0.5">512 runs</p>
            </div>

            <Link href="/benchmarks/new" className="block px-4 py-3 text-[15px] text-[#6366F1] hover:bg-white/[0.03] transition-colors">
              Show more
            </Link>
          </div>

          {/* Who to follow */}
          <div className="bg-[#111113] rounded-2xl border border-white/[0.08] overflow-hidden">
            <h2 className="px-4 pt-3 pb-2 text-[20px] font-bold text-[#F4F4F5]">Who to follow</h2>

            <div className="hover:bg-white/[0.03] transition-colors px-4 py-3 flex items-center gap-3">
              <Avatar handle="sarahdev" displayName="Sarah Chen" size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#F4F4F5] truncate">Sarah Chen</p>
                <p className="text-[13px] text-[rgba(244,244,245,0.45)] truncate">@sarahdev</p>
              </div>
              <button className="bg-[#F4F4F5] text-[#09090B] font-bold text-[13px] rounded-full px-4 py-1.5 hover:bg-[#d4d4d8] transition-colors">
                Follow
              </button>
            </div>

            <div className="hover:bg-white/[0.03] transition-colors px-4 py-3 flex items-center gap-3">
              <Avatar handle="alexkode" displayName="Alex Rodriguez" size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#F4F4F5] truncate">Alex Rodriguez</p>
                <p className="text-[13px] text-[rgba(244,244,245,0.45)] truncate">@alexkode</p>
              </div>
              <button className="bg-[#F4F4F5] text-[#09090B] font-bold text-[13px] rounded-full px-4 py-1.5 hover:bg-[#d4d4d8] transition-colors">
                Follow
              </button>
            </div>

            <div className="hover:bg-white/[0.03] transition-colors px-4 py-3 flex items-center gap-3">
              <Avatar handle="mjbuilds" displayName="Maya Johnson" size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#F4F4F5] truncate">Maya Johnson</p>
                <p className="text-[13px] text-[rgba(244,244,245,0.45)] truncate">@mjbuilds</p>
              </div>
              <button className="bg-[#F4F4F5] text-[#09090B] font-bold text-[13px] rounded-full px-4 py-1.5 hover:bg-[#d4d4d8] transition-colors">
                Follow
              </button>
            </div>

            <Link href="#" className="block px-4 py-3 text-[15px] text-[#6366F1] hover:bg-white/[0.03] transition-colors">
              Show more
            </Link>
          </div>

          {/* Footer links */}
          <div className="mt-4 px-4 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[rgba(244,244,245,0.30)]">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Cookie Policy</span>
            <span>&copy; 2026 Claudex</span>
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav sm:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4F4F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </Link>
          <Link href="/feed" className="p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>
          <Link href="/benchmarks/new" className="p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4F4F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </Link>
          <Link href="/dashboard" className="p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4F4F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </Link>
        </div>
      </nav>
    </div>
  );
}
