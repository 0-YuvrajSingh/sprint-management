import type { AuthResponse, LoginRequest, RegisterRequest } from "@/features/auth/types";
import { apiClient } from "@/shared/api/client";

export async function loginWithPassword(payload: LoginRequest) {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function registerWithPassword(payload: RegisterRequest) {
  await apiClient.post("/auth/register", payload);
}
