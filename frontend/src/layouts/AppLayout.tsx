import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar, { type SidebarItem } from "../features/dashboard/components/Sidebar";
import Topbar from "../features/dashboard/components/Topbar";
import type { UserRole } from "../types";
import "./AppLayout.css";

interface LayoutNavItem extends SidebarItem {
  allowedRoles?: UserRole[];
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12.5L12 5L20 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10.5V19H16.5V10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 8.5C3 7.12 4.12 6 5.5 6H10L12 8H18.5C19.88 8 21 9.12 21 10.5V17.5C21 18.88 19.88 20 18.5 20H5.5C4.12 20 3 18.88 3 17.5V8.5Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SprintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 6H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 12H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 18H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function StoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 14H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 17C4.5 14.51 6.51 12.5 9 12.5C11.49 12.5 13.5 14.51 13.5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 17C15 15.34 16.34 14 18 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const navItems: LayoutNavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
  { to: "/projects", label: "Projects", icon: <FolderIcon /> },
  { to: "/sprints", label: "Sprints", icon: <SprintIcon /> },
  { to: "/stories", label: "Stories", icon: <StoryIcon /> },
  { to: "/users", label: "Users", icon: <UsersIcon />, allowedRoles: ["ADMIN"] },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasRole, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const visibleItems = useMemo(
    () => navItems.filter((item) => !item.allowedRoles || hasRole(...item.allowedRoles)),
    [hasRole]
  );

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userRole: UserRole = user?.role ?? "VIEWER";
  const userEmail = user?.email ?? "unknown@user";

  return (
    <div className="app-shell">
      <div className="app-shell__atmosphere" aria-hidden="true" />

      <Sidebar
        items={visibleItems}
        userEmail={userEmail}
        userRole={userRole}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onLogout={onLogout}
      />

      <div className="app-shell__content md:pl-72">
        <Topbar
          userEmail={userEmail}
          userRole={userRole}
          onOpenSidebar={() => setIsMobileOpen(true)}
        />

        <main className="app-shell__main">
          <div className="app-shell__inner">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${location.pathname}${location.search}`}
                initial={{ opacity: 0, y: 12, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="app-shell__page"
              >
                <Outlet context={{}} />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
