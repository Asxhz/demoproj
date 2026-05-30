export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function avatarGradient(handle: string): string {
  const hash = simpleHash(handle);
  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 50%))`;
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function fakeCommentEngagement(commentId: string): { likes: number; reposts: number; replies: number } {
  const hash = simpleHash(commentId);
  return {
    likes: (hash % 42),
    reposts: (hash % 8),
    replies: (hash % 5),
  };
}

export function fakeEngagement(postId: string): { likes: number; reposts: number; views: string; bookmarks: number; comments: number } {
  const hash = simpleHash(postId);
  return {
    likes: 12 + (hash % 835),
    reposts: 3 + (hash % 117),
    views: ((1.2 + (hash % 44))).toFixed(1) + 'K',
    bookmarks: 1 + (hash % 89),
    comments: 1 + (hash % 48),
  };
}
