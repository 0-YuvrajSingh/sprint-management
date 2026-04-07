import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

// Pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SprintsPage = lazy(() => import("./pages/SprintsPage"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));

const routeFallback = (
  <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-slate-500">
    Loading page...
  </div>
);

const withSuspense = (node: ReactNode) => (
  <Suspense fallback={routeFallback}>
    {node}
  </Suspense>
);

// ================================================================
// ROUTER
// Structure:
//   /               → landing page
//   /login          → public auth page
//   /register       → public account creation
//   /dashboard      → protected dashboard
//   /home           → legacy alias, redirects to /dashboard
//   /projects       → protected, all roles
//   /sprints        → protected, all roles
//   /stories        → protected, all roles
//   /users          → protected, ADMIN only
// ================================================================

const router = createBrowserRouter([

  // ── Public routes ─────────────────────────────────────────
  {
    path: "/",
    element: withSuspense(<LandingPage />),
  },
  {
    path: "/login",
    element: withSuspense(<LoginPage />),
  },
  {
    path: "/register",
    element: withSuspense(<RegisterPage />),
  },

  // ── Protected routes — all authenticated users ─────────────
  // ProtectedRoute wraps these — unauthenticated users go to /login
  // App shell renders top navigation and logout actions
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: withSuspense(<DashboardPage />),
          },
          {
            path: "/home",
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "/projects",
            element: withSuspense(<ProjectsPage />),
          },
          {
            path: "/sprints",
            element: withSuspense(<SprintsPage />),
          },
          {
            path: "/stories",
            element: withSuspense(<StoriesPage />),
          },
          {
            element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              {
                path: "/users",
                element: withSuspense(<UsersPage />),
              },
            ],
          },
        ],
      },
    ],
  },

  // ── 404 fallback ──────────────────────────────────────────
  // Any unknown path redirects to landing page
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },

]);

export default router;
