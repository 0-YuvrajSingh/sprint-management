import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

const tiles = [
  {
    title: "Projects",
    description: "Create, search, and manage project scope.",
    to: "/projects",
  },
  {
    title: "Sprints",
    description: "Plan sprint windows and track progress states.",
    to: "/sprints",
  },
  {
    title: "Stories",
    description: "Move stories through the delivery workflow.",
    to: "/stories",
  },
] as const;

export default function HomePage() {
  const { user, hasRole } = useAuth();

  return (
    <section className="home-page">
      <header className="home-hero">
        <p className="home-kicker">Workspace overview</p>
        <h2>Welcome {user?.email?.split("@")[0] ?? "back"}</h2>
        <p>
          Use the dashboard to jump into planning, execution, and team coordination.
        </p>
      </header>

      <div className="home-grid" aria-label="Navigation shortcuts">
        {tiles.map((tile) => (
          <article key={tile.to} className="home-tile">
            <h3>{tile.title}</h3>
            <p>{tile.description}</p>
            <Link to={tile.to}>Open {tile.title}</Link>
          </article>
        ))}

        {hasRole("ADMIN") && (
          <article className="home-tile">
            <h3>Users</h3>
            <p>Manage workspace roles and user access control.</p>
            <Link to="/users">Open Users</Link>
          </article>
        )}
      </div>
    </section>
  );
}
