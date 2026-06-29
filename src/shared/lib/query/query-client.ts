/**
 * query-client.ts — the TanStack Query client factory for ClinicOS.
 *
 * Governed by: docs/Brain.md §9 (TanStack Query is the ONLY home for server state) and
 * §11 (the four async states). Server data NEVER lives in Zustand.
 *
 * WHY a factory (not a module-level singleton):
 *   - Tests and the providers create isolated clients; a factory avoids shared cache bleed
 *     between test cases and lets the app own a single instance in QueryProvider.
 *
 * Defaults rationale:
 *   - staleTime: data is fresh for a while to avoid refetch storms on a calm clinical UI.
 *   - gcTime: cached a bit longer than stale so back-navigation is instant.
 *   - retry: DO NOT retry 4xx (client errors won't fix themselves and 401/403/404 retries
 *     waste time / hammer the server); retry transient 5xx/network a couple of times.
 *   - refetchOnWindowFocus: false — calm by default (Brain §2); no surprise refetches.
 *   - queryCache/mutationCache onError → logger (PHI-free) so failures are observable.
 */

import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { toAppError } from '@shared/errors';
import { createLogger } from '@shared/logger';

const log = createLogger('api');

/** Max automatic retries for transient (non-4xx) failures. */
const MAX_RETRIES = 2;
const STALE_TIME_MS = 60_000; // 1 minute fresh
const GC_TIME_MS = 5 * 60_000; // 5 minutes in cache

/**
 * shouldRetry — retry transient failures only. Any 4xx (client error, incl. 401/403/404)
 * is terminal and never retried.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  const appError = toAppError(error);
  const status = appError.status;
  if (typeof status === 'number' && status >= 400 && status < 500) return false;
  return true;
}

/**
 * createQueryClient — build a QueryClient with ClinicOS defaults and cache-level error
 * logging. The app creates one in QueryProvider; tests create throwaway instances.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false, // mutations are not idempotent by default — never auto-retry.
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        const appError = toAppError(error);
        log.error('Query failed', appError, {
          code: appError.code,
          status: appError.status,
          queryHash: query.queryHash, // structural key, not data — PHI-free.
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const appError = toAppError(error);
        log.error('Mutation failed', appError, {
          code: appError.code,
          status: appError.status,
          mutationKey: mutation.options.mutationKey ?? null,
        });
      },
    }),
  });
}
