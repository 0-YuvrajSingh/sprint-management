import { forwardRef } from "react";
import type { PropsWithChildren, SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, PropsWithChildren {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, label, ...props }, ref) => (
    <label className="flex w-full flex-col gap-2">
      {label ? <span className="text-sm font-semibold text-slate-700">{label}</span> : null}
      <select
        ref={ref}
        className={cn(
          "h-11 rounded-2xl border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  ),
);

Select.displayName = "Select";
