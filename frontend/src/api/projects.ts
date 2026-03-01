import { apiRequest } from "./client";
import type { CreateProjectRequest, PageResponse, Project } from "./types";

export async function getProjects(): Promise<Project[]> {
  const response = await apiRequest<PageResponse<Project>>("/projects");
  return response.content;
}

export async function createProject(request: CreateProjectRequest): Promise<Project> {
  return apiRequest<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
