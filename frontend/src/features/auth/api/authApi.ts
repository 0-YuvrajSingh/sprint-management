import { apiClient } from "@/shared/api/client";
import type { AuthResponse, LoginRequest } from "@/features/auth/types";

export async function loginWithPassword(payload: LoginRequest) {
  const response = await apiClient.post<AuthResponse>("/api/v1/auth/login", payload);
  return response.data;
}
