/**
 * Badge — a compact, tone-coded label for counts, states and tags.
 *
 * cva `tone` selects a subtle background + matching text colour. Badges that
 * carry status MUST pair the colour with an icon and/or text (never colour
 * alone — Frontend-Bible §9.6); the badge content (children) supplies that.
 *
 * Presentational only: the label comes from children, never hardcoded.
 *
 * Governed by: Phase 6 design-system spec (AGENT C — Badge),
 * docs/design-system/ColorSystem.md §3.8/§3.9 (tone tokens).
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

const badge = cva(
  [
    'inline-flex items-center gap-1 rounded-pill px-2 h-6',
    'text-overline font-semibold uppercase',
    'border border-transparent',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      tone: {
        neutral: 'bg-surface-sunken text-text-muted',
        primary: 'bg-primary-subtle text-primary',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-warning',
        danger: 'bg-danger-subtle text-danger',
        info: 'bg-info-subtle text-info',
        emergency: 'bg-emergency-subtle text-emergency',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, tone, ...props },
  ref,
) {
  return <span ref={ref} className={cn(badge({ tone }), className)} {...props} />;
});
Badge.displayName = 'Badge';

export { badge as badgeVariants };
