import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-indigo-600 bg-[linear-gradient(135deg,#4f46e5,#6366f1_58%,#06b6d4)] text-white shadow-[0_16px_34px_-18px_rgba(79,70,229,0.92)] hover:brightness-[1.03]",
  secondary:
    "border-slate-200 bg-white text-slate-900 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.6)] hover:border-indigo-200 hover:bg-indigo-50",
  ghost: "border-transparent bg-transparent text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  loadingText = "Working...",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const motionEnabled = !disabled && !isLoading;

  return (
    <motion.button
      type="button"
      className={[
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      disabled={disabled || isLoading}
      whileHover={motionEnabled ? { scale: 1.03, y: -1 } : undefined}
      whileTap={motionEnabled ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
