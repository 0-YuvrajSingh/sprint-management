import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import type { ApiError } from "../types";

// ================================================================
// CONSTANTS
// ================================================================

// Single entry point — ALL requests go through the gateway.
// Gateway validates JWT and routes to the correct microservice.
// NEVER call a service port directly (8081, 8082, etc.)
const GATEWAY_URL = "http://localhost:8080";

const TOKEN_KEY = "sms_token"; // localStorage key — must match AuthContext

// ================================================================
// AXIOS INSTANCE
// ================================================================

const client = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds — fail fast rather than hang forever
});

// ================================================================
// REQUEST INTERCEPTOR
// Runs before EVERY request automatically.
// Reads token from localStorage and injects it as Bearer header.
// ================================================================

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================================================================
// RESPONSE INTERCEPTOR
// Runs after EVERY response automatically.
// Handles auth redirects and normalizes canonical backend errors.
// ================================================================

const toUiErrorMessage = (apiError: ApiError | undefined, status: number): string => {
  if (!apiError) {
    return `Request failed with status ${status}`;
  }

  const fieldMessage = apiError.fieldErrors?.[0]?.message;
  const baseMessage = apiError.message || fieldMessage || apiError.error || `Request failed with status ${status}`;

  if (apiError.code && apiError.traceId) {
    return `${baseMessage} (code: ${apiError.code}, trace: ${apiError.traceId})`;
  }

  if (apiError.code) {
    return `${baseMessage} (code: ${apiError.code})`;
  }

  if (apiError.traceId) {
    return `${baseMessage} (trace: ${apiError.traceId})`;
  }

  return baseMessage;
};

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("sms_user");
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    if (!error.response) {
      return Promise.reject(new Error("Cannot reach the server. Is the gateway running?"));
    }

    return Promise.reject(
      new Error(toUiErrorMessage(error.response.data, error.response.status))
    );
  }
);

export default client;

// ================================================================
// TOKEN HELPERS
// Used by AuthContext to save/clear the token.
// Centralised here so the key is never hardcoded elsewhere.
// ================================================================

export const tokenStorage = {
  save: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  get: ()               => localStorage.getItem(TOKEN_KEY),
  clear: ()             => localStorage.removeItem(TOKEN_KEY),

  // Decode JWT payload without verifying signature
  // Verification happens on the gateway — we just need the claims
  decode: (): { sub: string; role: string; exp: number } | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  },

  // Check if token exists and is not expired
  isValid: (): boolean => {
    const decoded = tokenStorage.decode();
    if (!decoded) return false;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  },
};
