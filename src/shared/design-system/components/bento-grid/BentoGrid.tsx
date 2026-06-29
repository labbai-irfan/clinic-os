/**
 * BentoGrid + BentoItem — calm, large-tile dashboard layout (Frontend-Bible §7.3).
 *
 * `BentoGrid` is a responsive CSS grid (1 col on phones → 2 → 4 on desktop) with
 * uniform auto rows. `BentoItem` is a Card-surfaced tile that declares its
 * `colSpan` / `rowSpan` (1–4) via tokenised span utilities — never px.
 *
 * Span classes are written as full literals (not interpolated) so Tailwind's
 * JIT can see them at build time.
 *
 * Governed by: Phase 6 design-system spec (AGENT C — BentoGrid/BentoItem).
 */
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

export type BentoGridProps = HTMLAttributes<HTMLDivElement>;

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(function BentoGrid(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        'auto-rows-[minmax(10rem,auto)]',
        className,
      )}
      {...props}
    />
  );
});
BentoGrid.displayName = 'BentoGrid';

/** Span 1–4 across the grid's columns / rows. */
export type BentoSpan = 1 | 2 | 3 | 4;

const COL_SPAN: Record<BentoSpan, string> = {
  1: 'col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'sm:col-span-2 lg:col-span-4',
};

const ROW_SPAN: Record<BentoSpan, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
};

export interface BentoItemProps extends HTMLAttributes<HTMLDivElement> {
  /** How many grid columns this tile occupies (1–4). Defaults to 1. */
  colSpan?: BentoSpan;
  /** How many grid rows this tile occupies (1–4). Defaults to 1. */
  rowSpan?: BentoSpan;
}

export const BentoItem = forwardRef<HTMLDivElement, BentoItemProps>(function BentoItem(
  { className, colSpan = 1, rowSpan = 1, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-surface-raised p-6 text-text shadow-md',
        COL_SPAN[colSpan],
        ROW_SPAN[rowSpan],
        className,
      )}
      {...props}
    />
  );
});
BentoItem.displayName = 'BentoItem';
