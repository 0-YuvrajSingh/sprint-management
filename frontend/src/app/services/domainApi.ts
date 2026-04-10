import { Activity, Priority, Project, Sprint, SprintStatus, Story, StoryStatus, User } from '../types';
import { normalizeRole } from './authApi';
import { apiRequest } from './http';

type SpringPage<T> = {
  content: T[];
  totalPages?: number;
  number?: number;
  last?: boolean;
};

type ProjectResponseDto = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
};

type SprintResponseDto = {
  id: string;
  name: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  velocity?: number | null;
};

type StoryResponseDto = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  storyPoints?: number | null;
  projectId: string;
  sprintId?: string | null;
  assigneeEmail?: string | null;
  createdAt?: string;
};

type ActivityResponseDto = {
  id: number;
  userEmail?: string;
  actionType?: string;
  targetType?: string;
  targetId?: string;
  description?: string;
  timestamp?: string;
};

type UserResponseDto = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdDate?: string;
};

export type DomainSnapshot = {
  projects: Project[];
  sprints: Sprint[];
  stories: Story[];
  activities: Activity[];
  users: User[];
};

export type CreateProjectInput = {
  name: string;
  description?: string;
};

export type CreateSprintInput = {
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
  velocity?: number;
};

export type CreateStoryInput = {
  title: string;
  description?: string;
  status: StoryStatus;
  priority: Priority;
  storyPoints?: number;
  projectId: string;
  sprintId?: string;
  assigneeEmail?: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string;
};

export type UpdateSprintInput = {
  name?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  status?: SprintStatus;
  velocity?: number;
};

export type UpdateStoryInput = {
  title?: string;
  description?: string;
  status?: StoryStatus;
  priority?: Priority;
  storyPoints?: number;
  sprintId?: string;
  assigneeEmail?: string;
};

const FETCH_PAGE_SIZE = 200;

function isSpringPage<T>(value: unknown): value is SpringPage<T> {
  return !!value && typeof value === 'object' && Array.isArray((value as SpringPage<T>).content);
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseDate(value: string | undefined): Date {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function normalizeSprintStatus(value: string | undefined): SprintStatus {
  if (value === 'PLANNED' || value === 'ACTIVE' || value === 'COMPLETED') {
    return value;
  }
  return 'PLANNED';
}

function normalizeStoryStatus(value: string | undefined): StoryStatus {
  if (value === 'BACKLOG' || value === 'IN_PROGRESS' || value === 'IN_REVIEW' || value === 'DONE') {
    return value;
  }
  return 'BACKLOG';
}

function normalizePriority(value: string | undefined): Priority {
  if (value === 'LOW' || value === 'MEDIUM' || value === 'HIGH' || value === 'CRITICAL') {
    return value;
  }
  return 'MEDIUM';
}

function deriveDisplayName(email: string): string {
  const localPart = email.split('@')[0] || 'User';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function buildAvatar(email: string | undefined, fallbackName: string): string {
  const seed = email || fallbackName || 'user';
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
}

function mapActionText(actionType: string | undefined): string {
  switch (actionType) {
    case 'CREATED':
      return 'created';
    case 'UPDATED':
      return 'updated';
    case 'DELETED':
      return 'deleted';
    case 'STATUS_CHANGED':
      return 'changed status of';
    case 'ASSIGNED':
      return 'assigned';
    case 'COMMENTED':
      return 'commented on';
    default:
      return 'updated';
  }
}

function mapActivityTargetType(targetType: string | undefined): Activity['entityType'] {
  if (targetType === 'PROJECT' || targetType === 'SPRINT' || targetType === 'STORY') {
    return targetType;
  }
  return 'USER';
}

function deriveProjectStatus(projectId: string, sprints: SprintResponseDto[]): Project['status'] {
  const projectSprints = sprints.filter((sprint) => String(sprint.projectId) === projectId);

  if (projectSprints.some((sprint) => sprint.status === 'ACTIVE')) {
    return 'ACTIVE';
  }

  if (projectSprints.length === 0) {
    return 'PLANNING';
  }

  if (projectSprints.every((sprint) => sprint.status === 'COMPLETED')) {
    return 'ARCHIVED';
  }

  return 'PLANNING';
}

async function fetchCollection<T>(path: string, token: string): Promise<T[]> {
  const allItems: T[] = [];
  let page = 0;

  while (true) {
    const separator = path.includes('?') ? '&' : '?';
    const payload = await apiRequest<SpringPage<T> | T[]>(
      `${path}${separator}page=${page}&size=${FETCH_PAGE_SIZE}`,
      { token }
    );

    if (Array.isArray(payload)) {
      allItems.push(...payload);
      break;
    }

    if (!isSpringPage<T>(payload)) {
      break;
    }

    allItems.push(...payload.content);

    const totalPages = payload.totalPages ?? page + 1;
    const isLast = payload.last ?? page + 1 >= totalPages;
    if (isLast) {
      break;
    }

    page += 1;
  }

  return allItems;
}

function mapUsers(userDtos: UserResponseDto[]): User[] {
  return userDtos.map((userDto) => {
    const name = userDto.name?.trim() || deriveDisplayName(userDto.email);
    return {
      id: String(userDto.id),
      name,
      email: userDto.email,
      role: normalizeRole(userDto.role),
      avatar: buildAvatar(userDto.email, name),
      createdAt: parseDate(userDto.createdDate),
    };
  });
}

function mapStories(storyDtos: StoryResponseDto[], usersByEmail: Map<string, User>): Story[] {
  return storyDtos.map((storyDto) => {
    const assignee = isNonEmptyString(storyDto.assigneeEmail)
      ? usersByEmail.get(storyDto.assigneeEmail.toLowerCase())
      : undefined;

    return {
      id: String(storyDto.id),
      title: storyDto.title,
      description: storyDto.description || '',
      status: normalizeStoryStatus(storyDto.status),
      priority: normalizePriority(storyDto.priority),
      storyPoints: storyDto.storyPoints ?? 0,
      assigneeId: assignee?.id,
      assigneeName: assignee?.name,
      assigneeAvatar: assignee?.avatar,
      projectId: String(storyDto.projectId),
      sprintId: isNonEmptyString(storyDto.sprintId || undefined)
        ? String(storyDto.sprintId)
        : undefined,
      createdAt: parseDate(storyDto.createdAt),
    };
  });
}

function mapProjects(
  projectDtos: ProjectResponseDto[],
  sprintDtos: SprintResponseDto[],
  stories: Story[]
): Project[] {
  return projectDtos.map((projectDto) => {
    const projectId = String(projectDto.id);
    const memberCount = new Set(
      stories
        .filter((story) => story.projectId === projectId)
        .map((story) => story.assigneeId)
        .filter(isNonEmptyString)
    ).size;

    return {
      id: projectId,
      name: projectDto.name,
      description: projectDto.description || '',
      status: deriveProjectStatus(projectId, sprintDtos),
      createdAt: parseDate(projectDto.createdAt),
      createdBy: 'system',
      memberCount,
    };
  });
}

function mapSprints(
  sprintDtos: SprintResponseDto[],
  projectsById: Map<string, Project>,
  storiesBySprintId: Map<string, number>
): Sprint[] {
  return sprintDtos.map((sprintDto) => {
    const sprintId = String(sprintDto.id);
    const projectId = String(sprintDto.projectId);
    const velocity = sprintDto.velocity ?? 0;

    return {
      id: sprintId,
      name: sprintDto.name,
      projectId,
      projectName: projectsById.get(projectId)?.name || 'Unknown Project',
      status: normalizeSprintStatus(sprintDto.status),
      startDate: parseDate(sprintDto.startDate),
      endDate: parseDate(sprintDto.endDate),
      goal: velocity > 0 ? `Target velocity: ${velocity} points` : 'No sprint goal specified.',
      storyCount: storiesBySprintId.get(sprintId) ?? 0,
    };
  });
}

function mapActivities(
  activityDtos: ActivityResponseDto[],
  usersByEmail: Map<string, User>,
  projectsById: Map<string, Project>,
  sprintsById: Map<string, Sprint>,
  storiesById: Map<string, Story>
): Activity[] {
  const mapped = activityDtos.map((activityDto) => {
    const email = activityDto.userEmail || 'unknown@agiletrack.local';
    const normalizedEmail = email.toLowerCase();
    const user = usersByEmail.get(normalizedEmail);
    const targetId = activityDto.targetId || 'unknown';
    const entityType = mapActivityTargetType(activityDto.targetType);

    let entityName = targetId;
    if (entityType === 'PROJECT') {
      entityName = projectsById.get(targetId)?.name || targetId;
    }
    if (entityType === 'SPRINT') {
      entityName = sprintsById.get(targetId)?.name || targetId;
    }
    if (entityType === 'STORY') {
      entityName = storiesById.get(targetId)?.title || targetId;
    }

    return {
      id: String(activityDto.id),
      userId: user?.id || normalizedEmail,
      userName: user?.name || deriveDisplayName(email),
      userAvatar: user?.avatar,
      action: mapActionText(activityDto.actionType),
      entityType,
      entityId: targetId,
      entityName,
      timestamp: parseDate(activityDto.timestamp),
      details: activityDto.description,
    } satisfies Activity;
  });

  return mapped.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export async function fetchDomainSnapshot(token: string): Promise<DomainSnapshot> {
  const [projectDtos, sprintDtos, storyDtos] = await Promise.all([
    fetchCollection<ProjectResponseDto>('/api/v1/projects', token),
    fetchCollection<SprintResponseDto>('/api/v1/sprints', token),
    fetchCollection<StoryResponseDto>('/api/v1/stories', token),
  ]);

  const [activityDtos, userDtos] = await Promise.all([
    fetchCollection<ActivityResponseDto>('/api/v1/activities', token).catch(() => []),
    fetchCollection<UserResponseDto>('/api/v1/users', token).catch(() => []),
  ]);

  const users = mapUsers(userDtos);
  const usersByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]));

  const stories = mapStories(storyDtos, usersByEmail);
  const storiesBySprintId = new Map<string, number>();
  for (const story of stories) {
    if (!story.sprintId) {
      continue;
    }
    storiesBySprintId.set(story.sprintId, (storiesBySprintId.get(story.sprintId) ?? 0) + 1);
  }

  const projects = mapProjects(projectDtos, sprintDtos, stories);
  const projectsById = new Map(projects.map((project) => [project.id, project]));

  const sprints = mapSprints(sprintDtos, projectsById, storiesBySprintId);
  const sprintsById = new Map(sprints.map((sprint) => [sprint.id, sprint]));
  const storiesById = new Map(stories.map((story) => [story.id, story]));

  const activities = mapActivities(activityDtos, usersByEmail, projectsById, sprintsById, storiesById);

  return {
    projects,
    sprints,
    stories,
    activities,
    users,
  };
}

export async function createProject(input: CreateProjectInput, token: string): Promise<void> {
  await apiRequest<ProjectResponseDto>('/api/v1/projects', {
    method: 'POST',
    token,
    body: {
      name: input.name,
      description: input.description,
    },
  });
}

export async function createSprint(input: CreateSprintInput, token: string): Promise<void> {
  await apiRequest<SprintResponseDto>('/api/v1/sprints', {
    method: 'POST',
    token,
    body: {
      name: input.name,
      projectId: input.projectId,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
      velocity: typeof input.velocity === 'number' ? input.velocity : undefined,
    },
  });
}

export async function createStory(input: CreateStoryInput, token: string): Promise<void> {
  await apiRequest<StoryResponseDto>('/api/v1/stories', {
    method: 'POST',
    token,
    body: {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      storyPoints: typeof input.storyPoints === 'number' ? input.storyPoints : undefined,
      projectId: input.projectId,
      sprintId: isNonEmptyString(input.sprintId) ? input.sprintId : undefined,
      assigneeEmail: isNonEmptyString(input.assigneeEmail) ? input.assigneeEmail : undefined,
    },
  });
}

export async function updateSprint(
  sprintId: string,
  payload: UpdateSprintInput,
  token: string
): Promise<void> {
  await apiRequest<void>(`/api/v1/sprints/${sprintId}`, {
    method: 'PATCH',
    token,
    body: {
      name: payload.name,
      projectId: payload.projectId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status,
      velocity: typeof payload.velocity === 'number' ? payload.velocity : undefined,
    },
  });
}

export async function updateStory(
  storyId: string,
  payload: UpdateStoryInput,
  token: string
): Promise<void> {
  await apiRequest<void>(`/api/v1/stories/${storyId}`, {
    method: 'PATCH',
    token,
    body: {
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      storyPoints: typeof payload.storyPoints === 'number' ? payload.storyPoints : undefined,
      sprintId: payload.sprintId,
      assigneeEmail: payload.assigneeEmail,
    },
  });
}

export async function deleteProject(projectId: string, token: string): Promise<void> {
  await apiRequest<void>(`/api/v1/projects/${projectId}`, {
    method: 'DELETE',
    token,
  });
}

export async function deleteSprint(sprintId: string, token: string): Promise<void> {
  await apiRequest<void>(`/api/v1/sprints/${sprintId}`, {
    method: 'DELETE',
    token,
  });
}

export async function deleteStory(storyId: string, token: string): Promise<void> {
  await apiRequest<void>(`/api/v1/stories/${storyId}`, {
    method: 'DELETE',
    token,
  });
}

export async function patchProject(
  projectId: string,
  payload: UpdateProjectInput,
  token: string
): Promise<void> {
  await apiRequest<void>(`/api/v1/projects/${projectId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function patchSprintStatus(
  sprintId: string,
  status: SprintStatus,
  token: string
): Promise<void> {
  await apiRequest<void>(`/api/v1/sprints/${sprintId}`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export async function patchStoryStatus(
  storyId: string,
  status: StoryStatus,
  token: string
): Promise<void> {
  await apiRequest<void>(`/api/v1/stories/${storyId}`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}
