import { LogOut, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatDateOnly, formatEnumLabel } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";

const titleMap: Record<string, string> = {
  dashboard: "Delivery overview",
  projects: "Project workspace",
  sprints: "Sprint planning",
  stories: "Story execution board",
  users: "Team directory",
  activity: "Activity ledger",
};

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const segment = location.pathname.split("/")[1] || "dashboard";
  const heading = titleMap[segment] ?? "AgileTrack";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-canvas/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="rounded-2xl border border-white/70 bg-white/85 p-3 text-slate-700 shadow-sm transition hover:text-brand-700 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{heading}</p>
            <p className="truncate text-xs text-slate-500">Today, {formatDateOnly(new Date())}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-[24px] border border-white/70 bg-white/85 px-4 py-2 shadow-sm sm:flex">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-600 text-sm font-bold text-white">
              {user?.initials ?? "AT"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user?.email ?? "Authenticated user"}</p>
              <div className="mt-1">
                <Badge variant="brand">{formatEnumLabel(user?.role ?? "VIEWER")}</Badge>
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
