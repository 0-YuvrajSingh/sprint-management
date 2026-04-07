import type { Story, StoryPatch, StoryStatus } from "@/features/stories/types";
import type { PageableResponse } from "@/shared/types/api";

interface StoryFilters {
  page: number;
  size: number;
  projectId?: string;
  sprintId?: string;
  status?: StoryStatus;
}

export async function listStories(filters: StoryFilters) {
  const response = await apiClient.get<PageableResponse<Story>>("/api/stories", {
    params: {
      page: filters.page,
      size: filters.size,
      sort: "updatedAt,desc",
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.sprintId ? { sprintId: filters.sprintId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
  });

  return response.data;
}

export async function updateStory(id: string, payload: StoryPatch) {
  const response = await apiClient.patch<Story>(`/api/stories/${id}`, payload);
  return response.data;
}
