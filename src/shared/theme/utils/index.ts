/**
 * utils/index.ts — internal barrel for the Theme Engine pure utilities.
 *
 * Re-exports the color math, contrast checks, shade generator, token readers,
 * the DOM applier, and the preference helpers as one import surface for the
 * manager, branding, and the public theme barrel.
 *
 * Governed by: Phase 5 BUILD SPEC §UTILS (index.ts).
 */

export * from './apply-theme';
export * from './color';
export * from './contrast';
export * from './generate-shades';
export * from './get-token';
export * from './preferences';
