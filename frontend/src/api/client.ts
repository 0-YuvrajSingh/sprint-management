import type { ApiErrorResponse } from "./types";

>const DEFAULT_PROJECT_API_BASE_URL = "http://localhost:8081/api/v1";
const DEFAULT_SPRINT_API_BASE_URL = "http://localhost:8082/api/v1";
const DEFAULT_USER_API_BASE_URL = "http://localhost:8083/api/v1";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export const API_BASE_URLS = {
  projects: normalizeBaseUrl(import.meta.env.VITE_PROJECT_API_BASE_URL ?? DEFAULT_PROJECT_API_BASE_URL),
  sprints: normalizeBaseUrl(import.meta.env.VITE_SPRINT_API_BASE_URL ?? DEFAULT_SPRINT_API_BASE_URL),
  users: normalizeBaseUrl(import.meta.env.VITE_USER_API_BASE_URL ?? DEFAULT_USER_API_BASE_URL),
} as const;

function getErrorMessage(payload: ApiErrorResponse | string | null, fallback: string): string {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === "string") {
    return payload;
  }

  return payload.message ?? payload.error ?? fallback;
}

export async function apiRequest<TResponse>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const rawBody = await response.text();
  let payload: ApiErrorResponse | TResponse | string | null = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as ApiErrorResponse | TResponse;
    } catch {
      payload = rawBody;
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload as ApiErrorResponse | string | null, `Request failed: ${response.status}`));
  }

  return payload as TResponse;
}
