import client from "./client";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types";

// ================================================================
// AUTH API
// Gateway routes these to auth-service (port 8081)
// These are the ONLY public endpoints — no JWT needed
// ================================================================

const authApi = {

  // POST /auth/login
  // Body: { email, password }
  // Returns: { token, email, role }
  // On success → save token via tokenStorage.save() in AuthContext
  login: async (body: LoginRequest): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>("/auth/login", body);
    return res.data;
  },

  // POST /auth/register
  // Body: { email, password, role }
  // Returns: { token, email, role }
  // Registers user in auth-service AND syncs profile to user-service
  register: async (body: RegisterRequest): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>("/auth/register", body);
    return res.data;
  },

};

export default authApi;
