/**
 * handlers.ts — MSW request handlers registry.
 *
 * Governed by: docs/Brain.md §4 (MSW enables backend independence) and
 * docs/architecture/Architecture.md §7 (MSW mocks the DTO contract so frontend teams ship
 * before any backend exists).
 *
 * Phase 3 ships ZERO handlers on purpose — this is the engineering foundation, not a
 * feature phase. Each module will add its own handlers (mocking its DTO contract) and the
 * app/test setup will compose them into this array. The empty export keeps the worker and
 * server valid and the wiring real.
 */

import type { RequestHandler } from 'msw';

/** All MSW handlers. Modules contribute their DTO-contract mocks here in later phases. */
export const handlers: RequestHandler[] = [];
