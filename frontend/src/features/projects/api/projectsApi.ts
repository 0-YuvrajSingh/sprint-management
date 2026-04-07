import type { Project } from "@/features/projects/types";
import api from "@/shared/api/api";
import type { PageableResponse } from "@/shared/types/api";

interface ProjectListParams {
  page: number;
  size: number;
}

export async function listProjects({ page, size }: ProjectListParams) {
  const response = await api.get<PageableResponse<Project>>("/projects", {
    params: {
      page,
      size,
      sort: "createdAt,desc",
    },
  });

  return response.data;
}

export async function getProjectById(id: string) {
  const response = await api.get<Project>(`/projects/${id}`);
  return response.data;
}
