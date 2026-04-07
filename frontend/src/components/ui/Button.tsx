import { motion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  withMotion?: boolean;
}

const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl border border-transparent font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white shadow-[0_16px_30px_-18px_rgba(79,70,229,0.8)] hover:bg-indigo-500 focus-visible:border-indigo-300",
  secondary: "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-100 focus-visible:border-indigo-300",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:border-slate-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText = "Working...",
  withMotion = true,
  className,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const [clicked, setClicked] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (withMotion && !isLoading && !disabled) {
      setClicked(true);
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => setClicked(false), 260);
    }

    if (onClick) {
      onClick(event);
    }
  };

  const pressedClass = clicked ? "scale-[0.97]" : "";
  const motionEnabled = withMotion && !disabled && !isLoading;

  return (
    <motion.button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${pressedClass} ${className ?? ""}`.trim()}
      onClick={handleClick}
      disabled={disabled || isLoading}
      whileHover={motionEnabled ? { scale: 1.03 } : undefined}
      whileTap={motionEnabled ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      {isLoading && (
        <span
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      <span>{isLoading ? loadingText : children}</span>
    </motion.button>
  );
}
