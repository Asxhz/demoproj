import Image from "next/image";
import { avatarGradient } from "@/lib/utils";

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
} as const;

const sizePixels = { sm: 32, md: 40, lg: 56 } as const;

const AVATAR_IMAGES: Record<string, string> = {
  t3_roasts: "/avatars/t3_roasts_pfp.webp",
  vibeathy: "/avatars/vibeathy_pfp.webp",
  samalin: "/avatars/samalin_pfp.webp",
  elongated_musk: "/avatars/elongated_musk_pfp.webp",
  saint_reset: "/avatars/saint_reset_pfp.webp",
  trq_404: "/avatars/trq_404_pfp.webp",
  yle_king: "/avatars/yle_king.webp",
};

interface AvatarProps {
  handle: string;
  displayName: string;
  size?: "sm" | "md" | "lg";
}

export default function Avatar({ handle, displayName, size = "md" }: AvatarProps) {
  const imageSrc = AVATAR_IMAGES[handle];
  const px = sizePixels[size];

  if (imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt={displayName}
        width={px}
        height={px}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none`}
      style={{ background: avatarGradient(handle) }}
      aria-label={displayName}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}
