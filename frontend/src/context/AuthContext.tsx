import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { tokenStorage } from "../api/client";
import type { AuthResponse, AuthUser, UserRole } from "../types";

// ================================================================
// CONTEXT SHAPE
// Everything a component might need from auth
// ================================================================

interface AuthContextValue {
  // Who is logged in — null means not authenticated
  user: AuthUser | null;

  // Shorthand boolean — use this for ProtectedRoute checks
  isLoggedIn: boolean;

  // Call this after a successful login/register API response
  // Saves token to localStorage + updates user state
  login: (auth: AuthResponse) => void;

  // Call this on logout button click
  // Clears token from localStorage + resets user state to null
  logout: () => void;

  // Role check helper — use this to show/hide buttons
  // Usage: hasRole("ADMIN", "MANAGER") → true if user is either
  hasRole: (...roles: UserRole[]) => boolean;
}

// ================================================================
// CONTEXT
// ================================================================

// null default — the hook below will throw if used outside provider
const AuthContext = createContext<AuthContextValue | null>(null);

// ================================================================
// PROVIDER
// Wrap your entire app with this in main.tsx
// ================================================================

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(() => {
    // Runs once on page load — rehydrate session from localStorage
    // If token exists and is not expired, restore the user
    // If token is missing or expired, start as logged out
    if (!tokenStorage.isValid()) {
      tokenStorage.clear();
      return null;
    }

    const decoded = tokenStorage.decode();
    if (!decoded) return null;

    return {
      email: decoded.sub,
      role:  decoded.role as UserRole,
    };
  });

  // ── Token expiry watcher ────────────────────────────────────
  // Checks every 60 seconds if the token has expired
  // If it has, logs the user out silently
  // The response interceptor in client.ts handles 401s from API calls
  // but this catches expiry between API calls (e.g. user left tab open)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !tokenStorage.isValid()) {
        tokenStorage.clear();
        setUser(null);
        window.location.href = "/login";
      }
    }, 60_000); // every 60 seconds

    return () => clearInterval(interval);
  }, [user]);

  // ── Login ───────────────────────────────────────────────────
  // Called after successful authApi.login() or authApi.register()
  // Saves token to localStorage so client.ts interceptor picks it up
  const login = useCallback((auth: AuthResponse) => {
    tokenStorage.save(auth.token);
    const decoded = tokenStorage.decode();
    if (!decoded) {
      tokenStorage.clear();
      setUser(null);
      throw new Error("Received invalid authentication token.");
    }

    setUser({
      email: decoded.sub,
      role:  decoded.role as UserRole,
    });
  }, []);

  // ── Logout ──────────────────────────────────────────────────
  // Clears everything — TanStack Query cache cleared by router redirect
  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // ── Role check ──────────────────────────────────────────────
  // Usage in components:
  //   const { hasRole } = useAuth()
  //   {hasRole("ADMIN", "MANAGER") && <CreateButton />}
  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// ================================================================
// HOOK
// The only way components should access auth state
// Throws a clear error if used outside <AuthProvider>
// ================================================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be used inside <AuthProvider>. Check main.tsx.");
  }
  return ctx;
}
