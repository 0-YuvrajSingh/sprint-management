import type { ApiErrorResponse } from "./types";

const GATEWAY = (import.meta.env.VITE_GATEWAY_URL as string | undefined) ?? "http://localhost:8080";
export const API_BASE_URLS = {
  projects:   `${GATEWAY}/api/projects`,
  sprints:    `${GATEWAY}/api/sprints`,
  users:      `${GATEWAY}/api/users`,
  stories:    `${GATEWAY}/api/stories`,
  auth:       `${GATEWAY}/auth`,
  activities: `${GATEWAY}/api/activities`,
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
  const token = localStorage.getItem("sm_token");
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    localStorage.removeItem("sm_token");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

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
