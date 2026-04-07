import { User } from "@/features/users/types";
import { authStorage } from "@/shared/lib/auth-storage";
import create from "zustand";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: authStorage.getToken(),
  user: null,
  isAuthenticated: !!authStorage.getToken(),
  login: (token, user) => {
    authStorage.setToken(token);
    set({ accessToken: token, user, isAuthenticated: true });
  },
  logout: () => {
    authStorage.clearToken();
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
  setAccessToken: (token) => {
    authStorage.setToken(token);
    set({ accessToken: token, isAuthenticated: true });
  },
  setUser: (user) => set({ user }),
}));
