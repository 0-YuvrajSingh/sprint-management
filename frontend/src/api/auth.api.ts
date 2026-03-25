import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";
import client from "./client";

// ================================================================
// AUTH API
// Gateway routes these to auth-service (port 8081)
// These are the ONLY public endpoints — no JWT needed
// ================================================================

const authApi = {

  // POST /auth/login
  // Body: { email, password }
  // Returns: { token }
  // On success → save token via tokenStorage.save() in AuthContext
  login: async (body: LoginRequest): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>("/auth/login", body);
    return res.data;
  },

  // POST /auth/register
  // Body: { name, email, password }
  // Returns: 201 Created with empty body
  // Registers user in auth-service AND syncs profile to user-service
  register: async (body: RegisterRequest): Promise<void> => {
    await client.post("/auth/register", body);
  },

};

export default authApi;
