import type { UserRole } from "../../../types";

export type DashboardRange = "week" | "month" | "quarter";
export type MetricIconKey = "throughput" | "completion" | "quality" | "focus";

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendTone: "positive" | "warning" | "neutral";
  helperText: string;
  iconKey: MetricIconKey;
}

export interface SprintSummary {
  sprintName: string;
  projectName: string;
  dateRange: string;
  progress: number;
  doneCount: number;
  totalCount: number;
  blockers: string[];
}

export interface DeliveryHealthItem {
  label: string;
  percentage: number;
}

export interface ActivityFeedItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  kind: "project" | "sprint" | "story" | "user";
}

export interface FocusItem {
  id: string;
  title: string;
  owner: string;
  dueLabel: string;
  priority: "high" | "medium" | "low";
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  to: string;
  allowedRoles?: UserRole[];
}

export const rangeOptions: Array<{ value: DashboardRange; label: string }> = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
];

export const metricsByRange: Record<DashboardRange, DashboardMetric[]> = {
  week: [
    {
      id: "velocity",
      label: "Sprint Throughput",
      value: "38 pts",
      trend: "+12%",
      trendTone: "positive",
      helperText: "vs previous week",
      iconKey: "throughput",
    },
    {
      id: "completion",
      label: "Story Completion",
      value: "26/34",
      trend: "76%",
      trendTone: "neutral",
      helperText: "stories finished",
      iconKey: "completion",
    },
    {
      id: "quality",
      label: "Defect Risk",
      value: "Low",
      trend: "-2 hot items",
      trendTone: "positive",
      helperText: "active blockers",
      iconKey: "quality",
    },
    {
      id: "focus",
      label: "Team Focus",
      value: "91%",
      trend: "+4%",
      trendTone: "positive",
      helperText: "planned effort",
      iconKey: "focus",
    },
  ],
  month: [
    {
      id: "velocity",
      label: "Sprint Throughput",
      value: "142 pts",
      trend: "+9%",
      trendTone: "positive",
      helperText: "vs prior month",
      iconKey: "throughput",
    },
    {
      id: "completion",
      label: "Story Completion",
      value: "108/142",
      trend: "76%",
      trendTone: "neutral",
      helperText: "stories finished",
      iconKey: "completion",
    },
    {
      id: "quality",
      label: "Defect Risk",
      value: "Moderate",
      trend: "+3 QA items",
      trendTone: "warning",
      helperText: "requires review",
      iconKey: "quality",
    },
    {
      id: "focus",
      label: "Team Focus",
      value: "87%",
      trend: "-1%",
      trendTone: "neutral",
      helperText: "planned effort",
      iconKey: "focus",
    },
  ],
  quarter: [
    {
      id: "velocity",
      label: "Sprint Throughput",
      value: "406 pts",
      trend: "+17%",
      trendTone: "positive",
      helperText: "quarter over quarter",
      iconKey: "throughput",
    },
    {
      id: "completion",
      label: "Story Completion",
      value: "324/422",
      trend: "77%",
      trendTone: "neutral",
      helperText: "stories finished",
      iconKey: "completion",
    },
    {
      id: "quality",
      label: "Defect Risk",
      value: "Stable",
      trend: "-11 regressions",
      trendTone: "positive",
      helperText: "from last quarter",
      iconKey: "quality",
    },
    {
      id: "focus",
      label: "Team Focus",
      value: "89%",
      trend: "+2%",
      trendTone: "positive",
      helperText: "planned effort",
      iconKey: "focus",
    },
  ],
};

export const activeSprint: SprintSummary = {
  sprintName: "Sprint 18 - Reliability Push",
  projectName: "Payment Platform Revamp",
  dateRange: "Mar 18 - Mar 31",
  progress: 74,
  doneCount: 29,
  totalCount: 39,
  blockers: [
    "Rate-limit edge case on checkout webhook",
    "Story API latency spike over 350ms",
  ],
};

export const deliveryHealth: DeliveryHealthItem[] = [
  { label: "Planning Confidence", percentage: 88 },
  { label: "In-Progress Stability", percentage: 72 },
  { label: "Review Throughput", percentage: 81 },
  { label: "Release Readiness", percentage: 67 },
];

export const activityFeed: ActivityFeedItem[] = [
  {
    id: "act-1",
    actor: "Avery",
    action: "completed",
    target: "Story AT-483",
    timestamp: "4 minutes ago",
    kind: "story",
  },
  {
    id: "act-2",
    actor: "Jordan",
    action: "started",
    target: "Sprint 18 retrospective prep",
    timestamp: "22 minutes ago",
    kind: "sprint",
  },
  {
    id: "act-3",
    actor: "Nina",
    action: "updated",
    target: "Project roadmap milestone",
    timestamp: "49 minutes ago",
    kind: "project",
  },
  {
    id: "act-4",
    actor: "Mateo",
    action: "assigned",
    target: "Story AT-491 to QA",
    timestamp: "1 hour ago",
    kind: "user",
  },
  {
    id: "act-5",
    actor: "Kai",
    action: "moved",
    target: "Story AT-477 to Review",
    timestamp: "2 hours ago",
    kind: "story",
  },
];

export const focusItems: FocusItem[] = [
  {
    id: "focus-1",
    title: "Checkout retry strategy",
    owner: "Jordan",
    dueLabel: "Due today",
    priority: "high",
  },
  {
    id: "focus-2",
    title: "Gateway auth header cleanup",
    owner: "Avery",
    dueLabel: "Due tomorrow",
    priority: "medium",
  },
  {
    id: "focus-3",
    title: "Story board QA lane tuning",
    owner: "Nina",
    dueLabel: "Due in 2 days",
    priority: "low",
  },
];

export const quickActions: QuickAction[] = [
  {
    id: "action-1",
    label: "Open Projects",
    description: "Create and manage project scope.",
    to: "/projects",
  },
  {
    id: "action-2",
    label: "Plan Sprints",
    description: "Review schedules and statuses.",
    to: "/sprints",
  },
  {
    id: "action-3",
    label: "Review Stories",
    description: "Move work through delivery stages.",
    to: "/stories",
  },
  {
    id: "action-4",
    label: "Manage Users",
    description: "Adjust roles and access controls.",
    to: "/users",
    allowedRoles: ["ADMIN"],
  },
];
