import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import router from "./router";
import "./index.css";

// ================================================================
// TANSTACK QUERY CLIENT
// Global configuration for all useQuery / useMutation calls
// ================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh before refetching
      // 5 minutes — good default for sprint/project data that
      // doesn't change every second
      staleTime: 5 * 60 * 1000,

      // How many times to retry a failed request before showing error
      // 1 retry is enough — if it fails twice something is genuinely wrong
      retry: 1,

      // Show stale data while refetching in background
      // Better UX than showing a loading spinner on every revisit
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Don't retry mutations — if a POST/PATCH/DELETE fails once,
      // retrying automatically could cause duplicate data
      retry: 0,
    },
  },
});

// ================================================================
// PROVIDER ORDER — must be exactly this order:
//
// QueryClientProvider — outermost, makes useQuery available everywhere
//   AuthProvider      — reads localStorage once on mount, sets user state
//     RouterProvider  — needs auth state to run ProtectedRoute checks
//
// If you swap AuthProvider and RouterProvider, ProtectedRoute will
// run before AuthProvider is ready and always redirect to /login
// ================================================================

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
