import type { ActivityEntry, ActivityFilters } from "@/features/activity/types";
import { apiClient } from "@/shared/api/client";
import type { PageableResponse } from "@/shared/types/api";

function normalizeActivityResponse(data: PageableResponse<ActivityEntry> | ActivityEntry[]): PageableResponse<ActivityEntry> {
  if (Array.isArray(data)) {
    return {
      content: data,
      totalPages: 1,
      totalElements: data.length,
      number: 0,
      size: data.length,
      first: true,
      last: true,
      empty: data.length === 0,
      numberOfElements: data.length,
    };
  }

  return data;
}

export async function listActivities(filters: ActivityFilters) {
  const response = await apiClient.get<PageableResponse<ActivityEntry> | ActivityEntry[]>("/api/activities", {
    params: {
      page: filters.page ?? 0,
      size: filters.size ?? 12,
      sort: "timestamp,desc",
      ...(filters.userEmail ? { userEmail: filters.userEmail } : {}),
      ...(filters.targetType ? { targetType: filters.targetType } : {}),
      ...(filters.targetId ? { targetId: filters.targetId } : {}),
    },
  });

  return normalizeActivityResponse(response.data);
}
