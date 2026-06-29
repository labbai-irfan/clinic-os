/**
 * logger.ts — the ClinicOS logging port + console adapter.
 *
 * Governed by: docs/Brain.md §4 (errors/monitoring "behind an abstraction") and the
 * spec's "no PHI in logs" rule. This is a `shared/` primitive: it imports only the
 * env config and knows nothing about the domain.
 *
 * WHY a port (not console.* directly):
 *   - UI/feature code logs through a stable interface, so we can later swap the
 *     console adapter for a Sentry/OpenTelemetry adapter (Brain §4) with zero call-site
 *     changes.
 *   - Levels are gated centrally from env.VITE_LOG_LEVEL (fail-safe in production).
 *   - Category child loggers tag every line so logs are filterable by subsystem.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * NEVER LOG PHI. ClinicOS handles Protected Health Information (patient names, DOB,
 * diagnoses, contact details, identifiers, free-text notes). PHI must NEVER reach a
 * log sink — not in messages, not in context objects, not in error payloads.
 *   - Log identifiers that are safe and useful for debugging (request-id, status code,
 *     error code, route name) — never the patient-identifying values themselves.
 *   - The `redact()` helper below is a defensive last line: it strips a denylist of
 *     known-sensitive keys from any context object before it is emitted. It is NOT a
 *     license to pass PHI — it is a guard against accidental leakage. Treat any PHI in
 *     a log as a Sev-1 incident.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { env } from '@shared/config';

/** Severity levels, ordered low → high. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Subsystem categories — every log line is tagged with one (spec). */
export type LogCategory =
  | 'app'
  | 'api'
  | 'navigation'
  | 'performance'
  | 'error'
  | 'analytics'
  | 'dev';

/** Arbitrary structured context attached to a log line (must be PHI-free). */
export type LogContext = Record<string, unknown>;

/**
 * LoggerPort — the stable logging contract consumed across the app.
 * Adapters (console today; Sentry/OTel tomorrow) implement this interface.
 */
export interface LoggerPort {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: unknown, context?: LogContext): void;
  /** Returns a child logger that tags every line with `category`. */
  child(category: LogCategory): LoggerPort;
}

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Keys that frequently carry PHI or secrets. Stripped from context objects before
 * they are emitted. Defensive only — do not rely on this to "sanitize" PHI you
 * intentionally pass. Matching is case-insensitive and substring-based.
 */
const REDACT_KEY_PATTERNS = [
  'name',
  'firstname',
  'lastname',
  'patient',
  'dob',
  'birth',
  'phone',
  'mobile',
  'email',
  'address',
  'ssn',
  'aadhaar',
  'mrn',
  'diagnosis',
  'note',
  'token',
  'password',
  'secret',
  'authorization',
];

const REDACTED = '[REDACTED]';

/**
 * redact() — shallow-strips known-sensitive keys from a context object so that an
 * accidental PHI/secret leak never reaches the sink. Returns a new object; never
 * mutates the input.
 */
export function redact(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;
  const out: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    const lower = key.toLowerCase();
    out[key] = REDACT_KEY_PATTERNS.some((p) => lower.includes(p)) ? REDACTED : value;
  }
  return out;
}

/**
 * ConsoleLoggerAdapter — the default LoggerPort implementation. Writes to the
 * browser console, gated by the configured minimum level, with a category tag and
 * a redacted context payload.
 */
export class ConsoleLoggerAdapter implements LoggerPort {
  private readonly minWeight: number;

  constructor(
    private readonly minLevel: LogLevel,
    private readonly category: LogCategory = 'app',
  ) {
    this.minWeight = LEVEL_WEIGHT[minLevel];
  }

  child(category: LogCategory): LoggerPort {
    return new ConsoleLoggerAdapter(this.minLevel, category);
  }

  debug(message: string, context?: LogContext): void {
    this.emit('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.emit('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.emit('warn', message, context);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    if (!this.enabled('error')) return;
    // Error objects are logged by reference (stack preserved); context is redacted.
    // Callers MUST NOT place PHI inside the error message or context.
    const payload = redact(context);

    console.error(this.prefix('error'), message, ...this.tail(error, payload));
  }

  private enabled(level: LogLevel): boolean {
    return LEVEL_WEIGHT[level] >= this.minWeight;
  }

  private prefix(level: LogLevel): string {
    return `[${level.toUpperCase()}][${this.category}]`;
  }

  private tail(error: unknown, context?: LogContext): unknown[] {
    const parts: unknown[] = [];
    if (error !== undefined) parts.push(error);
    if (context && Object.keys(context).length > 0) parts.push(context);
    return parts;
  }

  private emit(level: Exclude<LogLevel, 'error'>, message: string, context?: LogContext): void {
    if (!this.enabled(level)) return;
    const payload = redact(context);

    console[level](this.prefix(level), message, ...this.tail(undefined, payload));
  }
}

/** The app-wide root logger, gated by env.VITE_LOG_LEVEL. */
export const logger: LoggerPort = new ConsoleLoggerAdapter(env.VITE_LOG_LEVEL, 'app');

/**
 * createLogger — convenience factory for a category-scoped child logger.
 * @example const log = createLogger('api');
 */
export function createLogger(category: LogCategory): LoggerPort {
  return logger.child(category);
}
