import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import Card from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: ReactNode;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: "easeOut" },
  },
};

export default function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              {icon}
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
        </Card>
      </motion.div>
    </motion.div>
  );
}
