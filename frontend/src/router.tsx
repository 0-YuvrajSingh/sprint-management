import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
// These are imported directly — no lazy loading for now
// Add React.lazy() later if bundle size becomes a concern
import LoginPage     from "./pages/LoginPage";
import ProjectsPage  from "./pages/ProjectsPage";
import SprintsPage   from "./pages/SprintsPage";
import StoriesPage   from "./pages/StoriesPage";
import UsersPage     from "./pages/UsersPage";

// ================================================================
// ROUTER
// Structure:
//   /login          → public, no token needed
//   /               → redirect to /projects
//   /projects       → protected, all roles
//   /sprints        → protected, all roles
//   /stories        → protected, all roles
//   /users          → protected, ADMIN only
// ================================================================

const router = createBrowserRouter([

  // ── Public routes ─────────────────────────────────────────
  {
    path: "/login",
    element: <LoginPage />,
  },

  // ── Root redirect ─────────────────────────────────────────
  // Visiting "/" goes straight to projects
  {
    path: "/",
    element: <Navigate to="/projects" replace />,
  },

  // ── Protected routes — all authenticated users ─────────────
  // ProtectedRoute wraps these — unauthenticated users go to /login
  // <Outlet /> in ProtectedRoute renders whichever child matches
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/projects",
        element: <ProjectsPage />,
      },
      {
        path: "/sprints",
        element: <SprintsPage />,
      },
      {
        path: "/stories",
        element: <StoriesPage />,
      },
    ],
  },

  // ── Protected routes — ADMIN only ─────────────────────────
  // Non-admins who try to access /users get redirected to /projects
  {
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        path: "/users",
        element: <UsersPage />,
      },
    ],
  },

  // ── 404 fallback ──────────────────────────────────────────
  // Any unknown path redirects to projects
  {
    path: "*",
    element: <Navigate to="/projects" replace />,
  },

]);

export default router;
