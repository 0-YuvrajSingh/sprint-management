import axios, { AxiosError } from "axios";
import { clearStoredToken, getStoredToken } from "@/shared/lib/auth-storage";
import type { ApiErrorPayload, NormalizedApiError } from "@/shared/types/api";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

function normalizeApiError(error: AxiosError<ApiErrorPayload>): NormalizedApiError {
  const payload = error.response?.data;
  const normalized = new Error(payload?.message || error.message || DEFAULT_ERROR_MESSAGE) as NormalizedApiError;

  normalized.status = error.response?.status ?? 500;
  normalized.code = payload?.code;
  normalized.path = payload?.path;
  normalized.fieldErrors = payload?.fieldErrors ?? [];
  normalized.traceId = payload?.traceId;

  return normalized;
}

export const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const normalized = normalizeApiError(error);

    if (normalized.status === 401 && typeof window !== "undefined") {
      clearStoredToken();

      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(normalized);
  },
);
