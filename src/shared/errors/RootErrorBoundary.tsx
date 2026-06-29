/**
 * RootErrorBoundary.tsx — the app-wide error boundary (react-error-boundary wrapper).
 *
 * Governed by: docs/architecture/Architecture.md (provider hierarchy — sits high so it
 * catches render failures from every provider below it) and docs/Brain.md §11.
 *
 * WHY it exists & its position:
 *   - React render errors are otherwise fatal (blank screen). This boundary catches them
 *     and renders the localized, accessible <ErrorFallback/> with a retry path instead.
 *   - In the provider hierarchy it lives just under HelmetProvider and ABOVE Theme/I18n/
 *     Query so a failure anywhere in the tree still shows a recoverable screen. (i18n may
 *     not be ready yet at the very top — react-i18next degrades to the key/defaultValue,
 *     which is acceptable for a last-resort fallback.)
 *   - `onError` routes the technical error to the logger (PHI-free) for diagnostics; the
 *     user only ever sees the localized message.
 */

import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { createLogger } from '@shared/logger';

import { ErrorFallback } from './ErrorFallback';
import { toAppError } from './map-error';

const log = createLogger('error');

export interface RootErrorBoundaryProps {
  children: ReactNode;
}

/**
 * RootErrorBoundary — wraps the app subtree, logs caught errors via the logger port,
 * and renders <ErrorFallback/>. Reset clears the boundary so the subtree can re-mount.
 */
export function RootErrorBoundary({ children }: RootErrorBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        const appError = toAppError(error);
        // Log a PHI-free diagnostic record. componentStack is framework text, not PHI.
        log.error('Unhandled render error caught by RootErrorBoundary', appError, {
          code: appError.code,
          isOperational: appError.isOperational,
          componentStack: info.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
