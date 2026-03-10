import client from "./client";
import type {
  Sprint,
  CreateSprintRequest,
  UpdateSprintRequest,
  SprintStatus,
  PageResponse,
} from "../types";

// ================================================================
// SPRINTS API
// Gateway routes these to sprint-service (port 8084)
// Gateway path: /api/sprints/** → rewrites to /api/v1/sprints/**
// ================================================================

// Filter options for the list endpoint
// All optional — pass only what you need to filter by
interface SprintFilters {
  projectId?: string;
  status?: SprintStatus;
  page?: number;
  size?: number;
}

const sprintsApi = {

  // GET /api/sprints?projectId=X&status=Y&page=0&size=10
  // All params are optional — omitting them returns all sprints
  // Returns: paginated Spring Page object
  // Most common usage: list({ projectId: "abc-123" }) to get sprints for a project
  list: async (filters?: SprintFilters): Promise<PageResponse<Sprint>> => {
    // Build query string from only the filters that were provided
    // URLSearchParams handles encoding automatically
    const params = new URLSearchParams();
    if (filters?.projectId) params.set("projectId", filters.projectId);
    if (filters?.status)    params.set("status",    filters.status);
    if (filters?.page != null) params.set("page",   String(filters.page));
    if (filters?.size != null) params.set("size",   String(filters.size));

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await client.get<PageResponse<Sprint>>(`/api/sprints${query}`);
    return res.data;
  },

  // GET /api/sprints/:id
  // Returns single sprint by UUID
  get: async (id: string): Promise<Sprint> => {
    const res = await client.get<Sprint>(`/api/sprints/${id}`);
    return res.data;
  },

  // POST /api/sprints
  // Body: { name, startDate, endDate, projectId }
  // Requires role: ADMIN or MANAGER
  // Note: backend validates endDate > startDate via @PrePersist
  // Returns: created sprint
  create: async (body: CreateSprintRequest): Promise<Sprint> => {
    const res = await client.post<Sprint>("/api/sprints", body);
    return res.data;
  },

  // PATCH /api/sprints/:id
  // Body: partial — send only fields you want to change
  // Note: sprint-service has optimistic locking (@Version)
  // If two users update simultaneously, one gets 409 Conflict
  // Requires role: ADMIN or MANAGER
  update: async (id: string, body: UpdateSprintRequest): Promise<Sprint> => {
    const res = await client.patch<Sprint>(`/api/sprints/${id}`, body);
    return res.data;
  },

  // DELETE /api/sprints/:id
  // Requires role: ADMIN only
  // Returns: 204 No Content
  delete: async (id: string): Promise<void> => {
    await client.delete(`/api/sprints/${id}`);
  },

};

export default sprintsApi;
