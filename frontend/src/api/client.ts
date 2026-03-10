import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
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
// Handles 401 (expired token) and normalises error shape.
// ================================================================

client.interceptors.response.use(
  // Success — just return the response as-is
  (response) => response,

  // Error — normalise into a consistent shape
  (error: AxiosError<ApiError>) => {
    // Token expired or invalid — clear storage and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("sms_user");
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    // 403 — user is authenticated but lacks the required role
    if (error.response?.status === 403) {
      return Promise.reject(new Error("You don't have permission to do that."));
    }

    // Backend returned a structured error (GlobalExceptionHandler shape)
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }

    // Network error — gateway unreachable
    if (!error.response) {
      return Promise.reject(new Error("Cannot reach the server. Is the gateway running?"));
    }

    // Fallback
    return Promise.reject(new Error(`Request failed with status ${error.response.status}`));
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
