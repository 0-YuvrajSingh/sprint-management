import { FolderKanban, ListTodo, TimerReset, Users } from "lucide-react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import { useStories } from "@/features/stories/hooks/useStories";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useActivities } from "@/features/activity/hooks/useActivities";
import type { ActivityEntry } from "@/features/activity/types";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { Card } from "@/shared/ui/Card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTransition } from "@/shared/ui/PageTransition";
import { StatCard } from "@/shared/ui/StatCard";

const FALLBACK_ACTIVITY: ActivityEntry[] = [
  {
    id: 1,
    userEmail: "nina@agiletrack.io",
    actionType: "CREATED",
    targetType: "SPRINT",
    targetId: "mock-sprint-1",
    description: "Sprint 24 planning window opened for the platform team.",
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    userEmail: "arjun@agiletrack.io",
    actionType: "STATUS_CHANGED",
    targetType: "STORY",
    targetId: "mock-story-12",
    description: "Checkout reliability story moved into in-progress delivery.",
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  },
  {
    id: 3,
    userEmail: "meera@agiletrack.io",
    actionType: "ASSIGNED",
    targetType: "PROJECT",
    targetId: "mock-project-7",
    description: "Ownership refreshed for the customer onboarding workspace.",
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
  },
];

export function DashboardPage() {
  const projectsQuery = useProjects({ page: 0, size: 1 });
  const activeSprintsQuery = useSprints({ page: 0, size: 50, status: "ACTIVE" });
  const storiesQuery = useStories({ page: 0, size: 200 });
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

  const inProgressStories =
    storiesQuery.data?.content.filter((story) => story.status === "IN_PROGRESS" || story.status === "IN_REVIEW").length ?? 0;

  const activityFeedItems =
    activityQuery.data && activityQuery.data.content.length > 0 ? activityQuery.data.content : FALLBACK_ACTIVITY;

  return (
    <PageTransition>
      <PageHeader
        title="Dashboard"
        description="A calm snapshot of project health, sprint activity, story flow, and team presence."
      />

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
          label="Stories in flight"
          value={String(inProgressStories)}
          helper="In progress or under review"
        />
        <StatCard
          icon={Users}
          label="Team members"
          value={String(usersQuery.data?.totalElements ?? 0)}
          helper="Available in the user directory"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ActivityFeed items={activityFeedItems} />
        <Card className="space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Flow snapshot</p>
            <h2 className="font-display text-2xl font-bold text-ink">Delivery balance</h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Backlog</span>
                <span>{storiesQuery.data?.content.filter((story) => story.status === "BACKLOG").length ?? 0}</span>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Review lane</span>
                <span>{storiesQuery.data?.content.filter((story) => story.status === "IN_REVIEW").length ?? 0}</span>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Completed</span>
                <span>{storiesQuery.data?.content.filter((story) => story.status === "DONE").length ?? 0}</span>
              </div>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            Dashboard cards use live API totals where available, then fall back gracefully for the activity narrative so
            the landing experience never feels empty.
          </p>
        </Card>
      </div>
    </PageTransition>
  );
}
