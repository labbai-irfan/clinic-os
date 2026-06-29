/**
 * Shared cross-component type vocabulary for the ClinicOS design system.
 *
 * Keep this file tiny and dependency-free: only the unions/helpers that MULTIPLE
 * components share live here, so the catalog stays consistent (one `Size` scale,
 * one `Tone` palette) instead of each component re-declaring its own.
 *
 * Governed by: Phase 6 design-system spec (lib/component.types.ts).
 */

/** Canonical control size scale used by Button, Input, IconButton, Avatar, … */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Canonical semantic tone palette shared by Badge, Alert and other status-bearing
 * surfaces. Each tone maps to a token family (`bg-*-subtle`, `text-*-fg`, …).
 * NOTE: not every component supports every tone (e.g. a plain Badge has `neutral`
 * but no `emergency`); components narrow this union as needed.
 */
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'emergency';

/**
 * Helper to express a "polymorphic-ish" prop set: when `asChild` is true the
 * component renders its single child (via {@link ./slot#Slot}) instead of its
 * default element. Spread into a component's props to add the `asChild` flag.
 */
export interface AsChildProps {
  /** Render the design-system styling onto the single child element instead of the default element. */
  asChild?: boolean;
}
