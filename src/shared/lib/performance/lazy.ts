/**
 * lazy.ts — resilient code-splitting helpers.
 *
 * Governed by: docs/architecture/Architecture.md §9.3/§10 (route- and module-level lazy
 * loading; performance is architectural).
 *
 * WHY:
 *   - `React.lazy` rejects permanently if a chunk fails to load — common after a new
 *     deploy invalidates an old chunk hash while a user has a stale tab open. A single
 *     failure then bricks navigation until a full reload.
 *   - `lazyWithRetry` retries the dynamic import a few times (transient network/CDN blips)
 *     and, as a last resort, triggers a one-time hard reload to fetch the fresh manifest —
 *     so a deploy never strands a user on a white screen.
 *   - `preload` lets us warm a chunk on intent (hover/route-prefetch) for instant nav.
 */

import { type ComponentType, lazy, type LazyExoticComponent } from 'react';

import { createLogger } from '@shared/logger';

const log = createLogger('performance');

/** A dynamic import that resolves to a module with a default-exported component. */
export type ComponentImport<T extends ComponentType<unknown>> = () => Promise<{ default: T }>;

const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 300;
const RELOAD_FLAG_PREFIX = 'clinicos:chunk-reload:';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * loadWithRetry — attempt a dynamic import with a few retries; on total failure perform a
 * single hard reload (guarded by sessionStorage so we never loop) to pick up the new build.
 */
async function loadWithRetry<T extends ComponentType<unknown>>(
  factory: ComponentImport<T>,
  retriesLeft: number,
  retryKey: string,
): Promise<{ default: T }> {
  try {
    const mod = await factory();
    // Success — clear any prior reload guard for this chunk.
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(retryKey);
    return mod;
  } catch (error) {
    if (retriesLeft > 0) {
      log.warn('Chunk load failed; retrying', { retriesLeft });
      await delay(RETRY_DELAY_MS);
      return loadWithRetry(factory, retriesLeft - 1, retryKey);
    }

    // Last resort: hard reload ONCE to fetch the fresh manifest after a deploy.
    const alreadyReloaded =
      typeof sessionStorage !== 'undefined' && sessionStorage.getItem(retryKey) === '1';
    if (!alreadyReloaded && typeof window !== 'undefined') {
      log.warn('Chunk load failed after retries; reloading to fetch fresh build');
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(retryKey, '1');
      window.location.reload();
    }
    log.error('Chunk load failed and could not be recovered', error);
    throw error;
  }
}

let chunkSeq = 0;

/**
 * lazyWithRetry — drop-in replacement for `React.lazy` with chunk-load resilience.
 * @example const Page = lazyWithRetry(() => import('@modules/billing/pages/BillingPage'));
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: ComponentImport<T>,
): LazyExoticComponent<T> {
  const retryKey = `${RELOAD_FLAG_PREFIX}${chunkSeq++}`;
  return lazy(() => loadWithRetry(factory, RETRY_COUNT, retryKey));
}

/**
 * preload — eagerly start fetching a lazy chunk (e.g. on link hover / route prefetch) so
 * the subsequent navigation is instant. Errors are swallowed (preload is best-effort).
 */
export function preload<T extends ComponentType<unknown>>(factory: ComponentImport<T>): void {
  void factory().catch((error: unknown) => {
    log.debug('Preload failed (non-fatal)', { error: String(error) });
  });
}
