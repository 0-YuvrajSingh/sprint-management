import { useAuthStore } from "@/features/auth/hooks/useAuthStore";

export function useAuth() {
  return useAuthStore();
}
