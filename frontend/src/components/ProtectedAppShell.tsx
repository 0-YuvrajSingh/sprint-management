import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ProtectedAppShell.css";

const navItems = [
  { to: "/dashboard", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/sprints", label: "Sprints" },
  { to: "/stories", label: "Stories" },
] as const;

export default function ProtectedAppShell() {
  const navigate = useNavigate();
  const { user, hasRole, logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell-layout">
      <header className="app-shell-header">
        <div className="app-shell-brand" role="button" tabIndex={0} onClick={() => navigate("/dashboard")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              navigate("/dashboard");
            }
          }}
        >
          <span className="app-shell-brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 6.5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M17 5.5V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="app-shell-eyebrow">AgileTrack Workspace</p>
            <h1>Delivery Hub</h1>
          </div>
        </div>

        <div className="app-shell-user">
          <p>{user?.email ?? "unknown@user"}</p>
          <span>{user?.role ?? "GUEST"}</span>
          <button type="button" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <nav className="app-shell-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "app-shell-link app-shell-link-active" : "app-shell-link"
            }
          >
            {item.label}
          </NavLink>
        ))}

        {hasRole("ADMIN") && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive ? "app-shell-link app-shell-link-active" : "app-shell-link"
            }
          >
            Users
          </NavLink>
        )}
      </nav>

      <main className="app-shell-main">
        <Outlet />
      </main>
    </div>
  );
}
