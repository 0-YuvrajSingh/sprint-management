import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { useActivities } from "@/features/activity/hooks/useActivities";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import { useStories } from "@/features/stories/hooks/useStories";
import { useUsers } from "@/features/users/hooks/useUsers";
import { Card } from "@/shared/ui/Card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatCard } from "@/shared/ui/StatCard";
import { motion } from "framer-motion";
import { FolderKanban, ListTodo, TimerReset, Users } from "lucide-react";

export function AdminDashboard() {
  const projectsQuery = useProjects({ page: 0, size: 1 });
  const activeSprintsQuery = useSprints({ page: 0, size: 1, status: "ACTIVE" });
  const storiesQuery = useStories({ page: 0, size: 1 });
  const usersQuery = useUsers({ page: 0, size: 1 });
  const activityQuery = useActivities({ page: 0, size: 6 });

  const isLoading =
    projectsQuery.isLoading ||
    activeSprintsQuery.isLoading ||
    storiesQuery.isLoading ||
    usersQuery.isLoading ||
    activityQuery.isLoading;

  const firstError = [
    projectsQuery.error,
    activeSprintsQuery.error,
    storiesQuery.error,
    usersQuery.error,
    activityQuery.error,
  ].find(Boolean);

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
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={String(projectsQuery.data?.totalElements ?? 0)}
          helper="Tracked across the workspace"
        />
        <StatCard
          icon={TimerReset}
          label="Active sprints"
          value={String(activeSprintsQuery.data?.totalElements ?? 0)}
          helper="Currently moving through delivery"
        />
        <StatCard
          icon={ListTodo}
          label="Total Stories"
          value={String(storiesQuery.data?.totalElements ?? 0)}
          helper="Across all projects"
        />
        <StatCard
          icon={Users}
          label="Active users"
          value={String(usersQuery.data?.totalElements ?? 0)}
          helper="In the last 24 hours"
        />
      </div>
      <Card>
        <Card.Header>
          <Card.Title>Recent Activity</Card.Title>
          <Card.Description>A log of recent events happening across the workspace.</Card.Description>
        </Card.Header>
        <Card.Content>
          <ActivityFeed items={activityQuery.data?.content ?? []} />
        </Card.Content>
      </Card>
    </motion.div>
  );
}
