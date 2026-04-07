import type { UserRole } from "../types";

export type ProjectStatus = "PLANNING" | "ACTIVE" | "PAUSED" | "COMPLETED";
export type SprintState = "PLANNED" | "ACTIVE" | "COMPLETED";
export type StoryLane = "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type StoryPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ActivityType = "story" | "project" | "sprint" | "user";

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  members: number;
  createdAt: string;
}

export interface SprintRecord {
  id: string;
  name: string;
  projectName: string;
  status: SprintState;
  storyCount: number;
  startDate: string;
  endDate: string;
  progress: number;
  goal: string;
}

export interface StoryRecord {
  id: string;
  title: string;
  status: StoryLane;
  priority: StoryPriority;
  points: number;
  assigneeId: string;
}

export interface ActivityRecord {
  id: string;
  userId: string;
  action: string;
  target: string;
  timestamp: string;
  type: ActivityType;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  avatar?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  to: string;
}

export const dashboardWelcome = {
  heading: "Good morning",
  subtext:
    "Here is your delivery pulse. Monitor sprint health, team activity, and execution trends across AgileTrack.",
  alert:
    "Sprint review in 2 hours. Ensure blockers are updated before standup.",
};

export const quickActions: QuickAction[] = [
  {
    id: "qa-1",
    label: "Create Project",
    description: "Open a new initiative and define scope.",
    to: "/projects",
  },
  {
    id: "qa-2",
    label: "Start Sprint",
    description: "Plan goals and activate the next sprint.",
    to: "/sprints",
  },
  {
    id: "qa-3",
    label: "Create Story",
    description: "Capture backlog work with priority and points.",
    to: "/stories",
  },
  {
    id: "qa-4",
    label: "View Reports",
    description: "Review completion and throughput trends.",
    to: "/activity",
  },
];

export const users: UserRecord[] = [
  {
    id: "u-1",
    name: "Sarah Chen",
    email: "sarah@agiletrack.com",
    role: "ADMIN",
    joinedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "u-2",
    name: "Marcus Johnson",
    email: "marcus@agiletrack.com",
    role: "MANAGER",
    joinedAt: "2024-02-01T09:10:00Z",
  },
  {
    id: "u-3",
    name: "Emily Rodriguez",
    email: "emily@agiletrack.com",
    role: "DEVELOPER",
    joinedAt: "2024-02-10T14:20:00Z",
  },
  {
    id: "u-4",
    name: "James Park",
    email: "james@agiletrack.com",
    role: "DEVELOPER",
    joinedAt: "2024-02-15T11:05:00Z",
  },
  {
    id: "u-5",
    name: "Lisa Wang",
    email: "lisa@agiletrack.com",
    role: "VIEWER",
    joinedAt: "2024-03-01T16:30:00Z",
  },
];

export const projects: ProjectRecord[] = [
  {
    id: "p-1",
    name: "Customer Portal",
    description: "Build self-service portal for enterprise customers",
    status: "PLANNING",
    members: 4,
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "p-2",
    name: "API Gateway Migration",
    description: "Migrate legacy API gateway to modern microservices architecture",
    status: "ACTIVE",
    members: 3,
    createdAt: "2026-02-05T09:00:00Z",
  },
  {
    id: "p-3",
    name: "Analytics Dashboard",
    description: "Real-time analytics and reporting dashboard",
    status: "ACTIVE",
    members: 2,
    createdAt: "2026-01-30T09:15:00Z",
  },
  {
    id: "p-4",
    name: "Mobile App Redesign",
    description: "Complete UI/UX overhaul of the mobile application",
    status: "ACTIVE",
    members: 5,
    createdAt: "2026-01-20T13:20:00Z",
  },
  {
    id: "p-5",
    name: "Billing Automation",
    description: "Automate invoicing and reconciliation workflows",
    status: "PAUSED",
    members: 2,
    createdAt: "2025-12-12T08:50:00Z",
  },
];

export const sprints: SprintRecord[] = [
  {
    id: "s-14",
    name: "Sprint 14 - Mobile Polish",
    projectName: "Mobile App Redesign",
    status: "ACTIVE",
    storyCount: 8,
    startDate: "2026-03-31",
    endDate: "2026-04-14",
    progress: 50,
    goal: "Complete onboarding flow and fix critical bugs",
  },
  {
    id: "s-13",
    name: "Sprint 13 - Mobile Foundation",
    projectName: "Mobile App Redesign",
    status: "COMPLETED",
    storyCount: 12,
    startDate: "2026-03-17",
    endDate: "2026-03-31",
    progress: 100,
    goal: "Establish component library and navigation",
  },
  {
    id: "s-8",
    name: "Sprint 8 - API Migration Phase 2",
    projectName: "API Gateway Migration",
    status: "ACTIVE",
    storyCount: 6,
    startDate: "2026-04-01",
    endDate: "2026-04-15",
    progress: 43,
    goal: "Migrate user service and authentication",
  },
  {
    id: "s-1",
    name: "Sprint 1 - Portal Planning",
    projectName: "Customer Portal",
    status: "PLANNED",
    storyCount: 10,
    startDate: "2026-04-15",
    endDate: "2026-04-29",
    progress: 0,
    goal: "Complete wireframes and technical architecture",
  },
  {
    id: "s-10",
    name: "Sprint 10 - Dashboard v2",
    projectName: "Analytics Dashboard",
    status: "ACTIVE",
    storyCount: 5,
    startDate: "2026-04-01",
    endDate: "2026-04-14",
    progress: 46,
    goal: "Add real-time data streaming",
  },
];

export const stories: StoryRecord[] = [
  {
    id: "st-1",
    title: "Add dark mode support",
    status: "BACKLOG",
    priority: "MEDIUM",
    points: 13,
    assigneeId: "u-3",
  },
  {
    id: "st-2",
    title: "Setup API gateway load balancer",
    status: "BACKLOG",
    priority: "HIGH",
    points: 8,
    assigneeId: "u-4",
  },
  {
    id: "st-3",
    title: "Design customer dashboard wireframes",
    status: "BACKLOG",
    priority: "MEDIUM",
    points: 5,
    assigneeId: "u-3",
  },
  {
    id: "st-4",
    title: "Add export to CSV functionality",
    status: "BACKLOG",
    priority: "LOW",
    points: 3,
    assigneeId: "u-4",
  },
  {
    id: "st-5",
    title: "Fix crash on profile page",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    points: 3,
    assigneeId: "u-4",
  },
  {
    id: "st-6",
    title: "Migrate authentication service",
    status: "IN_PROGRESS",
    priority: "HIGH",
    points: 21,
    assigneeId: "u-4",
  },
  {
    id: "st-7",
    title: "Implement real-time data streaming",
    status: "IN_PROGRESS",
    priority: "HIGH",
    points: 13,
    assigneeId: "u-3",
  },
  {
    id: "st-8",
    title: "Design onboarding screens",
    status: "IN_REVIEW",
    priority: "HIGH",
    points: 5,
    assigneeId: "u-3",
  },
  {
    id: "st-9",
    title: "Implement user authentication flow",
    status: "DONE",
    priority: "MEDIUM",
    points: 8,
    assigneeId: "u-3",
  },
  {
    id: "st-10",
    title: "Create reusable component library",
    status: "DONE",
    priority: "LOW",
    points: 8,
    assigneeId: "u-4",
  },
];

export const activities: ActivityRecord[] = [
  {
    id: "a-1",
    userId: "u-3",
    action: "completed",
    target: "Implement user authentication flow",
    timestamp: "2026-04-06T09:30:00Z",
    type: "story",
  },
  {
    id: "a-2",
    userId: "u-4",
    action: "started working on",
    target: "Fix crash on profile page",
    timestamp: "2026-04-06T11:00:00Z",
    type: "story",
  },
  {
    id: "a-3",
    userId: "u-2",
    action: "created",
    target: "Customer Portal",
    timestamp: "2026-04-06T13:20:00Z",
    type: "project",
  },
  {
    id: "a-4",
    userId: "u-3",
    action: "submitted for review",
    target: "Design onboarding screens",
    timestamp: "2026-04-06T14:00:00Z",
    type: "story",
  },
  {
    id: "a-5",
    userId: "u-1",
    action: "completed",
    target: "Sprint 13 - Mobile Foundation",
    timestamp: "2026-04-05T16:00:00Z",
    type: "sprint",
  },
  {
    id: "a-6",
    userId: "u-1",
    action: "updated",
    target: "Sprint 14 - Mobile Polish",
    timestamp: "2026-04-07T08:20:00Z",
    type: "sprint",
  },
  {
    id: "a-7",
    userId: "u-2",
    action: "assigned",
    target: "Migrate authentication service",
    timestamp: "2026-04-07T07:10:00Z",
    type: "story",
  },
  {
    id: "a-8",
    userId: "u-1",
    action: "updated role for",
    target: "Lisa Wang",
    timestamp: "2026-04-04T10:40:00Z",
    type: "user",
  },
];
