import type {
    AssignStoryRequest,
    CreateStoryRequest,
    PageResponse,
    Story,
    StoryAssignment,
    StoryStatus,
    UpdateProgressRequest,
    UpdateStoryRequest,
} from "../types";
import client from "./client";

// ================================================================
// STORIES API
// Gateway routes these to stories-service (port 8086)
// Gateway path: /api/stories/** → rewrites to /api/v1/stories/**
// ================================================================

// Filter options for story list endpoint
interface StoryFilters {
  sprintId?: string;
  projectId?: string;
  status?: StoryStatus;
}

const storiesApi = {

  // ── Stories CRUD ───────────────────────────────────────────

  // GET /api/stories?sprintId=X&projectId=Y&status=Z
  // Most common usage: list({ sprintId: "abc-123" }) to get stories for a sprint
  // Returns: paginated Spring Page object
  list: async (filters?: StoryFilters): Promise<PageResponse<Story>> => {
    const params = new URLSearchParams();
    if (filters?.sprintId)   params.set("sprintId",   filters.sprintId);
    if (filters?.projectId)  params.set("projectId",  filters.projectId);
    if (filters?.status)     params.set("status",     filters.status);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await client.get<PageResponse<Story>>(`/api/stories${query}`);
    return res.data;
  },

  // GET /api/stories/:id
  get: async (id: string): Promise<Story> => {
    const res = await client.get<Story>(`/api/stories/${id}`);
    return res.data;
  },

  // POST /api/stories
  // Body: { title, description, priority, storyPoints, projectId, sprintId }
  // Requires role: MANAGER or ADMIN
  create: async (body: CreateStoryRequest): Promise<Story> => {
    const res = await client.post<Story>("/api/stories", body);
    return res.data;
  },

  // PATCH /api/stories/:id
  // Body: partial — most common use: { status: "IN_PROGRESS" } for kanban drag
  // Requires role: DEVELOPER and above
  update: async (id: string, body: UpdateStoryRequest): Promise<Story> => {
    const res = await client.patch<Story>(`/api/stories/${id}`, body);
    return res.data;
  },

  // DELETE /api/stories/:id
  // Requires role: ADMIN or MANAGER
  // Returns: 204 No Content
  delete: async (id: string): Promise<void> => {
    await client.delete(`/api/stories/${id}`);
  },

  // ── Assignments ────────────────────────────────────────────
  // Nested under stories — one story can have multiple assignees

  // GET /api/stories/:id/assignments
  // Returns all user assignments for a story
  getAssignments: async (storyId: string): Promise<StoryAssignment[]> => {
    const res = await client.get<StoryAssignment[]>(
      `/api/stories/${storyId}/assignments`
    );
    return res.data;
  },

  // POST /api/stories/:id/assignments
  // Body: { userId, skill, pointsAssigned }
  // Assigns a user to a story with their skill and point allocation
  // Requires role: MANAGER or ADMIN
  assign: async (
    storyId: string,
    body: AssignStoryRequest
  ): Promise<StoryAssignment> => {
    const res = await client.post<StoryAssignment>(
      `/api/stories/${storyId}/assignments`,
      body
    );
    return res.data;
  },

  // PATCH /api/stories/:id/progress
  // Body: { userId, pointsCompleted }
  // Updates how many points a specific user has completed on this story
  // Updates the existing assignment row — does NOT create a new one
  // Requires role: DEVELOPER and above
  updateProgress: async (
    storyId: string,
    body: UpdateProgressRequest
  ): Promise<StoryAssignment> => {
    const res = await client.patch<StoryAssignment>(
      `/api/stories/${storyId}/progress`,
      body
    );
    return res.data;
  },

};

export default storiesApi;
