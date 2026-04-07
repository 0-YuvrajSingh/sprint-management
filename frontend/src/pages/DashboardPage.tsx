import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useMemo, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import activityApi from "../api/activity.api";
import projectsApi from "../api/projects.api";
import sprintsApi from "../api/sprints.api";
import storiesApi from "../api/stories.api";
import usersApi from "../api/users.api";
import { useAuth } from "../context/AuthContext";
import ActivityItem from "../features/dashboard/components/ActivityItem";
import SectionCard from "../features/dashboard/components/SectionCard";
import SprintCard from "../features/dashboard/components/SprintCard";
import StatCard from "../features/dashboard/components/StatCard";
import {
  quickActions,
  rangeOptions,
  type DashboardRange,
  type MetricIconKey,
} from "../features/dashboard/data/dashboardData";
import type {
  Activity,
  Sprint,
  StoryPriority,
  StoryStatus,
} from "../types";

type ActivityFilterKind = "all" | "project" | "sprint" | "story" | "user";
type ActivityDisplayKind = Exclude<ActivityFilterKind, "all">;

interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendTone: "positive" | "warning" | "neutral";
  helperText: string;
  iconKey: MetricIconKey;
}

interface DeliveryHealthItem {
  label: string;
  percentage: number;
}

interface FocusStoryItem {
  id: string;
  title: string;
  owner: string;
  dueLabel: string;
  priority: "high" | "medium" | "low";
}

interface DashboardActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  kind: ActivityDisplayKind;
}

const cardContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: "easeOut" },
  },
};

const listItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const rangeDays: Record<DashboardRange, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

const priorityRank: Record<StoryPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const inFlowStatuses: StoryStatus[] = ["IN_PROGRESS", "IN_REVIEW", "DONE"];

const activityActionLabel: Record<Activity["actionType"], string> = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  STATUS_CHANGED: "changed status on",
  ASSIGNED: "assigned",
  COMMENTED: "commented on",
};

function ThroughputIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 18H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 14L11 10L14 13L18 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompletionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QualityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4L20 8V12C20 16.42 16.94 20.15 12 21C7.06 20.15 4 16.42 4 12V8L12 4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 12L11.25 13.75L14.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FocusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const metricIcons: Record<MetricIconKey, ReactElement> = {
  throughput: <ThroughputIcon />,
  completion: <CompletionIcon />,
  quality: <QualityIcon />,
  focus: <FocusIcon />,
};

function parseTimestamp(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatTrend(delta: number): string {
  const rounded = Math.round(delta);
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
}

function formatActor(email: string): string {
  const [localPart] = email.split("@");
  if (!localPart) {
    return "System";
  }

  return `${localPart.charAt(0).toUpperCase()}${localPart.slice(1)}`;
}

function mapActivityKind(targetType: Activity["targetType"]): ActivityDisplayKind {
  switch (targetType) {
    case "PROJECT":
      return "project";
    case "SPRINT":
      return "sprint";
    case "STORY":
      return "story";
    default:
      return "user";
  }
}

function mapActivityTarget(activity: Activity): string {
  const description = activity.description?.trim();
  if (description) {
    return description;
  }

  const entityLabel: Record<Activity["targetType"], string> = {
    PROJECT: "Project",
    SPRINT: "Sprint",
    STORY: "Story",
    ASSIGNMENT: "Assignment",
    COMMENT: "Comment",
  };

  const shortId = activity.targetId.length > 8 ? activity.targetId.slice(0, 8) : activity.targetId;
  return `${entityLabel[activity.targetType]} ${shortId}`;
}

function toRelativeTime(timestampValue: string, nowTimestamp: number): string {
  const timestamp = parseTimestamp(timestampValue);
  if (!timestamp) {
    return "Unknown time";
  }

  const diff = nowTimestamp - timestamp;
  if (diff < 60_000) {
    return "just now";
  }

  if (diff < 3_600_000) {
    const minutes = Math.floor(diff / 60_000);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (diff < 86_400_000) {
    const hours = Math.floor(diff / 3_600_000);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(diff / 86_400_000);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatSprintDateRange(startDate: string | undefined, endDate: string | undefined): string {
  const startTimestamp = parseTimestamp(startDate);
  const endTimestamp = parseTimestamp(endDate);

  if (!startTimestamp || !endTimestamp) {
    return "Date not set";
  }

  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${formatter.format(new Date(startTimestamp))} - ${formatter.format(new Date(endTimestamp))}`;
}

function toFocusPriority(priority: StoryPriority): "high" | "medium" | "low" {
  if (priority === "CRITICAL" || priority === "HIGH") {
    return "high";
  }

  if (priority === "MEDIUM") {
    return "medium";
  }

  return "low";
}

function buildDueLabel(sprint: Sprint | undefined, nowTimestamp: number): string {
  if (!sprint) {
    return "No sprint deadline";
  }

  const endTimestamp = parseTimestamp(sprint.endDate);
  if (!endTimestamp) {
    return "No sprint deadline";
  }

  const daysLeft = Math.ceil((endTimestamp - nowTimestamp) / MS_IN_DAY);

  if (daysLeft < 0) {
    return "Sprint overdue";
  }

  if (daysLeft === 0) {
    return "Due today";
  }

  if (daysLeft === 1) {
    return "Due tomorrow";
  }

  return `Due in ${daysLeft} days`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [range, setRange] = useState<DashboardRange>("week");
  const [showBriefing, setShowBriefing] = useState(true);
  const [activityKind, setActivityKind] = useState<ActivityFilterKind>("all");

  const projectsQuery = useQuery({
    queryKey: ["projects", "dashboard"],
    queryFn: projectsApi.list,
  });

  const sprintsQuery = useQuery({
    queryKey: ["sprints", "dashboard"],
    queryFn: () => sprintsApi.list({ size: 200 }),
  });

  const storiesQuery = useQuery({
    queryKey: ["stories", "dashboard"],
    queryFn: () => storiesApi.list(),
  });

  const usersQuery = useQuery({
    queryKey: ["users", "dashboard"],
    queryFn: usersApi.list,
  });

  const activitiesQuery = useQuery({
    queryKey: ["activities", "dashboard"],
    queryFn: () => activityApi.listRecent(14),
  });

  const nowTimestamp = useMemo(() => {
    const latestSync = Math.max(
      projectsQuery.dataUpdatedAt,
      sprintsQuery.dataUpdatedAt,
      storiesQuery.dataUpdatedAt,
      usersQuery.dataUpdatedAt,
      activitiesQuery.dataUpdatedAt
    );

    return latestSync > 0 ? latestSync : 1;
  }, [
    projectsQuery.dataUpdatedAt,
    sprintsQuery.dataUpdatedAt,
    storiesQuery.dataUpdatedAt,
    usersQuery.dataUpdatedAt,
    activitiesQuery.dataUpdatedAt,
  ]);

  const isDashboardLoading =
    projectsQuery.isLoading ||
    sprintsQuery.isLoading ||
    storiesQuery.isLoading ||
    usersQuery.isLoading ||
    activitiesQuery.isLoading;

  const isDashboardFetching =
    projectsQuery.isFetching ||
    sprintsQuery.isFetching ||
    storiesQuery.isFetching ||
    usersQuery.isFetching ||
    activitiesQuery.isFetching;

  const hasDataError =
    projectsQuery.isError ||
    sprintsQuery.isError ||
    storiesQuery.isError ||
    usersQuery.isError ||
    activitiesQuery.isError;

  const refreshAll = () => {
    void projectsQuery.refetch();
    void sprintsQuery.refetch();
    void storiesQuery.refetch();
    void usersQuery.refetch();
    void activitiesQuery.refetch();
  };

  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data?.content]
  );

  const sprints = useMemo(
    () => sprintsQuery.data?.content ?? [],
    [sprintsQuery.data?.content]
  );

  const stories = useMemo(
    () => storiesQuery.data?.content ?? [],
    [storiesQuery.data?.content]
  );

  const users = useMemo(
    () => usersQuery.data?.content ?? [],
    [usersQuery.data?.content]
  );

  const activities = useMemo(
    () => activitiesQuery.data ?? [],
    [activitiesQuery.data]
  );

  const projectNameById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects]
  );

  const sprintById = useMemo(
    () => new Map(sprints.map((sprint) => [sprint.id, sprint])),
    [sprints]
  );

  const rangeStoryBuckets = useMemo(() => {
    const span = rangeDays[range] * MS_IN_DAY;
    const currentStart = nowTimestamp - span;
    const previousStart = currentStart - span;

    const currentRangeStories = stories.filter((story) => {
      const timestamp = parseTimestamp(story.updatedAt || story.createdAt);
      return timestamp >= currentStart && timestamp < nowTimestamp;
    });

    const previousRangeStories = stories.filter((story) => {
      const timestamp = parseTimestamp(story.updatedAt || story.createdAt);
      return timestamp >= previousStart && timestamp < currentStart;
    });

    return { currentRangeStories, previousRangeStories };
  }, [stories, range, nowTimestamp]);

  const activeSprint = useMemo(() => {
    if (sprints.length === 0) {
      return null;
    }

    const byClosestEnd = [...sprints].sort(
      (first, second) => parseTimestamp(first.endDate) - parseTimestamp(second.endDate)
    );

    const active = byClosestEnd.find((sprint) => sprint.status === "ACTIVE");
    if (active) {
      return active;
    }

    const planned = [...sprints]
      .filter((sprint) => sprint.status === "PLANNED")
      .sort((first, second) => parseTimestamp(first.startDate) - parseTimestamp(second.startDate))[0];

    if (planned) {
      return planned;
    }

    return [...sprints]
      .filter((sprint) => sprint.status === "COMPLETED")
      .sort((first, second) => parseTimestamp(second.endDate) - parseTimestamp(first.endDate))[0] ?? null;
  }, [sprints]);

  const activeSprintStories = useMemo(() => {
    if (!activeSprint) {
      return [];
    }

    return stories.filter((story) => story.sprintId === activeSprint.id);
  }, [stories, activeSprint]);

  const metrics = useMemo<DashboardMetric[]>(() => {
    const currentDoneStories = rangeStoryBuckets.currentRangeStories.filter(
      (story) => story.status === "DONE"
    );

    const previousDoneStories = rangeStoryBuckets.previousRangeStories.filter(
      (story) => story.status === "DONE"
    );

    const currentThroughput = currentDoneStories.reduce(
      (sum, story) => sum + (story.storyPoints ?? 1),
      0
    );

    const previousThroughput = previousDoneStories.reduce(
      (sum, story) => sum + (story.storyPoints ?? 1),
      0
    );

    const throughputDelta =
      previousThroughput > 0
        ? ((currentThroughput - previousThroughput) / previousThroughput) * 100
        : currentThroughput > 0
          ? 100
          : 0;

    const completionTotal = rangeStoryBuckets.currentRangeStories.length;
    const completionDone = currentDoneStories.length;
    const completionRate = completionTotal > 0 ? (completionDone / completionTotal) * 100 : 0;

    const highRiskStories = rangeStoryBuckets.currentRangeStories.filter(
      (story) =>
        (story.priority === "HIGH" || story.priority === "CRITICAL") &&
        story.status !== "DONE"
    ).length;

    const riskValue = highRiskStories === 0 ? "Low" : highRiskStories <= 2 ? "Moderate" : "High";
    const riskTone = highRiskStories <= 1 ? "positive" : "warning";

    const currentFocusRate =
      completionTotal > 0
        ? (rangeStoryBuckets.currentRangeStories.filter((story) => inFlowStatuses.includes(story.status)).length /
          completionTotal) *
          100
        : 0;

    const previousTotal = rangeStoryBuckets.previousRangeStories.length;
    const previousFocusRate =
      previousTotal > 0
        ? (rangeStoryBuckets.previousRangeStories.filter((story) => inFlowStatuses.includes(story.status)).length /
          previousTotal) *
          100
        : 0;

    const focusDelta = currentFocusRate - previousFocusRate;
    const teamSizeHelper = users.length > 0 ? `${users.length} team members` : "team data pending";

    return [
      {
        id: "throughput",
        label: "Sprint Throughput",
        value: `${currentThroughput} pts`,
        trend: formatTrend(throughputDelta),
        trendTone: throughputDelta >= 0 ? "positive" : "warning",
        helperText: "vs previous period",
        iconKey: "throughput",
      },
      {
        id: "completion",
        label: "Story Completion",
        value: `${completionDone}/${completionTotal}`,
        trend: `${clampPercent(completionRate)}%`,
        trendTone: completionRate >= 70 ? "positive" : completionRate >= 45 ? "neutral" : "warning",
        helperText: "stories closed",
        iconKey: "completion",
      },
      {
        id: "quality",
        label: "Defect Risk",
        value: riskValue,
        trend: `${highRiskStories} at-risk`,
        trendTone: riskTone,
        helperText: "high-priority open work",
        iconKey: "quality",
      },
      {
        id: "focus",
        label: "Team Focus",
        value: `${clampPercent(currentFocusRate)}%`,
        trend: formatTrend(focusDelta),
        trendTone: focusDelta >= 0 ? "positive" : "neutral",
        helperText: teamSizeHelper,
        iconKey: "focus",
      },
    ];
  }, [rangeStoryBuckets, users.length]);

  const sprintCardData = useMemo(() => {
    if (!activeSprint) {
      return {
        sprintName: "No active sprint",
        projectName: "Start a sprint to track live progress",
        dateRange: "Not scheduled",
        progress: 0,
        doneCount: 0,
        totalCount: 0,
        blockers: [] as string[],
      };
    }

    const totalCount = activeSprintStories.length;
    const doneCount = activeSprintStories.filter((story) => story.status === "DONE").length;
    const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

    const blockers = activeSprintStories
      .filter(
        (story) =>
          (story.priority === "HIGH" || story.priority === "CRITICAL") &&
          story.status !== "DONE"
      )
      .map((story) => story.title)
      .slice(0, 2);

    return {
      sprintName: activeSprint.name,
      projectName: projectNameById.get(activeSprint.projectId) ?? "Unknown project",
      dateRange: formatSprintDateRange(activeSprint.startDate, activeSprint.endDate),
      progress,
      doneCount,
      totalCount,
      blockers,
    };
  }, [activeSprint, activeSprintStories, projectNameById]);

  const deliveryHealth = useMemo<DeliveryHealthItem[]>(() => {
    const totalStories = stories.length;
    const activeTotal = activeSprintStories.length;
    const activeDone = activeSprintStories.filter((story) => story.status === "DONE").length;

    const planningConfidence =
      totalStories > 0
        ? (stories.filter((story) => story.status !== "BACKLOG").length / totalStories) * 100
        : 0;

    const inProgressStability =
      activeTotal > 0
        ? (activeSprintStories.filter((story) => story.status === "IN_PROGRESS" || story.status === "IN_REVIEW").length /
          activeTotal) *
          100
        : 0;

    const reviewThroughput =
      totalStories > 0
        ? (stories.filter((story) => story.status === "IN_REVIEW" || story.status === "DONE").length /
          totalStories) *
          100
        : 0;

    const releaseReadiness = activeTotal > 0 ? (activeDone / activeTotal) * 100 : 0;

    return [
      { label: "Planning Confidence", percentage: clampPercent(planningConfidence) },
      { label: "In-Progress Stability", percentage: clampPercent(inProgressStability) },
      { label: "Review Throughput", percentage: clampPercent(reviewThroughput) },
      { label: "Release Readiness", percentage: clampPercent(releaseReadiness) },
    ];
  }, [stories, activeSprintStories]);

  const focusItems = useMemo<FocusStoryItem[]>(() => {
    const rankedStories = [...stories]
      .filter((story) => story.status !== "DONE")
      .sort((first, second) => {
        const priorityDelta = priorityRank[first.priority] - priorityRank[second.priority];
        if (priorityDelta !== 0) {
          return priorityDelta;
        }

        return parseTimestamp(second.updatedAt) - parseTimestamp(first.updatedAt);
      });

    return rankedStories.slice(0, 3).map((story) => ({
      id: story.id,
      title: story.title,
      owner: story.assigneeEmail?.split("@")[0] ?? "Unassigned",
      dueLabel: buildDueLabel(sprintById.get(story.sprintId), nowTimestamp),
      priority: toFocusPriority(story.priority),
    }));
  }, [stories, sprintById, nowTimestamp]);

  const activityFeed = useMemo<DashboardActivityItem[]>(
    () =>
      activities.slice(0, 12).map((activity) => ({
        id: String(activity.id),
        actor: formatActor(activity.userEmail),
        action: activityActionLabel[activity.actionType],
        target: mapActivityTarget(activity),
        timestamp: toRelativeTime(activity.timestamp, nowTimestamp),
        kind: mapActivityKind(activity.targetType),
      })),
    [activities, nowTimestamp]
  );

  const filteredActivity = useMemo(() => {
    if (activityKind === "all") {
      return activityFeed;
    }

    return activityFeed.filter((entry) => entry.kind === activityKind);
  }, [activityFeed, activityKind]);

  const visibleQuickActions = useMemo(
    () => quickActions.filter((action) => !action.allowedRoles || hasRole(...action.allowedRoles)),
    [hasRole]
  );

  const focusPriorityTone: Record<"high" | "medium" | "low", string> = {
    high: "bg-rose-100 text-rose-700 border-rose-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="space-y-5 pb-1">
      <motion.section
        className="flex flex-wrap items-start justify-between gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Team pulse</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.email?.split("@")[0] ?? "teammate"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Live workspace metrics are computed directly from projects, sprints, stories, users, and activity streams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Live data
          </span>

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <span className="font-semibold text-slate-600">View</span>
            <select
              className="border-none bg-transparent text-sm font-semibold text-slate-800 outline-none"
              value={range}
              onChange={(event) => setRange(event.target.value as DashboardRange)}
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={refreshAll}
            disabled={isDashboardFetching}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDashboardFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </motion.section>

      {hasDataError && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Some dashboard widgets could not be loaded. You can continue working and retry sync.
        </section>
      )}

      {isDashboardLoading && (
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Syncing dashboard widgets with live services...
        </section>
      )}

      <AnimatePresence>
        {showBriefing ? (
          <motion.section
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-cyan-900">Daily Delivery Briefing</p>
                <p className="mt-1 text-sm text-cyan-800">
                  Snapshot generated from live sprint and story activity. Review blockers and throughput before standup.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBriefing(false)}
                className="rounded-lg border border-cyan-300 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-800 transition-colors hover:bg-cyan-100"
              >
                Dismiss
              </button>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.section
        variants={cardContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <motion.div key={metric.id} variants={cardItem}>
            <StatCard
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              trendTone={metric.trendTone}
              helperText={metric.helperText}
              icon={metricIcons[metric.iconKey]}
            />
          </motion.div>
        ))}
      </motion.section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
          <SprintCard
            sprintName={sprintCardData.sprintName}
            projectName={sprintCardData.projectName}
            dateRange={sprintCardData.dateRange}
            progress={sprintCardData.progress}
            doneCount={sprintCardData.doneCount}
            totalCount={sprintCardData.totalCount}
            blockers={sprintCardData.blockers}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.04 }}>
          <SectionCard title="Delivery Health" subtitle="Computed from current project and sprint flow">
            <div className="space-y-3">
              {deliveryHealth.map((item) => (
                <motion.div key={item.label} className="space-y-1.5" variants={listItem} initial="hidden" animate="visible">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <SectionCard
          title="Activity Feed"
          subtitle="Live audit stream from activity-service"
          action={
            <select
              value={activityKind}
              onChange={(event) => setActivityKind(event.target.value as ActivityFilterKind)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="all">All</option>
              <option value="project">Project</option>
              <option value="sprint">Sprint</option>
              <option value="story">Story</option>
              <option value="user">User</option>
            </select>
          }
        >
          {activitiesQuery.isLoading && filteredActivity.length === 0 ? (
            <p className="text-sm text-slate-500">Loading activity feed...</p>
          ) : filteredActivity.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity matched this filter.</p>
          ) : (
            <div className="space-y-2.5">
              {filteredActivity.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  variants={listItem}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: Math.min(index * 0.03, 0.24) }}
                >
                  <ActivityItem
                    actor={entry.actor}
                    action={entry.action}
                    target={entry.target}
                    timestamp={entry.timestamp}
                    kind={entry.kind}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="My Focus" subtitle="Highest urgency open stories">
            {focusItems.length === 0 ? (
              <p className="text-sm text-slate-500">No active stories require immediate focus.</p>
            ) : (
              <div className="space-y-2.5">
                {focusItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.16) }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                          focusPriorityTone[item.priority],
                        ]
                          .join(" ")
                          .trim()}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{item.owner}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-700">{item.dueLabel}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Quick Actions" subtitle="Jump directly into core workflows">
            <div className="space-y-2.5">
              {visibleQuickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition-colors hover:border-cyan-300 hover:bg-cyan-50"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(index * 0.035, 0.18) }}
                  whileHover={{ y: -2 }}
                >
                  <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="mt-1 text-xs text-slate-600">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
