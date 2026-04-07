import { useAuth } from "@/features/auth/hooks/useAuth";
import { AdminDashboard } from "@/features/dashboard/components/AdminDashboard";
import { DeveloperDashboard } from "@/features/dashboard/components/DeveloperDashboard";
import { ManagerDashboard } from "@/features/dashboard/components/ManagerDashboard";
import { ViewerDashboard } from "@/features/dashboard/components/ViewerDashboard";
import { FullPageSpinner } from "@/shared/ui/FullPageSpinner";
import { PageTransition } from "@/shared/ui/PageTransition";

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    // This should ideally not be reached if the page is behind a ProtectedRoute,
    // but it's a good safeguard.
    return <FullPageSpinner />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "ADMIN":
        return <AdminDashboard />;
      case "MANAGER":
        return <ManagerDashboard />;
      case "DEVELOPER":
        return <DeveloperDashboard />;
      case "VIEWER":
        return <ViewerDashboard />;
      // The "USER" role from the old system can be mapped to a default dashboard.
      case "USER":
      default:
        return <ViewerDashboard />;
    }
  };

  return <PageTransition>{renderDashboard()}</PageTransition>;
}
