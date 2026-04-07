import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import type { UserRole } from "../../../types";

export interface SidebarItem {
  to: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  userEmail: string;
  userRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

function AgileTrackMark() {
  return (
    <span className="app-sidebar-logo">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 6.5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 5.5V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function SidebarPanel({
  items,
  userEmail,
  userRole,
  onCloseMobile,
  onLogout,
}: Omit<SidebarProps, "isMobileOpen">) {
  return (
    <div className="app-sidebar-panel">
      <div className="app-sidebar-brand">
        <div className="flex items-center gap-3 rounded-xl">
          <AgileTrackMark />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">AgileTrack</p>
            <h2 className="text-sm font-semibold text-slate-100">Delivery Command</h2>
          </div>
        </div>
      </div>

      <nav className="app-sidebar-nav" aria-label="Primary">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              [
                "app-sidebar-link text-sm font-semibold",
                isActive
                  ? "is-active"
                  : "",
              ]
                .join(" ")
                .trim()
            }
          >
            <motion.span
              className="app-sidebar-link-icon"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {item.icon}
            </motion.span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="app-sidebar-footer">
        <p className="truncate text-sm font-semibold text-slate-100">{userEmail}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-300/75">{userRole}</p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-600/70 bg-slate-900/75 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-indigo-300/45 hover:bg-indigo-500/25"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({
  items,
  userEmail,
  userRole,
  isMobileOpen,
  onCloseMobile,
  onLogout,
}: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 md:block">
        <SidebarPanel
          items={items}
          userEmail={userEmail}
          userRole={userRole}
          onCloseMobile={onCloseMobile}
          onLogout={onLogout}
        />
      </aside>

      <AnimatePresence>
        {isMobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />

            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -28, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <SidebarPanel
                items={items}
                userEmail={userEmail}
                userRole={userRole}
                onCloseMobile={onCloseMobile}
                onLogout={onLogout}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
