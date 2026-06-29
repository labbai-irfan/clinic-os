/**
 * shared/errors — public API barrel.
 * Governed by docs/Brain.md §11. Import the error taxonomy, the mapper, and the
 * boundary/fallback from here; never reach past this index.
 */
export type { AppErrorCode, AppErrorOptions } from './app-error';
export {
  AppError,
  isAppError,
  NetworkError,
  NotFoundError,
  PermissionError,
  TimeoutError,
  UnexpectedError,
  ValidationError,
} from './app-error';
export type { ErrorFallbackProps } from './ErrorFallback';
export { ErrorFallback } from './ErrorFallback';
export { toAppError } from './map-error';
export type { RootErrorBoundaryProps } from './RootErrorBoundary';
export { RootErrorBoundary } from './RootErrorBoundary';
