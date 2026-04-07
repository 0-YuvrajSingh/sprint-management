import { useAuth } from "@/features/auth/hooks/useAuth";
import { StoryKanban } from "@/features/stories/components/StoryKanban";
import { useStories } from "@/features/stories/hooks/useStories";
import { Card } from "@/shared/ui/Card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatCard } from "@/shared/ui/StatCard";
import { motion } from "framer-motion";
import { CheckCircle, ListTodo } from "lucide-react";

export function DeveloperDashboard() {
  const { user } = useAuth();
  const storiesQuery = useStories({ page: 0, size: 200 });

  const isLoading = storiesQuery.isLoading;
  const error = storiesQuery.error;

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  const myStories = storiesQuery.data?.content.filter((story) => story.assignedTo === user?.id) ?? [];
  const myInProgressStories = myStories.filter((story) => story.status === "IN_PROGRESS" || story.status === "IN_REVIEW").length;
  const myDoneStories = myStories.filter((story) => story.status === "DONE").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold tracking-tight">Developer Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ListTodo}
          label="My In-progress stories"
          value={String(myInProgressStories)}
          helper="Stories assigned to you"
        />
        <StatCard
          icon={CheckCircle}
          label="My Done stories"
          value={String(myDoneStories)}
          helper="Stories you have completed"
        />
      </div>
      <Card>
        <Card.Header>
          <Card.Title>My Stories Kanban</Card.Title>
        </Card.Header>
        <Card.Content>
          <StoryKanban />
        </Card.Content>
      </Card>
    </motion.div>
  );
}
