import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useActivities } from "@/features/activity/hooks/useActivities";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import { useStories } from "@/features/stories/hooks/useStories";
import { formatDateTime } from "@/shared/lib/format";
import { Card } from "@/shared/ui/Card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTransition } from "@/shared/ui/PageTransition";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { Tabs } from "@/shared/ui/Tabs";

const tabs = [
  { value: "summary", label: "Summary" },
  { value: "stories", label: "Stories" },
  { value: "activity", label: "Activity" },
];

export function ProjectDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("summary");

  if (!id) {
    return <Navigate to="/projects" replace />;
  }

  const projectQuery = useProject(id);
  const storiesQuery = useStories({ page: 0, size: 30, projectId: id });
  const sprintsQuery = useSprints({ page: 0, size: 20, projectId: id });
  const activityQuery = useActivities({ targetType: "PROJECT", targetId: id, size: 20 });

  const isLoading = projectQuery.isLoading || storiesQuery.isLoading || sprintsQuery.isLoading || activityQuery.isLoading;
  const firstError = [projectQuery.error, storiesQuery.error, sprintsQuery.error, activityQuery.error].find(Boolean);

  if (isLoading) {
    return <LoadingState />;
  }

  if (firstError || !projectQuery.data) {
    return <ErrorState message={firstError?.message || "Project not found."} onRetry={() => projectQuery.refetch()} />;
  }

  const project = projectQuery.data;
  const stories = storiesQuery.data?.content ?? [];
  const sprints = sprintsQuery.data?.content ?? [];
  const activities = activityQuery.data?.content ?? [];

  return (
    <PageTransition>
      <PageHeader
        title={project.name}
        description={project.description || "This project does not yet have a detailed description."}
        actions={<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />}
      />

      {activeTab === "summary" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-ink">Overview</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p>Created: {formatDateTime(project.createdAt)}</p>
                <p>Stories tracked: {stories.length}</p>
                <p>Related sprints: {sprints.length}</p>
                <p>Completed stories: {stories.filter((story) => story.status === "DONE").length}</p>
              </div>
            </Card>
            <Card className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-ink">Sprint coverage</h2>
              <div className="space-y-3">
                {sprints.length === 0 ? (
                  <p className="text-sm text-slate-500">No sprints linked to this project yet.</p>
                ) : (
                  sprints.map((sprint) => (
                    <div key={sprint.id} className="flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
                      <div>
                        <p className="font-semibold text-ink">{sprint.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(sprint.startDate)} to {formatDateTime(sprint.endDate)}
                        </p>
                      </div>
                      <StatusBadge value={sprint.status} />
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
          <Card className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-ink">Story summary</h2>
            <div className="space-y-3">
              {stories.length === 0 ? (
                <p className="text-sm text-slate-500">No stories are attached to this project yet.</p>
              ) : (
                stories.map((story) => (
                  <div key={story.id} className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-ink">{story.title}</p>
                        <p className="text-xs text-slate-500">{story.assigneeEmail || "Unassigned"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge value={story.priority} />
                        <StatusBadge value={story.status} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "stories" ? (
        <Card className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-ink">Stories</h2>
          <div className="space-y-3">
            {stories.length === 0 ? (
              <p className="text-sm text-slate-500">No stories available for this project.</p>
            ) : (
              stories.map((story) => (
                <div key={story.id} className="flex flex-col gap-3 rounded-[24px] border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{story.title}</p>
                    <p className="text-xs text-slate-500">
                      {story.assigneeEmail || "Unassigned"} • {story.storyPoints ?? 0} pts
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={story.priority} />
                    <StatusBadge value={story.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : null}

      {activeTab === "activity" ? <ActivityFeed items={activities} /> : null}
    </PageTransition>
  );
}
