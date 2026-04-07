import type { User } from "@/features/users/types";
import api from "@/shared/api/api";
import type { PageableResponse } from "@/shared/types/api";

interface UserFilters {
  page: number;
  size: number;
}

export async function listUsers({ page, size }: UserFilters) {
  const response = await api.get<PageableResponse<User>>("/users", {
    params: {
      page,
      size,
      sort: "createdDate,desc",
    },
  });

  return response.data;
}
