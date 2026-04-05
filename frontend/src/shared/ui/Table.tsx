import type { HTMLAttributes, PropsWithChildren, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function TableContainer({ className, children }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-panel", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ className, children, ...props }: PropsWithChildren<TableHTMLAttributes<HTMLTableElement>>) {
  return (
    <table className={cn("min-w-full divide-y divide-slate-100", className)} {...props}>
      {children}
    </table>
  );
}

export function TH({ className, children, ...props }: PropsWithChildren<ThHTMLAttributes<HTMLTableCellElement>>) {
  return (
    <th
      className={cn("px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({ className, children, ...props }: PropsWithChildren<TdHTMLAttributes<HTMLTableCellElement>>) {
  return (
    <td className={cn("whitespace-nowrap px-6 py-4 text-sm text-slate-700", className)} {...props}>
      {children}
    </td>
  );
}
