import { UserRole } from "@/features/users/types";
import { cn } from "@/shared/lib/cn";
import {
    ActivitySquare,
    CalendarRange,
    FolderKanban,
    LayoutDashboard,
    ListTodo,
    Users,
    X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const allNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"] },
  { to: "/projects", label: "Projects", icon: FolderKanban, roles: ["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"] },
  { to: "/sprints", label: "Sprints", icon: CalendarRange, roles: ["ADMIN", "MANAGER", "DEVELOPER"] },
  { to: "/stories", label: "Stories", icon: ListTodo, roles: ["ADMIN", "MANAGER", "DEVELOPER"] },
  { to: "/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { to: "/activity", label: "Activity", icon: ActivitySquare, roles: ["ADMIN", "MANAGER"] },
];

interface SidebarProps {
  userRole: UserRole;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ userRole, mobileOpen, onClose }: SidebarProps) {
  const navigationItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-4 left-4 z-40 flex w-[280px] flex-col rounded-[32px] border border-white/60 bg-slate-950 p-4 text-white shadow-soft transition-transform duration-300 lg:inset-y-6 lg:left-6 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-2 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">SaaS Delivery</p>
            <h1 className="mt-2 font-display text-2xl font-bold">AgileTrack</h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 flex-1 space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white",
                  isActive && "bg-white/12 text-white shadow-sm",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-200">API Endpoint</p>
          <p className="mt-3 text-sm text-white/85">http://localhost:8080</p>
          <p className="mt-2 text-xs leading-5 text-white/60">
            Requests are routed through the shared gateway with JWT headers injected automatically.
          </p>
        </div>
      </aside>
    </>
  );
}
