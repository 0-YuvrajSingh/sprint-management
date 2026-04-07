import type { ReactNode } from "react";

type BadgeTone = "indigo" | "slate" | "green" | "amber" | "rose" | "blue" | "violet";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({ children, tone = "slate", size = "md", className }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-semibold uppercase tracking-[0.08em]",
        toneClasses[tone],
        sizeClasses[size],
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {children}
    </span>
  );
}
