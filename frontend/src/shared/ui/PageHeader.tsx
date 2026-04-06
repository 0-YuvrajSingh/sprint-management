import type { PropsWithChildren, ReactNode } from "react";

interface PageHeaderProps extends PropsWithChildren {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">AgileTrack</p>
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{title}</h1>
          <p className="max-w-2xl text-sm text-slate-600">{description}</p>
        </div>
        {children}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
