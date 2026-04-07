import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({ children, className, hoverable = false }: CardProps) {
  return (
    <article
      className={[
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        hoverable ? "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" : "",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {children}
    </article>
  );
}
