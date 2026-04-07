export type StoryStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type StoryPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Story {
  id: string;
  title: string;
  description: string | null;
  status: StoryStatus;
  priority: StoryPriority;
  storyPoints: number | null;
  projectId: string;
  sprintId: string | null;
  assigneeEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoryPatch {
  title?: string;
  description?: string;
  status?: StoryStatus;
  priority?: StoryPriority;
  storyPoints?: number;
  sprintId?: string;
  assigneeEmail?: string;
}

export type KanbanColumn = "TODO" | "IN_PROGRESS" | "DONE";
