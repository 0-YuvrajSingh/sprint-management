import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/shared/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement>, PropsWithChildren {
  elevated?: boolean;
}

export function Card({ className, children, elevated = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-white/85 p-6 backdrop-blur-xl",
        elevated && "shadow-panel",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
