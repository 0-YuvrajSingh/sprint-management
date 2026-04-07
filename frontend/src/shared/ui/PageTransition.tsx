import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";

export function PageTransition({ children }: PropsWithChildren) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}
