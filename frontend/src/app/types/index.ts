export type Role = 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'VIEWER';

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export type StoryStatus = 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'PLANNING';
  createdAt: Date;
  createdBy: string;
  memberCount: number;
}

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  status: SprintStatus;
  startDate: Date;
  endDate: Date;
  goal: string;
  storyCount: number;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  status: StoryStatus;
  priority: Priority;
  storyPoints: number;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  projectId: string;
  sprintId?: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  entityType: 'PROJECT' | 'SPRINT' | 'STORY' | 'USER';
  entityId: string;
  entityName: string;
  timestamp: Date;
  details?: string;
}
