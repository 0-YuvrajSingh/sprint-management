export type ActivityActionType =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "COMMENTED";

export type ActivityTargetType = "PROJECT" | "SPRINT" | "STORY" | "ASSIGNMENT" | "COMMENT";

export interface ActivityEntry {
  id: number;
  userEmail: string;
  actionType: ActivityActionType;
  targetType: ActivityTargetType;
  targetId: string;
  description: string;
  timestamp: string;
}

export interface ActivityFilters {
  page?: number;
  size?: number;
  userEmail?: string;
  targetType?: ActivityTargetType;
  targetId?: string;
}
