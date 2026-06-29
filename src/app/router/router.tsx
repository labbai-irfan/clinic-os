/**
 * router.tsx — the application router (React Router v6 data router).
 *
 * Governed by: docs/architecture/Architecture.md §9.3 (CSR + code-split; route-level lazy)
 * and the Phase 3 spec (one root route → the "Foundation Ready" screen; errorElement wired
 * to shared/errors; NO business routes).
 *
 * WHY this shape:
 *   - `createBrowserRouter` enables the data-router API (loaders/actions/errorElement) the
 *     app will use later; we adopt it now so modules can register lazy route subtrees.
 *   - The root route lazy-loads the Foundation screen via `lazyWithRetry` to exercise the
 *     resilient code-splitting path every future route will use.
 *   - `errorElement` renders the shared ErrorFallback so a routing/loader error degrades to
 *     the same accessible, localized recovery UI as a render crash.
 */

import { Suspense } from 'react';
import { createBrowserRouter, useRouteError } from 'react-router-dom';

import { ErrorFallback } from '@shared/errors';
import { lazyWithRetry } from '@shared/lib/performance';

import { ROUTES } from './routes';

// Lazy root screen (code-split). Exercises lazyWithRetry on the very first route.
const WelcomeScreen = lazyWithRetry(() => import('../welcome/WelcomeScreen'));

/**
 * RouteSuspenseFallback — minimal token-driven, accessible fallback while a route chunk
 * loads. `role="status"` + aria-live announces the brief wait to screen readers.
 */
function RouteSuspenseFallback(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minBlockSize: '100vh',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span aria-hidden="true">…</span>
    </div>
  );
}

/**
 * RouteErrorElement — adapts a thrown route/loader error into the shared ErrorFallback.
 * Reset reloads the document (the data router has already torn down the subtree).
 */
function RouteErrorElement(): JSX.Element {
  const error = useRouteError();
  return (
    <ErrorFallback
      error={error}
      resetErrorBoundary={() => {
        if (typeof window !== 'undefined') window.location.assign(ROUTES.ROOT);
      }}
    />
  );
}

/**
 * The application router. One root route in this phase; modules add lazy subtrees later.
 *
 * The explicit `ReturnType<typeof createBrowserRouter>` annotation keeps the exported type
 * portable under pnpm's isolated store (avoids TS2742 naming the transitive @remix-run/router).
 */
export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <WelcomeScreen />
      </Suspense>
    ),
    errorElement: <RouteErrorElement />,
  },
]);
