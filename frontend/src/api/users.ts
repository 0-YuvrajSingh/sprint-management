import { apiRequest } from "./client";
import type { CreateUserRequest, PageResponse, User } from "./types";

export async function getUsers(): Promise<User[]> {
  const response = await apiRequest<PageResponse<User>>("/users");
  return response.content;
}

export async function createUser(request: CreateUserRequest): Promise<User> {
  return apiRequest<User>("/users", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
