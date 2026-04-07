import {
  activities,
  projects,
  sprints,
  stories,
  users,
  type ActivityRecord,
  type StoryLane,
} from "./adminMockData";

export function getDisplayNameFromEmail(email: string | undefined): string {
  if (!email) {
    return "teammate";
  }

  const [name] = email.split("@");
  return name || "teammate";
}

export function completionRate(): number {
  if (stories.length === 0) {
    return 0;
  }

  const completed = stories.filter((story) => story.status === "DONE").length;
  return Math.round((completed / stories.length) * 100);
}

export function storiesByLane(): Record<StoryLane, typeof stories> {
  return {
    BACKLOG: stories.filter((story) => story.status === "BACKLOG"),
    IN_PROGRESS: stories.filter((story) => story.status === "IN_PROGRESS"),
    IN_REVIEW: stories.filter((story) => story.status === "IN_REVIEW"),
    DONE: stories.filter((story) => story.status === "DONE"),
  };
}

export function totalPointsByLane(lane: StoryLane): number {
  return stories
    .filter((story) => story.status === lane)
    .reduce((sum, story) => sum + story.points, 0);
}

export function daysRemaining(endDate: string): number {
  const now = new Date("2026-04-07T00:00:00Z").getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  const diff = Math.ceil((end - now) / (24 * 60 * 60 * 1000));
  return Math.max(0, diff);
}

export function withUserForActivities(): Array<ActivityRecord & { userName: string; userEmail: string }> {
  return activities.map((activity) => {
    const user = users.find((item) => item.id === activity.userId);

    return {
      ...activity,
      userName: user?.name ?? "Unknown User",
      userEmail: user?.email ?? "unknown@agiletrack.com",
    };
  });
}

export function dashboardStats() {
  const activeProjects = projects.filter((project) => project.status === "ACTIVE").length;
  const activeSprints = sprints.filter((sprint) => sprint.status === "ACTIVE").length;
  const totalStories = stories.length;
  const doneRate = completionRate();

  return {
    activeProjects,
    activeSprints,
    totalStories,
    doneRate,
  };
}

export function activityStats() {
  const todayCount = activities.filter((activity) => activity.timestamp.startsWith("2026-04-07")).length;
  const activeUsers = new Set(activities.map((activity) => activity.userId)).size;
  const projectUpdates = activities.filter((activity) => activity.type === "project").length;

  return {
    total: activities.length,
    todayCount,
    activeUsers,
    projectUpdates,
  };
}
