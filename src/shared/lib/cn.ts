/**
 * cn — the canonical className composer for ClinicOS.
 *
 * Combines {@link https://github.com/lukeed/clsx | clsx} (conditional class
 * joining) with {@link https://github.com/dcastil/tailwind-merge | tailwind-merge}
 * (last-wins conflict resolution for Tailwind utilities), so callers can pass
 * conditional/array/object class inputs AND safely override an earlier utility
 * with a later one (e.g. `cn('p-2', condition && 'p-4')` → `p-4`).
 *
 * Governed by: docs/Coding-Standards.md (React/TS), Phase 6 design-system spec.
 *
 * @param inputs - Any clsx-compatible class values (strings, arrays, objects, falsy).
 * @returns A single, de-conflicted className string.
 *
 * @example
 * cn('inline-flex items-center', isActive && 'bg-primary', className)
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
