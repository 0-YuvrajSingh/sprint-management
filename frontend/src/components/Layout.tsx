import { NavLink, Outlet } from "../router";

const navItems = [
  { path: "/projects", label: "Projects" },
  { path: "/sprints", label: "Sprints" },
  { path: "/users", label: "Users" },
];

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Sprint Management Dashboard</h1>
        <p>Simple feature-oriented UI for project, sprint, and user administration.</p>
      </header>

      <nav className="app-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
