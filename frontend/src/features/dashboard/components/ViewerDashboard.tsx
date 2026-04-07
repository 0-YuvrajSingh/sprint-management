import { useProjects } from "@/features/projects/hooks/useProjects";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import { Card } from "@/shared/ui/Card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatCard } from "@/shared/ui/StatCard";
import { motion } from "framer-motion";
import { FolderKanban, TimerReset } from "lucide-react";

export function ViewerDashboard() {
  const projectsQuery = useProjects({ page: 0, size: 1 });
  const sprintsQuery = useSprints({ page: 0, size: 1 });

  const isLoading = projectsQuery.isLoading || sprintsQuery.isLoading;

  const firstError = [projectsQuery.error, sprintsQuery.error].find(Boolean);

  if (isLoading) {
    return <LoadingState />;
  }

  if (firstError) {
    return <ErrorState message={firstError.message} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold tracking-tight">Viewer Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={String(projectsQuery.data?.totalElements ?? 0)}
          helper="Tracked across the workspace"
        />
        <StatCard
          icon={TimerReset}
          label="Total Sprints"
          value={String(sprintsQuery.data?.totalElements ?? 0)}
          helper="Across all projects"
        />
      </div>
      <Card>
        <Card.Header>
          <Card.Title>Project Status</Card.Title>
        </Card.Header>
        <Card.Content>
          <p>Welcome, Viewer. Here you can see the overall project status and timelines.</p>
        </Card.Content>
      </Card>
    </motion.div>
  );
}
