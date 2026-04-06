import { useQuery } from "@tanstack/react-query";
import { listActivities } from "@/features/activity/api/activityApi";
import type { ActivityFilters } from "@/features/activity/types";

export function useActivities(filters: ActivityFilters) {
  return useQuery({
    queryKey: ["activities", filters],
    queryFn: () => listActivities(filters),
  });
}
