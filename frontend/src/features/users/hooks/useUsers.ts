import { useQuery } from "@tanstack/react-query";
import { listUsers } from "@/features/users/api/usersApi";

export function useUsers(params: { page: number; size: number }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => listUsers(params),
  });
}
