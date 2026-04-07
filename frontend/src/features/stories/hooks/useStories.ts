import { useQuery } from "@tanstack/react-query";
import { listStories } from "@/features/stories/api/storiesApi";
import type { StoryStatus } from "@/features/stories/types";

interface UseStoriesParams {
  page: number;
  size: number;
  projectId?: string;
  sprintId?: string;
  status?: StoryStatus;
}

export function useStories(params: UseStoriesParams) {
  return useQuery({
    queryKey: ["stories", params],
    queryFn: () => listStories(params),
  });
}
