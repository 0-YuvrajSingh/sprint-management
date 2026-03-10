import client from "./client";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
} from "../types";

// ================================================================
// USERS API
// Gateway routes these to user-service (port 8083)
// Gateway path: /api/users/** → rewrites to /api/v1/users/**
// ================================================================

const usersApi = {

  // GET /api/users
  // Returns all users — available to all authenticated roles
  // Used to populate user dropdowns in assignment forms
  list: async (): Promise<User[]> => {
    const res = await client.get<User[]>("/api/users");
    return res.data;
  },

  // GET /api/users/:id
  // Returns single user by UUID
  get: async (id: string): Promise<User> => {
    const res = await client.get<User>(`/api/users/${id}`);
    return res.data;
  },

  // POST /api/users
  // Body: { name, email, role }
  // Requires role: ADMIN or MANAGER
  // Note: auth-service also calls this internally on register
  // to sync the user profile — you only need this for admin creates
  create: async (body: CreateUserRequest): Promise<User> => {
    const res = await client.post<User>("/api/users", body);
    return res.data;
  },

  // PATCH /api/users/:id
  // Body: partial — { name?, email? }
  // Requires role: ADMIN or MANAGER
  // Note: does NOT change role — use updateRole() for that
  update: async (id: string, body: UpdateUserRequest): Promise<User> => {
    const res = await client.patch<User>(`/api/users/${id}`, body);
    return res.data;
  },

  // PATCH /api/users/:id/role
  // Body: { role }
  // Separate endpoint from update() — backend enforces ADMIN only
  // Never mix role change with profile update — they have different auth rules
  updateRole: async (id: string, body: UpdateUserRoleRequest): Promise<User> => {
    const res = await client.patch<User>(`/api/users/${id}/role`, body);
    return res.data;
  },

  // DELETE /api/users/:id
  // Requires role: ADMIN only
  // Returns: 204 No Content
  delete: async (id: string): Promise<void> => {
    await client.delete(`/api/users/${id}`);
  },

};

export default usersApi;
