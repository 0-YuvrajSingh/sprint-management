import { AppProviders } from "@/app/providers/AppProviders";
import { appRouter } from "@/app/router";
import { getMe } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { FullPageSpinner } from "@/shared/ui/FullPageSpinner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

export function App() {
  const { isAuthenticated, setUser, logout, accessToken } = useAuthStore();

  const {
    data: user,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!accessToken,
    retry: 1,
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError, logout]);

  if (isLoading && isAuthenticated) {
    return <FullPageSpinner />;
  }

  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  );
}
