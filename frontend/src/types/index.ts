// ================================================================
// ENUMS
// Must match backend exactly — case sensitive
// ================================================================

export type UserRole = "ADMIN" | "MANAGER" | "DEVELOPER" | "VIEWER";

export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type StoryStatus = "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type StoryPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ActionType =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "COMMENTED";

export type TargetType =
  | "PROJECT"
  | "SPRINT"
  | "STORY"
  | "ASSIGNMENT"
  | "COMMENT";

// ================================================================
// AUTH
// Matches: POST /auth/login and POST /auth/register
// ================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// What auth-service returns on login/register
export interface AuthResponse {
  token: string;   // JWT — store this in localStorage
}

// What we decode from the JWT and store in AuthContext
export interface AuthUser {
  email: string;
  role: UserRole;
}

// ================================================================
// USER
// Matches: user-service entity
// ================================================================

export interface User {
  id: string;          // UUID
  name: string;
  email: string;
  role: UserRole;
  createdDate: string; // ISO date string e.g. "2026-03-09T10:00:00"
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

// ================================================================
// PROJECT
// Matches: project-service entity
// NOTE: no ownerId — that field does NOT exist in the backend
// ================================================================

export interface Project {
  id: string;          // UUID
  name: string;
  description: string;
  createdAt: string;   // ISO date string
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  // DO NOT add ownerId here — backend rejects it
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

// ================================================================
// SPRINT
// Matches: sprint-service entity
// NOTE: no `goal` field — does not exist in backend entity yet
// ================================================================

export interface Sprint {
  id: string;          // UUID
  name: string;
  startDate: string;   // ISO date string
  endDate: string;     // ISO date string
  status: SprintStatus;
  velocity?: number;
  projectId: string;   // UUID reference to project
}

export interface CreateSprintRequest {
  name: string;
  startDate: string;   // format: "YYYY-MM-DD"
  endDate: string;     // format: "YYYY-MM-DD"
  projectId: string;
}

export interface UpdateSprintRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: SprintStatus;
  velocity?: number;
}

// ================================================================
// STORY
// Matches: stories-service Story entity
// ================================================================

export interface Story {
  id: string;           // UUID
  title: string;
  description?: string;
  status: StoryStatus;
  priority: StoryPriority;
  storyPoints?: number;
  projectId: string;
  sprintId: string;
  assigneeEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoryRequest {
  title: string;
  description?: string;
  priority: StoryPriority;
  storyPoints?: number;
  projectId: string;
  sprintId: string;
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
  status?: StoryStatus;
  priority?: StoryPriority;
  storyPoints?: number;
  assigneeEmail?: string;
}

// ================================================================
// STORY ASSIGNMENT
// Matches: stories-service StoryAssignment entity
// ================================================================

export interface StoryAssignment {
  id: string;           // UUID
  storyId: string;
  userId: string;
  skill: string;
  pointsAssigned: number;
  pointsCompleted: number;
}

export interface AssignStoryRequest {
  userId: string;
  skill: string;
  pointsAssigned: number;
}

export interface UpdateProgressRequest {
  userId: string;
  pointsCompleted: number;
}

// ================================================================
// ACTIVITY (audit log)
// Matches: activity-service Activity entity
// ================================================================

export interface Activity {
  id: number;
  userEmail: string;
  actionType: ActionType;
  targetType: TargetType;
  targetId: string;
  description: string;
  timestamp: string;
}

// ================================================================
// GENERIC API WRAPPERS
// Used for paginated responses from backend
// ================================================================

// When backend returns a Spring Page object
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-indexed)
}

// Canonical backend error envelope
export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  code?: string;
  fieldErrors?: ApiFieldError[];
  traceId?: string;
}
