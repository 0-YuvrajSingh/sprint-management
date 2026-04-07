import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/shared/ui/Card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
}

export function StatCard({ icon: Icon, label, value, helper }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-brand-300/0 via-brand-300 to-accent-300/0" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
            <div className="space-y-1">
              <p className="font-display text-3xl font-bold tracking-tight text-ink">{value}</p>
              <p className="text-sm text-slate-500">{helper}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
            <Icon className="size-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
