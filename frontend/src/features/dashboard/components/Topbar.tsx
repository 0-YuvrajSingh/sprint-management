import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import type { UserRole } from "../../../types";

interface TopbarProps {
  userEmail: string;
  userRole: UserRole;
  onOpenSidebar: () => void;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/sprints": "Sprints",
  "/stories": "Stories",
  "/users": "Users",
};

function getRouteTitle(pathname: string): string {
  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }

  const [firstSegment] = pathname.split("/").filter(Boolean);
  if (!firstSegment) {
    return "Workspace";
  }

  return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
}

export default function Topbar({ userEmail, userRole, onOpenSidebar }: TopbarProps) {
  const location = useLocation();
  const routeTitle = getRouteTitle(location.pathname);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const userInitial = useMemo(() => {
    const local = userEmail.split("@")[0]?.trim();
    return local && local.length > 0 ? local.charAt(0) : "U";
  }, [userEmail]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [isUserMenuOpen]);

  return (
    <header className="app-topbar">
      <div className="app-topbar__inner">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
          aria-label="Open navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="min-w-0 md:flex-none">
          <p className="app-topbar-pill">Agile workspace</p>
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">{routeTitle}</h1>
        </div>

        <label className="app-topbar-search" htmlFor="app-shell-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 20L16.2 16.2M18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            id="app-shell-search"
            placeholder="Search projects, sprints, stories"
            type="search"
          />
        </label>

        <button type="button" className="app-topbar-action" aria-label="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9.6C6 6.51 8.46 4 11.5 4C14.54 4 17 6.51 17 9.6V12.4L18.35 15.3H4.65L6 12.4V9.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 18C10.32 18.58 10.88 19 11.5 19C12.12 19 12.68 18.58 13 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="app-topbar-action-badge" aria-hidden="true" />
        </button>

        <div className="app-topbar-user" ref={userMenuRef}>
          <button
            type="button"
            className="app-topbar-user-trigger"
            onClick={() => setIsUserMenuOpen((value) => !value)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
          >
            <span className="app-topbar-avatar">{userInitial}</span>
            <span className="hidden text-right md:block">
              <span className="block max-w-[11rem] truncate text-sm font-semibold text-slate-800">{userEmail}</span>
              <span className="block text-[11px] uppercase tracking-[0.12em] text-slate-500">{userRole}</span>
            </span>
          </button>

          <AnimatePresence>
            {isUserMenuOpen ? (
              <motion.div
                className="app-topbar-menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                role="menu"
              >
                <p className="mb-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-500">
                  Signed in as <span className="font-semibold text-slate-700">{userRole}</span>
                </p>
                <button type="button" className="app-topbar-menu-item" role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                  Profile settings
                </button>
                <button type="button" className="app-topbar-menu-item" role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                  Notification preferences
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
