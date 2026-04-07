import type { Sprint, SprintStatus } from "@/features/sprints/types";
import api from "@/shared/api/api";
import type { PageableResponse } from "@/shared/types/api";

interface SprintFilters {
  page: number;
  size: number;
  projectId?: string;
  status?: SprintStatus;
}

export async function listSprints(filters: SprintFilters) {
  const response = await api.get<PageableResponse<Sprint>>("/sprints", {
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
