import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export default function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      className={[
        "rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-7",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      initial={{ opacity: 0, scale: 0.97, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
