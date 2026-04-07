import { Navigate, createBrowserRouter } from "react-router-dom";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ActivityPage } from "@/features/activity/pages/ActivityPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ProjectDetailPage } from "@/features/projects/pages/ProjectDetailPage";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { SprintsPage } from "@/features/sprints/pages/SprintsPage";
import { StoriesPage } from "@/features/stories/pages/StoriesPage";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { AppLayout } from "@/layouts/AppLayout";

export const appRouter = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/projects",
            element: <ProjectsPage />,
          },
          {
            path: "/projects/:id",
            element: <ProjectDetailPage />,
          },
          {
            path: "/sprints",
            element: <SprintsPage />,
          },
          {
            path: "/stories",
            element: <StoriesPage />,
          },
          {
            path: "/users",
            element: <UsersPage />,
          },
          {
            path: "/activity",
            element: <ActivityPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
