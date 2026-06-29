/**
 * Skeleton — a content placeholder that mirrors final layout (no shift).
 *
 * Always `aria-hidden` (it carries no information); a managed live region
 * announces loading state elsewhere (Frontend-Bible §2.1). The shimmer animates
 * via `animate-pulse` and stops under reduced motion (`motion-reduce:animate-none`).
 * Width / height / shape are controlled by the consumer via `className`.
 *
 * Governed by: Phase 6 design-system spec (AGENT C — Skeleton).
 */
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'animate-pulse rounded-md bg-skeleton-base motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
});
Skeleton.displayName = 'Skeleton';
