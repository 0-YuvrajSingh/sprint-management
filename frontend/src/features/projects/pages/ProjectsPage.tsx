import { useState } from "react";
import { FolderKanban } from "lucide-react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import { useStories } from "@/features/stories/hooks/useStories";
import { useUsers } from "@/features/users/hooks/useUsers";
import { deriveProjectInsight } from "@/features/projects/lib/projectInsights";
import { ProjectsTable } from "@/features/projects/components/ProjectsTable";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTransition } from "@/shared/ui/PageTransition";
import { PaginationControls } from "@/shared/ui/PaginationControls";

export function ProjectsPage() {
  const [page, setPage] = useState(0);
  const projectsQuery = useProjects({ page, size: 8 });
  const storiesQuery = useStories({ page: 0, size: 300 });
  const sprintsQuery = useSprints({ page: 0, size: 200 });
  const usersQuery = useUsers({ page: 0, size: 200 });

  const isLoading =
    projectsQuery.isLoading ||
    storiesQuery.isLoading ||
    sprintsQuery.isLoading ||
    usersQuery.isLoading;

  const firstError = [projectsQuery.error, storiesQuery.error, sprintsQuery.error, usersQuery.error].find(Boolean);

  if (isLoading) {
    return <LoadingState />;
  }

  if (firstError) {
    return <ErrorState message={firstError.message} onRetry={() => projectsQuery.refetch()} />;
  }

  const projects = projectsQuery.data?.content ?? [];
  const rows = projects.map((project) => ({
    ...project,
    ...deriveProjectInsight(project, storiesQuery.data?.content ?? [], sprintsQuery.data?.content ?? [], usersQuery.data?.content ?? []),
  }));

  return (
    <PageTransition>
      <PageHeader
        title="Projects"
        description="Track project health across sprint activity, story throughput, and team ownership."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Projects on the current page</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{projects.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Projects on track</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">
            {rows.filter((row) => row.health === "ON_TRACK").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Projects at risk</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">
            {rows.filter((row) => row.health === "AT_RISK").length}
          </p>
        </Card>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Once the backend returns projects, they will appear here with derived owner and health context."
        />
      ) : (
        <>
          <ProjectsTable rows={rows} />
          {projectsQuery.data ? (
            <PaginationControls
              page={projectsQuery.data.number}
              totalPages={projectsQuery.data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </PageTransition>
  );
}
