import { API_BASE_URLS, apiRequest } from "./client";
import type { CreateProjectRequest, PageResponse, Project } from "./types";

export async function getProjects(): Promise<Project[]> {
  const response = await apiRequest<PageResponse<Project>>(API_BASE_URLS.projects, "/projects");
  return response.content;
}

export async function createProject(request: CreateProjectRequest): Promise<Project> {
  return apiRequest<Project>(API_BASE_URLS.projects, "/projects", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
