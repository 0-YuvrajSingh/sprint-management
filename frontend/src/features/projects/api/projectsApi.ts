import { apiClient } from "@/shared/api/client";
import type { PageableResponse } from "@/shared/types/api";
import type { Project } from "@/features/projects/types";

interface ProjectListParams {
  page: number;
  size: number;
}

export async function listProjects({ page, size }: ProjectListParams) {
  const response = await apiClient.get<PageableResponse<Project>>("/api/v1/projects", {
    params: {
      page,
      size,
      sort: "createdAt,desc",
    },
  });

  return response.data;
}

export async function getProjectById(id: string) {
  const response = await apiClient.get<Project>(`/api/v1/projects/${id}`);
  return response.data;
}
