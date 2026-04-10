const DEFAULT_API_BASE_URL = 'http://localhost:8080';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: JsonValue;
  token?: string;
}

function normalizeUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const prefix = path.startsWith('/') ? '' : '/';
  return `${API_BASE_URL}${prefix}${path}`;
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const errorPayload = payload as Record<string, unknown>;
    if (typeof errorPayload.message === 'string' && errorPayload.message.trim()) {
      return errorPayload.message;
    }
    if (typeof errorPayload.error === 'string' && errorPayload.error.trim()) {
      return errorPayload.error;
    }
  }

  if (status === 401) {
    return 'Authentication failed.';
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }

  return 'Request failed. Please try again.';
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const requestHeaders = new Headers(headers || {});
  requestHeaders.set('Accept', 'application/json');

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(normalizeUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: requestBody,
  });

  const contentType = response.headers.get('content-type') || '';
  const hasJsonBody = contentType.includes('application/json');

  let payload: unknown = null;
  if (response.status !== 204) {
    payload = hasJsonBody ? await response.json().catch(() => null) : await response.text().catch(() => null);
  }

  if (!response.ok) {
    const message = extractErrorMessage(payload, response.status);
    const code = payload && typeof payload === 'object' ? (payload as Record<string, unknown>).code as string | undefined : undefined;
    throw new ApiError(message, response.status, code);
  }

  return payload as T;
}
