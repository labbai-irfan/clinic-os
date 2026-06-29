/**
 * Spinner — an indeterminate busy indicator (lucide `Loader2`).
 *
 * Decorative by default (`aria-hidden`) so it never adds noise when it sits
 * beside its own visible label. Pass a `label` to make it an announced status:
 * the spinner is then wrapped in `role="status"` with an `sr-only` label (no
 * hardcoded default string — the label is always consumer-supplied).
 *
 * Animation gates on `motion-reduce:` so reduced-motion users get a static icon.
 * Prefer `Skeleton` for content placeholders (Frontend-Bible §2.1).
 *
 * Governed by: Phase 6 design-system spec (AGENT C — Spinner).
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

const spinner = cva('animate-spin motion-reduce:animate-none text-current', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-6',
      lg: 'size-8',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface SpinnerProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof spinner> {
  /**
   * Localised status text announced to assistive tech (e.g. t('common.loading')).
   * When omitted the spinner is purely decorative (`aria-hidden`).
   */
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { className, size, label, ...props },
  ref,
) {
  const labelled = typeof label === 'string' && label.length > 0;
  return (
    <span
      ref={ref}
      role={labelled ? 'status' : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn('inline-flex', className)}
      {...props}
    >
      <Loader2 className={cn(spinner({ size }))} aria-hidden />
      {labelled ? <span className="sr-only">{label}</span> : null}
    </span>
  );
});
Spinner.displayName = 'Spinner';
