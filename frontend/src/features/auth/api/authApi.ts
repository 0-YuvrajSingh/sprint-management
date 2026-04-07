import type { AuthResponse, LoginRequest, RegisterRequest } from "@/features/auth/types";
import api from "@/shared/api/api";

export async function loginWithPassword(payload: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function registerWithPassword(payload: RegisterRequest): Promise<void> {
  await api.post("/auth/register", payload);
}

export async function getMe(): Promise<AuthResponse["user"]> {
  const response = await api.get<AuthResponse["user"]>("/users/me");
  return response.data;
}
