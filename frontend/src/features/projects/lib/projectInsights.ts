import type { Project, ProjectInsight } from "@/features/projects/types";
import type { Sprint } from "@/features/sprints/types";
import type { Story } from "@/features/stories/types";
import type { User } from "@/features/users/types";

function deriveOwnerLabel(stories: Story[], users: User[]) {
  const counts = stories.reduce<Record<string, number>>((accumulator, story) => {
    if (!story.assigneeEmail) {
      return accumulator;
    }

    accumulator[story.assigneeEmail] = (accumulator[story.assigneeEmail] ?? 0) + 1;
    return accumulator;
  }, {});

  const topOwner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!topOwner) {
    return "Shared team";
  }

  const matchingUser = users.find((user) => user.email === topOwner);
  return matchingUser?.name || topOwner;
}

export function deriveProjectInsight(project: Project, stories: Story[], sprints: Sprint[], users: User[]): ProjectInsight {
  const relatedStories = stories.filter((story) => story.projectId === project.id);
  const relatedSprints = sprints.filter((sprint) => sprint.projectId === project.id);
  const completedStories = relatedStories.filter((story) => story.status === "DONE").length;
  const activeSprintCount = relatedSprints.filter((sprint) => sprint.status === "ACTIVE").length;
  const backlogCount = relatedStories.filter((story) => story.status === "BACKLOG").length;
  const reviewCount = relatedStories.filter((story) => story.status === "IN_REVIEW").length;

  let health: ProjectInsight["health"] = "PLANNING";

  if (relatedStories.length > 0 && completedStories === relatedStories.length) {
    health = "COMPLETED";
  } else if (activeSprintCount > 0) {
    health = backlogCount > completedStories + reviewCount ? "AT_RISK" : "ON_TRACK";
  } else if (relatedSprints.some((sprint) => sprint.status === "PLANNED")) {
    health = "PLANNING";
  } else if (relatedStories.length > 0) {
    health = "ON_TRACK";
  }

  return {
    ownerLabel: deriveOwnerLabel(relatedStories, users),
    health,
    sprintCount: relatedSprints.length,
    activeSprintCount,
    storyCount: relatedStories.length,
    completedStories,
  };
}
