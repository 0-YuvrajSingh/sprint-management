import { useProjects } from "@/features/projects/hooks/useProjects";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import { updateStory } from "@/features/stories/api/storiesApi";
import { StoryKanbanBoard } from "@/features/stories/components/StoryKanbanBoard";
import { useStories } from "@/features/stories/hooks/useStories";
import type { Story, StoryStatus } from "@/features/stories/types";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTransition } from "@/shared/ui/PageTransition";
import { Select } from "@/shared/ui/Select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KanbanSquare } from "lucide-react";
import { useState } from "react";

export function StoriesPage() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState("");
  const [sprintId, setSprintId] = useState("");

  const projectsQuery = useProjects({ page: 0, size: 100 });
  const sprintsQuery = useSprints({ page: 0, size: 100, projectId: projectId || undefined });
  const storiesQuery = useStories({
    page: 0,
    size: 120,
    projectId: projectId || undefined,
    sprintId: sprintId || undefined,
  });

  const updateStoryMutation = useMutation({
    mutationFn: ({ storyId, status }: { storyId: string; status: StoryStatus }) => updateStory(storyId, { status }),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  if (projectsQuery.isLoading || sprintsQuery.isLoading || storiesQuery.isLoading) {
    return <LoadingState />;
  }

  const firstError = [projectsQuery.error, sprintsQuery.error, storiesQuery.error, updateStoryMutation.error].find(Boolean);
  if (firstError) {
    return <ErrorState message={firstError.message} onRetry={() => storiesQuery.refetch()} />;
  }

  const projects = projectsQuery.data?.content ?? [];
  const sprints = sprintsQuery.data?.content ?? [];
  const stories = storiesQuery.data?.content ?? [];
  const todoCount = stories.filter((story) => story.status === "TODO").length;
  const inProgressCount = stories.filter((story) => story.status === "IN_PROGRESS" || story.status === "IN_REVIEW").length;
  const doneCount = stories.filter((story) => story.status === "DONE").length;

  const handleMoveStory = (story: Story, nextStatus: StoryStatus) => {
    updateStoryMutation.mutate({
      storyId: story.id,
      status: nextStatus,
    });
  };

  return (
    <PageTransition>
      <PageHeader
        title="Stories"
        description="Move work across the board while keeping backend statuses synchronized through the shared API layer."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Todo lane</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{todoCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">In progress lane</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{inProgressCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Done lane</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{doneCount}</p>
        </Card>
      </div>

      <Card className="grid gap-4 md:grid-cols-2">
        <Select
          label="Project"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
            setSprintId("");
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
          label="Sprint"
          value={sprintId}
          onChange={(event) => setSprintId(event.target.value)}
        >
          <option value="">All sprints</option>
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </Select>
      </Card>

      <Card className="border-brand-100 bg-brand-50/70 text-sm text-brand-800">
        Stories in backend status `IN_REVIEW` are grouped into the three-column board's In Progress lane so the UI stays
        faithful to your requested Todo / In Progress / Done workflow without hiding review-stage work.
      </Card>

      {stories.length === 0 ? (
        <EmptyState
          icon={KanbanSquare}
          title="No stories available"
          description="Create stories in the backend and they will appear here for drag-and-drop workflow management."
        />
      ) : (
        <StoryKanbanBoard
          stories={stories}
          onMoveStory={handleMoveStory}
          isUpdating={updateStoryMutation.isPending}
        />
      )}
    </PageTransition>
  );
}
