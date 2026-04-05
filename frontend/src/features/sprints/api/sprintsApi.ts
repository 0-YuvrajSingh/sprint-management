import { apiClient } from "@/shared/api/client";
import type { PageableResponse } from "@/shared/types/api";
import type { Sprint, SprintStatus } from "@/features/sprints/types";

interface SprintFilters {
  page: number;
  size: number;
  projectId?: string;
  status?: SprintStatus;
}

export async function listSprints(filters: SprintFilters) {
  const response = await apiClient.get<PageableResponse<Sprint>>("/api/v1/sprints", {
    params: {
      page: filters.page,
      size: filters.size,
      sort: "startDate,desc",
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
  });

  return response.data;
}
