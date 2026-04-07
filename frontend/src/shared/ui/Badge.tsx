import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/shared/lib/cn";

type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger" | "accent";

const badgeClasses: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  accent: "bg-accent-50 text-accent-700",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, PropsWithChildren {
  variant?: BadgeVariant;
}

export function Badge({ className, children, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        badgeClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
