import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserRole } from "@/features/users/types";
import { useEffect } from "react";

const THEME_MAP: Partial<Record<UserRole, string>> = {
  ADMIN: "theme-admin",
  USER: "theme-user",
  MANAGER: "theme-manager",
  DEVELOPER: "theme-user",
  VIEWER: "theme-user",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    const theme = user?.role ? THEME_MAP[user.role] ?? "theme-user" : "theme-user";
    document.documentElement.className = theme;
  }, [user]);

  return <>{children}</>;
}
