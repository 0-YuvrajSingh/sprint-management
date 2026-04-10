import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    buildUserFromAccessToken,
    isTokenExpired,
    loginRequest,
    logoutRequest,
    refreshRequest,
    registerRequest,
} from '../services/authApi';
import { Role, User } from '../types';

const ACCESS_TOKEN_KEY = 'agiletrack_access_token';
const REFRESH_TOKEN_KEY = 'agiletrack_refresh_token';
const USER_KEY = 'agiletrack_user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: Role) => Promise<void>;
  logout: () => void;
  hasRole: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const persistSession = (accessToken: string, refreshToken: string, sessionUser: User) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const clearSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const cachedUserRaw = localStorage.getItem(USER_KEY);
      const cachedUser = cachedUserRaw ? (JSON.parse(cachedUserRaw) as Partial<User>) : undefined;

      if (!accessToken || !refreshToken) {
        clearSession();
        if (mounted) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        if (!isTokenExpired(accessToken)) {
          const sessionUser = buildUserFromAccessToken(accessToken, cachedUser);
          if (mounted) {
            persistSession(accessToken, refreshToken, sessionUser);
            setIsInitializing(false);
          }
          return;
        }

        const refreshed = await refreshRequest(refreshToken);
        const sessionUser = buildUserFromAccessToken(refreshed.accessToken, cachedUser);
        if (mounted) {
          persistSession(refreshed.accessToken, refreshed.refreshToken, sessionUser);
        }
      } catch {
        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const session = await loginRequest(email, password);
    const cachedUserRaw = localStorage.getItem(USER_KEY);
    const cachedUser = cachedUserRaw ? (JSON.parse(cachedUserRaw) as Partial<User>) : undefined;
    const sessionUser = buildUserFromAccessToken(session.accessToken, cachedUser);
    persistSession(session.accessToken, session.refreshToken, sessionUser);
  };

  const register = async (name: string, email: string, password: string, role: Role = 'DEVELOPER') => {
    await registerRequest(name, email, password);

    // The backend assigns role server-side; role argument is kept for compatibility.
    void role;

    const session = await loginRequest(email, password);
    const sessionUser = buildUserFromAccessToken(session.accessToken, { name, email });
    persistSession(session.accessToken, session.refreshToken, sessionUser);
  };

  const logout = () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (accessToken && refreshToken) {
      void logoutRequest(accessToken, refreshToken).catch(() => {
        // Best-effort backend logout. Local session is always cleared.
      });
    }

    clearSession();
  };

  const hasRole = (allowedRoles: Role[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
