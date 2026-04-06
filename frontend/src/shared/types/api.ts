export interface PageableResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  code?: string;
  fieldErrors?: FieldError[];
  traceId?: string;
}

export interface NormalizedApiError extends Error {
  status: number;
  code?: string;
  path?: string;
  fieldErrors: FieldError[];
  traceId?: string;
}
