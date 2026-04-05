import { apiClient } from "@/shared/api/client";
import type { PageableResponse } from "@/shared/types/api";
import type { User } from "@/features/users/types";

interface UserFilters {
  page: number;
  size: number;
}

export async function listUsers({ page, size }: UserFilters) {
  const response = await apiClient.get<PageableResponse<User>>("/api/v1/users", {
    params: {
      page,
      size,
      sort: "createdDate,desc",
    },
  });

  return response.data;
}
