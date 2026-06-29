/**
 * map-error.ts — `toAppError(unknown)`: normalize ANY thrown value into a typed AppError.
 *
 * Governed by: docs/architecture/Architecture.md §9.1 (errors mapped at the HttpClient
 * boundary) and docs/Brain.md §11.
 *
 * WHY: catch-clauses, query/mutation callbacks, and error boundaries all receive
 * `unknown`. This single function is the chokepoint that converts axios errors, native
 * errors, strings, and anything else into the app's error taxonomy — so the rest of the
 * codebase only ever reasons about `AppError`.
 *
 * NOTE: we duck-type the axios error shape (status/code) rather than importing axios,
 * because `shared/errors` must not depend on a concrete HTTP library (Brain §4 — HTTP is
 * behind a port). The HttpClient adapter calls this from its response interceptor.
 */

import {
  AppError,
  NetworkError,
  NotFoundError,
  PermissionError,
  TimeoutError,
  UnexpectedError,
  ValidationError,
} from './app-error';

/** Minimal structural view of an axios-style error (no axios import). */
interface HttpLikeError {
  readonly code?: string;
  readonly message?: string;
  readonly response?: { readonly status?: number };
}

function isHttpLikeError(value: unknown): value is HttpLikeError {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('response' in value || 'code' in value) &&
    // axios errors are Error instances; this keeps plain objects out.
    value instanceof Error
  );
}

/** Map an HTTP status code to the right AppError subclass. */
function fromStatus(status: number, cause: unknown): AppError {
  if (status === 404) {
    return new NotFoundError('Resource not found', { status, cause });
  }
  if (status === 401) {
    return new AppError('UNAUTHORIZED', 'Unauthorized', {
      status,
      cause,
      userMessageKey: 'errors.unauthorized.message',
      isOperational: true,
    });
  }
  if (status === 403) {
    return new PermissionError('Permission denied', { status, cause });
  }
  if (status === 409) {
    return new AppError('CONFLICT', 'Conflict', {
      status,
      cause,
      userMessageKey: 'errors.conflict.message',
      isOperational: true,
    });
  }
  if (status === 422 || status === 400) {
    return new ValidationError('Request validation failed', { status, cause });
  }
  if (status >= 500) {
    return new AppError('SERVER', `Server error (${status})`, {
      status,
      cause,
      userMessageKey: 'errors.server.message',
      isOperational: true,
    });
  }
  return new UnexpectedError(`Unexpected HTTP status ${status}`, { status, cause });
}

/**
 * toAppError — convert any unknown thrown value into a typed AppError.
 * Idempotent: an AppError passes straight through.
 */
export function toAppError(value: unknown): AppError {
  if (value instanceof AppError) return value;

  if (isHttpLikeError(value)) {
    const status = value.response?.status;
    if (typeof status === 'number') {
      return fromStatus(status, value);
    }
    // No response → transport-level failure. Distinguish timeout from network.
    if (value.code === 'ECONNABORTED' || value.code === 'ETIMEDOUT') {
      return new TimeoutError('Request timed out', { cause: value });
    }
    return new NetworkError('Network request failed', { cause: value });
  }

  if (value instanceof Error) {
    return new UnexpectedError(value.message, { cause: value });
  }

  if (typeof value === 'string') {
    return new UnexpectedError(value);
  }

  return new UnexpectedError('An unknown error was thrown', { cause: value });
}
