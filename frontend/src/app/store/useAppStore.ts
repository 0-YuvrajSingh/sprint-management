import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    createProject as createProjectApi,
    createSprint as createSprintApi,
    createStory as createStoryApi,
    deleteProject as deleteProjectApi,
    deleteSprint as deleteSprintApi,
    deleteStory as deleteStoryApi,
    fetchDomainSnapshot,
    patchProject,
    patchSprintStatus,
    patchStoryStatus,
    updateSprint as updateSprintApi,
    updateStory as updateStoryApi,
} from '../services/domainApi';
import { Activity, Project, Sprint, Story, User } from '../types';

const ACCESS_TOKEN_KEY = 'agiletrack_access_token';

function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return 'Request failed. Please try again.';
}

const DEFAULT_USER: AppState['user'] = {
  id: '',
  name: 'User',
  email: '',
  role: 'VIEWER',
  avatar: '',
};

function createLocalActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Activity {
  return {
    ...activity,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date(),
  };
}

interface AppState {
  projects: Project[];
  sprints: Sprint[];
  stories: Story[];
  activities: Activity[];
  users: User[];
  isSyncing: boolean;
  syncError: string | null;
  lastSyncedForUser: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    notifications: boolean;
  };

  // Actions
  syncDomainData: (authUser: User | null) => Promise<void>;
  clearDomainData: () => void;
  completeSprint: (sprintId: string) => Promise<void>;
  updateStoryStatus: (storyId: string, status: Story['status']) => Promise<void>;
  updateProject: (projectId: string, data: Partial<Project>) => Promise<void>;
  createProject: (payload: { name: string; description: string }) => Promise<void>;
  createSprint: (payload: {
    name: string;
    projectId: string;
    startDate: string;
    endDate: string;
    status?: Sprint['status'];
    velocity?: number;
  }) => Promise<void>;
  createStory: (payload: {
    title: string;
    description: string;
    status: Story['status'];
    priority: Story['priority'];
    storyPoints?: number;
    projectId: string;
    sprintId?: string;
    assigneeEmail?: string;
  }) => Promise<void>;
  updateSprint: (payload: {
    id: string;
    name: string;
    projectId: string;
    startDate: string;
    endDate: string;
    status: Sprint['status'];
    velocity?: number;
  }) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  deleteSprint: (sprintId: string) => Promise<void>;
  updateStory: (payload: {
    id: string;
    title: string;
    description: string;
    status: Story['status'];
    priority: Story['priority'];
    storyPoints?: number;
    sprintId?: string;
    assigneeEmail?: string;
  }) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  updateUser: (data: Partial<AppState['user']>) => void;
  updateSettings: (data: Partial<AppState['settings']>) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const requireAccessToken = (): string => {
        const token = getStoredAccessToken();
        if (!token) {
          throw new Error('Session expired. Please log in again.');
        }
        return token;
      };

      const refreshDomainSnapshot = async (token: string): Promise<void> => {
        const snapshot = await fetchDomainSnapshot(token);
        set((state) => ({
          projects: snapshot.projects,
          sprints: snapshot.sprints,
          stories: snapshot.stories,
          activities: snapshot.activities,
          users: snapshot.users,
          isSyncing: false,
          syncError: null,
          lastSyncedForUser: state.lastSyncedForUser,
        }));
      };

      return {
      projects: [],
      sprints: [],
      stories: [],
      activities: [],
      users: [],
      isSyncing: false,
      syncError: null,
      lastSyncedForUser: null,
      user: DEFAULT_USER,
      settings: {
        theme: 'system',
        compactMode: false,
        notifications: true,
      },

      syncDomainData: async (authUser) => {
        if (!authUser) {
          get().clearDomainData();
          return;
        }

        set((state) => ({
          isSyncing: true,
          syncError: null,
          user: {
            ...state.user,
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            role: authUser.role,
            avatar: authUser.avatar || state.user.avatar,
          },
        }));

        const token = getStoredAccessToken();
        if (!token) {
          set({
            isSyncing: false,
            syncError: 'Session expired. Please log in again.',
            lastSyncedForUser: null,
          });
          return;
        }

        try {
          const snapshot = await fetchDomainSnapshot(token);
          set((state) => ({
            projects: snapshot.projects,
            sprints: snapshot.sprints,
            stories: snapshot.stories,
            activities: snapshot.activities,
            users: snapshot.users,
            isSyncing: false,
            syncError: null,
            lastSyncedForUser: authUser.id,
            user: {
              ...state.user,
              id: authUser.id,
              name: authUser.name,
              email: authUser.email,
              role: authUser.role,
              avatar: authUser.avatar || state.user.avatar,
            },
          }));
        } catch (error) {
          set({
            isSyncing: false,
            syncError: toErrorMessage(error),
            lastSyncedForUser: null,
          });
        }
      },

      createProject: async (payload) => {
        set({ isSyncing: true, syncError: null });

        try {
          const token = requireAccessToken();
          await createProjectApi(payload, token);
          await refreshDomainSnapshot(token);
        } catch (error) {
          set({
            isSyncing: false,
            syncError: toErrorMessage(error),
          });
          throw error;
        }
      },

      createSprint: async (payload) => {
        set({ isSyncing: true, syncError: null });

        try {
          const token = requireAccessToken();
          await createSprintApi(payload, token);
          await refreshDomainSnapshot(token);
        } catch (error) {
          set({
            isSyncing: false,
            syncError: toErrorMessage(error),
          });
          throw error;
        }
      },

      createStory: async (payload) => {
        set({ isSyncing: true, syncError: null });

        try {
          const token = requireAccessToken();
          await createStoryApi(payload, token);
          await refreshDomainSnapshot(token);
        } catch (error) {
          set({
            isSyncing: false,
            syncError: toErrorMessage(error),
          });
          throw error;
        }
      },

      updateSprint: async (payload) => {
        set({ isSyncing: true, syncError: null });

        try {
          const token = requireAccessToken();
          await updateSprintApi(
            payload.id,
            {
              name: payload.name,
              projectId: payload.projectId,
              startDate: payload.startDate,
              endDate: payload.endDate,
              status: payload.status,
              velocity: payload.velocity,
            },
            token
          );
          await refreshDomainSnapshot(token);
        } catch (error) {
          set({
            isSyncing: false,
            syncError: toErrorMessage(error),
          });
          throw error;
        }
      },

      deleteProject: async (projectId) => {
        set({ isSyncing: true, syncError: null });

        try {
          const token = requireAccessToken();
          await deleteProjectApi(projectId, token);
          await refreshDomainSnapshot(token);
        } catch (error) {
          set({
            isSyncing: false,
            syncError: toErrorMessage(error),
          });
          throw error;
        }
      },

      deleteSprint: async (sprintId) => {
        set({ isSyncing: true, syncError: null });

        try {
          const token = requireAccessToken();
          await deleteSprintApi(sprintId, token);
          await refreshDomainSnapshot(token);
        } catch (error) {
          set({
            isSyncing: false,
            syncError: toErrorMessage(error),
          });
          throw error;
        }
      },

      updateStory: async (payload) => {
        set({ isSyncing: true, syncError: null });

        try {
          const token = requireAccessToken();
          await updateStoryApi(
            payload.id,
            {
              title: payload.title,
              description: payload.description,
              status: payload.status,
              priority: payload.priority,
              storyPoints: payload.storyPoints,
              sprintId: payload.sprintId,
              assigneeEmail: payload.assigneeEmail,
            },
            token
          );
          await refreshDomainSnapshot(token);
        } catch (error) {
          set({
            isSyncing: false,
            syncError: toErrorMessage(error),
          });
          throw error;
        }
      },

      deleteStory: async (storyId) => {
        set({ isSyncing: true, syncError: null });

        try {
          const token = requireAccessToken();
          await deleteStoryApi(storyId, token);
          await refreshDomainSnapshot(token);
        } catch (error) {
          set({
            isSyncing: false,
            syncError: toErrorMessage(error),
          });
          throw error;
        }
      },

      clearDomainData: () =>
        set({
          projects: [],
          sprints: [],
          stories: [],
          activities: [],
          users: [],
          isSyncing: false,
          syncError: null,
          lastSyncedForUser: null,
          user: DEFAULT_USER,
        }),

      completeSprint: async (sprintId) => {
        const sprintBeforeUpdate = get().sprints.find((sprint) => sprint.id === sprintId);
        if (!sprintBeforeUpdate) {
          return;
        }

        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === sprintId ? { ...sprint, status: 'COMPLETED' as const } : sprint
          ),
          activities: [
            createLocalActivity({
              userId: state.user.id,
              userName: state.user.name,
              userAvatar: state.user.avatar,
              action: 'completed sprint',
              entityType: 'SPRINT',
              entityId: sprintId,
              entityName: sprintBeforeUpdate.name,
            }),
            ...state.activities,
          ],
        }));

        const token = getStoredAccessToken();
        if (!token) {
          return;
        }

        try {
          await patchSprintStatus(sprintId, 'COMPLETED', token);
        } catch (error) {
          set((state) => ({
            sprints: state.sprints.map((sprint) =>
              sprint.id === sprintId ? sprintBeforeUpdate : sprint
            ),
            syncError: toErrorMessage(error),
          }));
          throw error;
        }
      },

      updateStoryStatus: async (storyId, status) => {
        const storyBeforeUpdate = get().stories.find((story) => story.id === storyId);
        if (!storyBeforeUpdate) {
          return;
        }

        set((state) => ({
          stories: state.stories.map((story) =>
            story.id === storyId ? { ...story, status } : story
          ),
          activities: [
            createLocalActivity({
              userId: state.user.id,
              userName: state.user.name,
              userAvatar: state.user.avatar,
              action: 'updated',
              entityType: 'STORY',
              entityId: storyId,
              entityName: storyBeforeUpdate.title,
              details: `Moved to ${status.replace('_', ' ')}`,
            }),
            ...state.activities,
          ],
        }));

        const token = getStoredAccessToken();
        if (!token) {
          return;
        }

        try {
          await patchStoryStatus(storyId, status, token);
        } catch (error) {
          set((state) => ({
            stories: state.stories.map((story) =>
              story.id === storyId ? storyBeforeUpdate : story
            ),
            syncError: toErrorMessage(error),
          }));
          throw error;
        }
      },

      updateProject: async (projectId, data) => {
        const projectBeforeUpdate = get().projects.find((project) => project.id === projectId);
        if (!projectBeforeUpdate) {
          return;
        }

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId ? { ...project, ...data } : project
          ),
        }));

        const token = getStoredAccessToken();
        if (!token) {
          return;
        }

        const projectAfterUpdate = get().projects.find((project) => project.id === projectId) || projectBeforeUpdate;

        try {
          await patchProject(
            projectId,
            {
              name: projectAfterUpdate.name,
              description: projectAfterUpdate.description,
            },
            token
          );
        } catch (error) {
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === projectId ? projectBeforeUpdate : project
            ),
            syncError: toErrorMessage(error),
          }));
          throw error;
        }
      },

      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
          users: state.users.map((user) =>
            user.id === state.user.id
              ? {
                  ...user,
                  name: data.name ?? user.name,
                  email: data.email ?? user.email,
                }
              : user
          ),
        })),

      updateSettings: (data) =>
        set((state) => ({
          settings: { ...state.settings, ...data },
        })),

      addActivity: (activity) =>
        set((state) => ({
          activities: [
            createLocalActivity(activity),
            ...state.activities,
          ],
        })),
    };
  },
    {
      name: 'agiletrack-storage',
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
      }),
    }
  )
);
