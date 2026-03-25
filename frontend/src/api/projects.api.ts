import type {
    CreateProjectRequest,
    PageResponse,
    Project,
    UpdateProjectRequest,
} from "../types";
import client from "./client";

// ================================================================
// PROJECTS API
// Gateway routes these to project-service (port 8082)
// Gateway path: /api/projects/** → rewrites to /api/v1/projects/**
// ================================================================

const projectsApi = {

  // GET /api/projects
  // Returns paginated projects — available to all authenticated roles
  list: async (): Promise<PageResponse<Project>> => {
    const res = await client.get<PageResponse<Project>>("/api/projects");
    return res.data;
  },

  // GET /api/projects/:id
  // Returns single project by UUID
  get: async (id: string): Promise<Project> => {
    const res = await client.get<Project>(`/api/projects/${id}`);
    return res.data;
  },

  // POST /api/projects
  // Body: { name, description }
  // Requires role: ADMIN or MANAGER
  // Returns: created project with generated id and createdAt
  create: async (body: CreateProjectRequest): Promise<Project> => {
    const res = await client.post<Project>("/api/projects", body);
    return res.data;
  },

  // PATCH /api/projects/:id
  // Body: partial — send only fields you want to change
  // Requires role: ADMIN or MANAGER
  // Returns: updated project
  update: async (id: string, body: UpdateProjectRequest): Promise<Project> => {
    const res = await client.patch<Project>(`/api/projects/${id}`, body);
    return res.data;
  },

  // DELETE /api/projects/:id
  // Requires role: ADMIN only
  // Returns: 204 No Content (no body)
  delete: async (id: string): Promise<void> => {
    await client.delete(`/api/projects/${id}`);
  },

};

export default projectsApi;
