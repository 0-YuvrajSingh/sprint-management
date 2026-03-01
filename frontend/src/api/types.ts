export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiErrorResponse {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  timestamp?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt?: string;
  createdDate?: string;
  updatedAt?: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  ownerId: string;
}

export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED";

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  projectId: string;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateSprintRequest {
  name: string;
  goal: string;
  projectId: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
}

export type UserRole = "ADMIN" | "PRODUCT_OWNER" | "SCRUM_MASTER" | "DEVELOPER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdDate?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}
