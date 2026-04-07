import { useQuery } from "@tanstack/react-query";
import { getProjectById, listProjects } from "@/features/projects/api/projectsApi";

export function useProjects(params: { page: number; size: number }) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => listProjects(params),
  });
}

export function useProject(id?: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id!),
    enabled: Boolean(id),
  });
}
