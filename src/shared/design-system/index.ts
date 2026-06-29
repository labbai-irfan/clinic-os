/**
 * @shared/design-system — the public barrel for the ClinicOS UI Kit (Phase 6).
 *
 * Re-exports EVERY component in the catalog plus its prop types. Consumers import
 * exclusively from here (`import { Button } from '@shared/design-system'`) and
 * never reach into a component folder directly. All exports are named (no default,
 * no side effects) so the kit stays tree-shakeable.
 *
 * Component folders (`components/<kebab>`) are authored by the sibling component
 * agents; these re-exports resolve once those folders land. Folder names follow
 * the spec's kebab-case convention; components that compose together (Card +
 * its subcomponents, RadioGroup + Radio, BentoGrid + BentoItem) live in one folder.
 *
 * The shared `cn` helper lives at `@shared/lib/cn` (NOT re-exported here).
 *
 * Governed by: Phase 6 design-system spec (COMPONENT LIST + CONTRACTS).
 */

/* -------------------------------------------------------------------------- */
/* Shared design-system primitives (lib)                                      */
/* -------------------------------------------------------------------------- */
export type { AsChildProps, Size, Tone } from './lib/component.types';
export type { SlotProps } from './lib/slot';
export { Slot } from './lib/slot';

/* -------------------------------------------------------------------------- */
/* Form controls (Agent B)                                                    */
/* -------------------------------------------------------------------------- */
export * from './components/button';
export * from './components/checkbox';
export * from './components/form-field';
export * from './components/icon-button';
export * from './components/input';
export * from './components/label';
export * from './components/radio';
export * from './components/select';
export * from './components/switch';
export * from './components/textarea';

/* -------------------------------------------------------------------------- */
/* Display & layout (Agent C)                                                 */
/* -------------------------------------------------------------------------- */
export * from './components/avatar';
export * from './components/badge';
export * from './components/bento-grid';
export * from './components/card';
export * from './components/divider';
export * from './components/icon';
export * from './components/skeleton';
export * from './components/spinner';
export * from './components/status-badge';
export * from './components/visually-hidden';

/* -------------------------------------------------------------------------- */
/* Feedback (Agent D)                                                         */
/* -------------------------------------------------------------------------- */
export * from './components/alert';
export * from './components/empty-state';
export * from './components/error-state';
export * from './components/tooltip';

/* -------------------------------------------------------------------------- */
/* Icon Registry (semantic, categorised icons — consume via the <Icon> wrapper) */
/* -------------------------------------------------------------------------- */
export * from './icons';

/* -------------------------------------------------------------------------- */
/* Component Registry (the permanent, machine-checkable component catalog)     */
/* -------------------------------------------------------------------------- */
export * from './registry';
