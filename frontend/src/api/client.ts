import type { ApiErrorResponse } from "./types";

const DEFAULT_API_BASE_URL = "http://localhost:8080/api/v1";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");

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
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
