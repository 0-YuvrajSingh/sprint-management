import { ActivityPage } from "@/features/activity/pages/ActivityPage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";
import { RoleProtectedRoute } from "@/features/auth/components/RoleProtectedRoute";
import { HomePage } from "@/features/auth/pages/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { UnauthorizedPage } from "@/features/auth/pages/UnauthorizedPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ProjectDetailPage } from "@/features/projects/pages/ProjectDetailPage";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { SprintsPage } from "@/features/sprints/pages/SprintsPage";
import { StoriesPage } from "@/features/stories/pages/StoriesPage";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { AppLayout } from "@/layouts/AppLayout";
import { Navigate, createBrowserRouter } from "react-router-dom";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
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
            element: <RoleProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
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
    ],
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
