import { Role, User } from '../types';
import { apiRequest } from './http';

type AuthPayload = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
};

type JwtClaims = {
  sub?: string;
  email?: string;
  role?: string;
  type?: string;
  exp?: number;
  iat?: number;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

const ROLE_FALLBACK: Role = 'VIEWER';

export function normalizeRole(role: string | undefined): Role {
  const value = (role || '').toUpperCase();
  if (value === 'ADMIN' || value === 'MANAGER' || value === 'DEVELOPER' || value === 'VIEWER') {
    return value;
  }
  if (value === 'USER') {
    return 'VIEWER';
  }
  return ROLE_FALLBACK;
}

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return atob(padded);
}

export function decodeJwtClaims(token: string): JwtClaims {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {};
    }

    const payload = decodeBase64Url(parts[1]);
    return JSON.parse(payload) as JwtClaims;
  } catch {
    return {};
  }
}

export function isTokenExpired(token: string, leewaySeconds = 15): boolean {
  const claims = decodeJwtClaims(token);
  if (!claims.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return claims.exp <= now + leewaySeconds;
}

function deriveDisplayName(email: string): string {
  const localPart = email.split('@')[0] || 'User';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function buildAvatarSeed(email: string): number {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 70) + 1;
}

export function buildUserFromAccessToken(accessToken: string, fallback?: Partial<User>): User {
  const claims = decodeJwtClaims(accessToken);
  const email = claims.email || fallback?.email || 'unknown@agiletrack.local';
  const name = fallback?.name || deriveDisplayName(email);
  const id = claims.sub || fallback?.id || `session-${Date.now()}`;

  return {
    id,
    name,
    email,
    role: normalizeRole(claims.role || fallback?.role),
    createdAt: fallback?.createdAt || new Date(),
    avatar:
      fallback?.avatar ||
      `https://i.pravatar.cc/150?img=${buildAvatarSeed(email)}`,
  };
}

function extractAuthSession(payload: AuthPayload): AuthSession {
  const accessToken = payload.accessToken || payload.token;
  const refreshToken = payload.refreshToken;

  if (!accessToken || !refreshToken) {
    throw new Error('Authentication response is missing required tokens.');
  }

  return { accessToken, refreshToken };
}

export async function loginRequest(email: string, password: string): Promise<AuthSession> {
  const payload = await apiRequest<AuthPayload>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  return extractAuthSession(payload);
}

export async function registerRequest(name: string, email: string, password: string): Promise<void> {
  await apiRequest<void>('/api/v1/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export async function refreshRequest(refreshToken: string): Promise<AuthSession> {
  const payload = await apiRequest<AuthPayload>('/api/v1/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });

  return extractAuthSession(payload);
}

export async function logoutRequest(accessToken: string, refreshToken: string): Promise<void> {
  await apiRequest<void>('/api/v1/auth/logout', {
    method: 'POST',
    token: accessToken,
    body: { refreshToken },
  });
}
