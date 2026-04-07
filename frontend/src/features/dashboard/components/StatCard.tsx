import { motion } from "framer-motion";
import type { ReactNode } from "react";

type TrendTone = "positive" | "warning" | "neutral";

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  trendTone?: TrendTone;
  helperText: string;
  icon: ReactNode;
}

const trendToneClasses: Record<TrendTone, string> = {
  positive: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function StatCard({
  label,
  value,
  trend,
  trendTone = "neutral",
  helperText,
  icon,
}: StatCardProps) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-white/95 p-4 shadow-[0_24px_58px_-36px_rgba(30,41,100,0.68)]"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-24 -translate-y-20 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.26),transparent_70%)] opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <motion.span
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50/70 text-indigo-700"
          whileHover={{ rotate: -6, scale: 1.07 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {icon}
        </motion.span>
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={[
            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
            trendToneClasses[trendTone],
          ]
            .join(" ")
            .trim()}
        >
          {trend}
        </span>
        <span className="text-xs text-slate-500">{helperText}</span>
      </div>
    </motion.article>
  );
}
