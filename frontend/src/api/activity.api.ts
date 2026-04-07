import type { Activity, PageResponse, TargetType } from "../types";
import client from "./client";

interface ActivityFilters {
  userEmail?: string;
  targetType?: TargetType;
  targetId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

type ActivityApiResponse = PageResponse<Activity> | Activity[];

const toActivityList = (response: ActivityApiResponse): Activity[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.content;
};

const activityApi = {
  list: async (filters?: ActivityFilters): Promise<Activity[]> => {
    const params = new URLSearchParams();

    if (filters?.userEmail) {
      params.set("userEmail", filters.userEmail);
    }

    if (filters?.targetType) {
      params.set("targetType", filters.targetType);
    }

    if (filters?.targetId) {
      params.set("targetId", filters.targetId);
    }

    if (filters?.page != null) {
      params.set("page", String(filters.page));
    }

    if (filters?.size != null) {
      params.set("size", String(filters.size));
    }

    if (filters?.sort) {
      params.set("sort", filters.sort);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await client.get<ActivityApiResponse>(`/api/activities${query}`);

    return toActivityList(response.data);
  },

  listRecent: async (size = 12): Promise<Activity[]> => {
    return activityApi.list({ page: 0, size, sort: "timestamp,desc" });
  },
};

export default activityApi;
