import { useQuery } from "@tanstack/react-query";
import { listSprints } from "@/features/sprints/api/sprintsApi";
import type { SprintStatus } from "@/features/sprints/types";

interface UseSprintsParams {
  page: number;
  size: number;
  projectId?: string;
  status?: SprintStatus;
}

export function useSprints(params: UseSprintsParams) {
  return useQuery({
    queryKey: ["sprints", params],
    queryFn: () => listSprints(params),
  });
}
