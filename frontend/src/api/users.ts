import { API_BASE_URLS, apiRequest } from "./client";
import type { CreateUserRequest, PageResponse, User } from "./types";

export async function getUsers(): Promise<User[]> {
  const response = await apiRequest<PageResponse<User>>(API_BASE_URLS.users, "/users");
  return response.content;
}

export async function createUser(request: CreateUserRequest): Promise<User> {
  return apiRequest<User>(API_BASE_URLS.users, "/users", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
