import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

// ================================================================
// PROPS
// ================================================================

interface ProtectedRouteProps {
  // Optional — restrict a route to specific roles
  // If not provided, any authenticated user can access
  // Usage: <ProtectedRoute allowedRoles={["ADMIN"]} />
  allowedRoles?: UserRole[];
}

// ================================================================
// PROTECTED ROUTE
// How it works:
//   1. Check if user is logged in via useAuth()
//   2. If not → redirect to /login (replace so back button doesn't loop)
//   3. If logged in but wrong role → redirect to /projects (403-like)
//   4. If logged in and role matches → render the page via <Outlet />
//
// <Outlet /> is react-router's way of saying
// "render whatever child route is matched here"
// ================================================================

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, hasRole } = useAuth();

  // Not logged in → send to login page
  // replace=true means the login page replaces this history entry
  // so pressing back doesn't bring them back to the protected page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not allowed → send to home (safe default)
  // This handles cases like a VIEWER trying to access /users (ADMIN only)
  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed → render the actual page
  return <Outlet />;
}
