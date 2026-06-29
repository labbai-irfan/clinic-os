/**
 * QueryProvider.tsx — provides the TanStack Query client to the tree.
 *
 * Governed by: docs/architecture/Architecture.md (provider hierarchy) and docs/Brain.md §9
 * (TanStack Query is the ONLY home for server state).
 *
 * WHY it exists & its position:
 *   - It sits UNDER I18nProvider (so query-driven UI can localize) and ABOVE the Auth
 *     placeholder / Notifications / Overlays / Router, because data hooks are used
 *     throughout those layers.
 *   - It owns the single app QueryClient (built from shared/lib/query with ClinicOS
 *     defaults) and mounts the React Query Devtools in development only.
 *   - The QueryClient is created once via useState's lazy initializer so it survives
 *     re-renders and StrictMode's double-invoke without losing the cache.
 *
 * Persistence note: the query cache will be persisted to storage in the offline phase
 * (Brain §10) by wrapping this with PersistQueryClientProvider; the dependency is already
 * declared. The hook is intentionally left as a comment to keep this phase free of offline
 * concerns.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode, useState } from 'react';

import { createQueryClient } from '@shared/lib/query';

const isDev = import.meta.env.DEV;

export interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider — owns the app QueryClient and (in dev) the Devtools.
 */
export function QueryProvider({ children }: QueryProviderProps): JSX.Element {
  // Lazy init → one client for the app's lifetime, StrictMode-safe.
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools are tree-shaken out of production builds (gated on import.meta.env.DEV). */}
      {isDev ? <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" /> : null}
    </QueryClientProvider>
  );
}
