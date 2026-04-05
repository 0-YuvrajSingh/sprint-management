import { createContext, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { clearStoredToken, getStoredToken, isTokenExpired, storeToken, toAuthUser, type AuthUser } from "@/shared/lib/auth-storage";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialAuthState() {
  const token = getStoredToken();
  if (!token || isTokenExpired(token)) {
    clearStoredToken();
    return { token: null, user: null };
  }

  return {
    token,
    user: toAuthUser(token),
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(getInitialAuthState);

  useEffect(() => {
    const handleStorage = () => {
      setState(getInitialAuthState());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = (token: string) => {
    storeToken(token);
    setState({
      token,
      user: toAuthUser(token),
    });
  };

  const logout = () => {
    clearStoredToken();
    setState({
      token: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        user: state.user,
        isAuthenticated: Boolean(state.token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
