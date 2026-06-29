/**
 * browser.ts — the MSW browser worker (Service Worker based).
 *
 * Governed by: docs/Brain.md §4 (MSW for dev + tests).
 *
 * WHY: in the browser, MSW intercepts network calls via a Service Worker so the app can run
 * against mocked DTO contracts with no real backend. Started ONLY when env.VITE_ENABLE_MSW
 * is true (see src/app/main.tsx), and never in production builds.
 *
 * The Service Worker script (`public/mockServiceWorker.js`) is generated once via
 * `pnpm dlx msw init public/` — documented in the DeveloperGuide. Until then, MSW logs a
 * clear error and the app continues unmocked.
 */

import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** The MSW worker instance. Call `worker.start()` to begin intercepting (see main.tsx). */
export const worker = setupWorker(...handlers);
