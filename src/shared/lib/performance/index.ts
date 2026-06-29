/**
 * shared/lib/performance — public API barrel.
 * Governed by docs/architecture/Architecture.md §10.
 */
export type { ComponentImport } from './lazy';
export { lazyWithRetry, preload } from './lazy';
