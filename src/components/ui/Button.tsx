"use client";

import { type ButtonHTMLAttributes } from "react";

const variantClasses = {
  primary:
    "bg-[#38BDF8] text-[#09090B] font-semibold hover:bg-[#7DD3FC] active:bg-[#38BDF8] shadow-[0_1px_12px_-2px_rgba(56,189,248,0.35)]",
  secondary:
    "bg-transparent text-[#F4F4F5] border border-white/10 hover:bg-white/[0.04] hover:border-white/[0.16] active:bg-white/[0.06]",
  ghost:
    "bg-transparent text-[#F4F4F5] hover:bg-white/[0.04] active:bg-white/[0.06]",
  danger:
    "bg-[rgba(239,68,68,0.12)] text-[#EF4444] border border-[rgba(239,68,68,0.20)] hover:bg-[rgba(239,68,68,0.18)]",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] disabled:pointer-events-none disabled:opacity-40 cursor-pointer ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
