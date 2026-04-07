import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  panelTitle: string;
  panelDescription: string;
  panelContent?: ReactNode;
  formTitle: string;
  formSubtitle: string;
  children: ReactNode;
  reverseOnDesktop?: boolean;
}

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <div className={`inline-flex ${sizeClass} items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4f46e5,#6366f1_60%,#06b6d4)] text-white shadow-[0_14px_30px_-14px_rgba(79,70,229,0.88)]`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 6.5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 5.5V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function AuthLayout({
  panelTitle,
  panelDescription,
  panelContent,
  formTitle,
  formSubtitle,
  children,
  reverseOnDesktop = false,
}: AuthLayoutProps) {
  const panelInitialX = reverseOnDesktop ? 24 : -24;

  return (
    <motion.div
      className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.14),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(6,182,212,0.14),transparent_28%),#f8faff]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <motion.aside
          className={`relative overflow-hidden bg-[linear-gradient(145deg,#312e81_0%,#1e1b4b_54%,#0f172a_100%)] text-white ${reverseOnDesktop ? "lg:order-2" : "lg:order-1"}`}
          initial={{ opacity: 0, x: panelInitialX }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-indigo-200/15 blur-2xl" />
            <div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-cyan-300/18 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent)]" />
          </div>

          <div className="relative mx-auto flex h-full w-full max-w-xl flex-col justify-center px-6 py-12 sm:px-10 lg:py-16">
            <div className="mb-8 inline-flex items-center gap-3">
              <BrandMark />
              <span className="text-2xl font-semibold tracking-tight text-white">AgileTrack</span>
            </div>

            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{panelTitle}</h2>
            <p className="mt-4 max-w-lg text-lg leading-8 text-indigo-100/95">{panelDescription}</p>

            {panelContent ? (
              <motion.div
                className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: "easeOut", delay: 0.08 }}
              >
                {panelContent}
              </motion.div>
            ) : null}
          </div>
        </motion.aside>

        <section className={`flex items-center justify-center px-4 py-8 sm:px-8 ${reverseOnDesktop ? "lg:order-1" : "lg:order-2"}`}>
          <div className="w-full max-w-md">
            <div className="mb-6 inline-flex items-center gap-3 text-slate-900">
              <BrandMark size="sm" />
              <span className="text-3xl font-semibold tracking-tight">AgileTrack</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{formTitle}</h1>
            <p className="mt-3 text-base text-slate-500">{formSubtitle}</p>

            <div className="mt-7">{children}</div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
