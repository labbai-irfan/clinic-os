/**
 * routes.ts — the ROUTES path-constant registry.
 *
 * Governed by: docs/architecture/Architecture.md §9.3 (rendering/routing) and
 * docs/Naming-Convention.md.
 *
 * WHY a central registry:
 *   - Route paths are referenced from many places (router config, nav, links, redirects).
 *     Centralizing them as typed constants prevents string drift and typos, and gives one
 *     place to see the app's URL surface.
 *   - This phase defines ONLY the root route. Modules will register their own route
 *     subtrees (lazy) in later phases; their paths get added here as they land.
 */

/** Application route paths. Extend as modules are added (one entry per top-level route). */
export const ROUTES = {
  /** The application root — currently the "Foundation Ready" placeholder screen. */
  ROOT: '/',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
