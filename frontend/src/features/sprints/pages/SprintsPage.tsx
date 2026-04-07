import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { SprintList } from "@/features/sprints/components/SprintList";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import type { SprintStatus } from "@/features/sprints/types";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTransition } from "@/shared/ui/PageTransition";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { Select } from "@/shared/ui/Select";
import { Card } from "@/shared/ui/Card";

const statusOptions: Array<{ label: string; value: "" | SprintStatus }> = [
  { label: "All statuses", value: "" },
  { label: "Planned", value: "PLANNED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function SprintsPage() {
  const [page, setPage] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState<"" | SprintStatus>("");

  const projectsQuery = useProjects({ page: 0, size: 100 });
  const sprintsQuery = useSprints({
    page,
    size: 8,
    projectId: projectId || undefined,
    status: status || undefined,
  });

  if (projectsQuery.isLoading || sprintsQuery.isLoading) {
    return <LoadingState />;
  }

  const firstError = [projectsQuery.error, sprintsQuery.error].find(Boolean);
  if (firstError) {
    return <ErrorState message={firstError.message} onRetry={() => sprintsQuery.refetch()} />;
  }

  const projects = projectsQuery.data?.content ?? [];
  const sprints = sprintsQuery.data?.content ?? [];

  return (
    <PageTransition>
      <PageHeader
        title="Sprints"
        description="Filter sprint cycles by project and delivery status to understand active work windows."
      />

      <Card className="grid gap-4 md:grid-cols-2">
        <Select
          label="Project"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
            setPage(0);
          }}
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as "" | SprintStatus);
            setPage(0);
          }}
        >
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Card>

      {sprints.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No sprints match the current filters"
          description="Try a broader project or status selection to see available sprint cycles."
        />
      ) : (
        <>
          <SprintList sprints={sprints} projects={projects} />
          {sprintsQuery.data ? (
            <PaginationControls
              page={sprintsQuery.data.number}
              totalPages={sprintsQuery.data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </PageTransition>
  );
}
