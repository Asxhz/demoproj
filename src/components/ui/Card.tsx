import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({ children, className = "", hoverable = true }: CardProps) {
  return (
    <div
      className={`bg-[#111113] border border-white/[0.06] rounded-xl p-5 ${hoverable ? "hover:border-white/[0.12] hover:-translate-y-[1px] hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]" : ""} transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
