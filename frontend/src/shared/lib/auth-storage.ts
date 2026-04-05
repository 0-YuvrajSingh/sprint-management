import { getInitials } from "@/shared/lib/format";

const AUTH_TOKEN_KEY = "agiletrack.jwt";

interface DecodedJwt {
  sub?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

export interface AuthUser {
  email: string;
  role: string;
  initials: string;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = atob(padded);

  return decodeURIComponent(
    decoded
      .split("")
      .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}

export function decodeToken(token: string): DecodedJwt | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    return JSON.parse(decodeBase64Url(payload)) as DecodedJwt;
  } catch {
    return null;
  }
}

export function toAuthUser(token: string): AuthUser | null {
  const decoded = decodeToken(token);
  if (!decoded?.sub || !decoded.role) {
    return null;
  }

  return {
    email: decoded.sub,
    role: decoded.role,
    initials: getInitials(decoded.sub),
  };
}

export function isTokenExpired(token: string) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) {
    return true;
  }

  return decoded.exp * 1000 <= Date.now();
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function storeToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}
