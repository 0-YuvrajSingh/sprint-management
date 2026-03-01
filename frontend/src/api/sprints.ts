import { API_BASE_URLS, apiRequest } from "./client";
import type { CreateSprintRequest, PageResponse, Sprint } from "./types";

export async function getSprints(): Promise<Sprint[]> {
  const response = await apiRequest<PageResponse<Sprint>>(API_BASE_URLS.sprints, "/sprints");
  return response.content;
}

export async function createSprint(request: CreateSprintRequest): Promise<Sprint> {
  return apiRequest<Sprint>(API_BASE_URLS.sprints, "/sprints", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
