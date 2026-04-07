import { SprintVelocityChart } from "@/features/sprints/components/SprintVelocityChart";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import { useStories } from "@/features/stories/hooks/useStories";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatCard } from "@/shared/ui/StatCard";
import { motion } from "framer-motion";
import { ListTodo, TimerReset } from "lucide-react";

export function ManagerDashboard() {
  const activeSprintsQuery = useSprints({ page: 0, size: 50, status: "ACTIVE" });
  const storiesQuery = useStories({ page: 0, size: 200 });

  const isLoading = activeSprintsQuery.isLoading || storiesQuery.isLoading;

  const firstError = [activeSprintsQuery.error, storiesQuery.error].find(Boolean);

  if (isLoading) {
    return <LoadingState />;
  }

  if (firstError) {
    return <ErrorState message={firstError.message} />;
  }

  const inProgressStories =
    storiesQuery.data?.content.filter((story) => story.status === "IN_PROGRESS" || story.status === "IN_REVIEW")
      .length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={TimerReset}
          label="Active sprints"
          value={String(activeSprintsQuery.data?.totalElements ?? 0)}
          helper="Currently moving through delivery"
        />
        <StatCard
          icon={ListTodo}
          label="In-progress stories"
          value={String(inProgressStories)}
          helper="Across all active sprints"
        />
      </div>
      <SprintVelocityChart />
    </motion.div>
  );
}
