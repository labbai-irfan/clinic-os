/**
 * shared/logger — public API barrel.
 * Governed by docs/Brain.md §4. Consume the logging port from here; never import
 * the adapter file directly outside this folder.
 */
export type { LogCategory, LogContext, LoggerPort, LogLevel } from './logger';
export { ConsoleLoggerAdapter, createLogger, logger, redact } from './logger';
