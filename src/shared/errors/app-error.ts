/**
 * app-error.ts — the ClinicOS error taxonomy.
 *
 * Governed by: docs/Brain.md §11 (the Error async state: "typed AppError, human message
 * (localized), retry path") and docs/architecture/Architecture.md §9.1 (errors mapped at
 * the HttpClient boundary).
 *
 * WHY a taxonomy (not raw Error / strings):
 *   - Every failure that reaches the UI is a typed `AppError` carrying a machine `code`,
 *     an `isOperational` flag (expected vs. programmer bug), and a `userMessageKey` — an
 *     i18n key, never a literal human string (Brain §8). The UI shows `t(userMessageKey)`.
 *   - Subclasses let surfaces branch on failure kind (e.g. show a different empty/retry
 *     treatment for NotFound vs. Network) without string-sniffing.
 *
 * Raw backend payloads are mapped into these types ONCE, at the HttpClient boundary,
 * by map-error.ts — components never see axios errors, fetch errors, or DTO shapes.
 */

/** Stable machine codes (string union) — safe to log, safe to switch on. */
export type AppErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'PERMISSION'
  | 'UNAUTHORIZED'
  | 'CONFLICT'
  | 'SERVER'
  | 'UNEXPECTED';

export interface AppErrorOptions {
  /** i18n key for the human-facing message (NEVER a literal string). */
  userMessageKey?: string;
  /** Expected/handled failure (true) vs. a bug we did not anticipate (false). */
  isOperational?: boolean;
  /** HTTP status code when the error originated from a response. */
  status?: number;
  /** The original error/cause, preserved for logging (must be PHI-free). */
  cause?: unknown;
  /** Safe, structured, PHI-free context for diagnostics. */
  context?: Record<string, unknown>;
}

/**
 * AppError — the base type every ClinicOS failure narrows to. Carries a stable code,
 * an i18n message key, and an operational flag. Extends the native Error so stacks and
 * `instanceof` keep working.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessageKey: string;
  readonly isOperational: boolean;
  readonly status: number | undefined;
  readonly context: Record<string, unknown> | undefined;

  constructor(
    code: AppErrorCode,
    /** Developer-facing message (English, for logs/stack — NOT shown to users). */
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.code = code;
    this.userMessageKey = options.userMessageKey ?? 'errors.unexpected.message';
    this.isOperational = options.isOperational ?? true;
    this.status = options.status;
    this.context = options.context;
    // Restore prototype chain (TS target lib quirk with extending Error).
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Connectivity failure — no response received (offline, DNS, CORS, refused). */
export class NetworkError extends AppError {
  constructor(message = 'Network request failed', options: AppErrorOptions = {}) {
    super('NETWORK', message, {
      userMessageKey: 'errors.network.message',
      isOperational: true,
      ...options,
    });
  }
}

/** The request exceeded the configured timeout. */
export class TimeoutError extends AppError {
  constructor(message = 'Request timed out', options: AppErrorOptions = {}) {
    super('TIMEOUT', message, {
      userMessageKey: 'errors.timeout.message',
      isOperational: true,
      ...options,
    });
  }
}

/** Boundary validation failed (e.g. a Zod DTO parse at the response boundary). */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', options: AppErrorOptions = {}) {
    super('VALIDATION', message, {
      userMessageKey: 'errors.validation.message',
      isOperational: true,
      ...options,
    });
  }
}

/** The requested resource does not exist (HTTP 404). */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', options: AppErrorOptions = {}) {
    super('NOT_FOUND', message, {
      userMessageKey: 'errors.notFound.message',
      isOperational: true,
      status: 404,
      ...options,
    });
  }
}

/** Authenticated but not allowed (HTTP 403). */
export class PermissionError extends AppError {
  constructor(message = 'Permission denied', options: AppErrorOptions = {}) {
    super('PERMISSION', message, {
      userMessageKey: 'errors.permission.message',
      isOperational: true,
      status: 403,
      ...options,
    });
  }
}

/** Unexpected/unhandled failure — treated as a bug (non-operational by default). */
export class UnexpectedError extends AppError {
  constructor(message = 'An unexpected error occurred', options: AppErrorOptions = {}) {
    super('UNEXPECTED', message, {
      userMessageKey: 'errors.unexpected.message',
      isOperational: false,
      ...options,
    });
  }
}

/** Narrowing type guard. */
export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
