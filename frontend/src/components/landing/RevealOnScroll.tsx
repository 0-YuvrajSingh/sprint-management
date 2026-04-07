import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface RevealOnScrollProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: "easeOut" },
  },
};

export default function RevealOnScroll({
  children,
  className,
  staggerChildren = 0.08,
  delayChildren = 0,
  once = true,
  amount = 0.2,
  ...props
}: RevealOnScrollProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.28,
        ease: "easeOut",
        staggerChildren,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}
