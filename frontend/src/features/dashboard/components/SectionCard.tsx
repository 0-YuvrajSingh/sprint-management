import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={[
        "rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.65)]",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </header>

      {children}
    </section>
  );
}
