import { useAuth } from "@/features/auth/hooks/useAuth";
import { Sidebar } from "@/layouts/Sidebar";
// ... existing code ...
export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
// ... existing code ...
  if (!user) {
    // Or a loading spinner
    return null;
  }

  return (
    <div className="min-h-screen bg-hero-grid">
      <Sidebar userRole={user.role} mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="lg:pl-[320px]">
        <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />
// ... existing code ...
}
