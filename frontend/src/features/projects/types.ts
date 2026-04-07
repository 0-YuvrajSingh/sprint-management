export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export type ProjectHealth = "PLANNING" | "ON_TRACK" | "AT_RISK" | "COMPLETED";

export interface ProjectInsight {
  ownerLabel: string;
  health: ProjectHealth;
  sprintCount: number;
  activeSprintCount: number;
  storyCount: number;
  completedStories: number;
}
