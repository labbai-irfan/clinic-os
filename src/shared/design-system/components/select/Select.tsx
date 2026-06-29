/**
 * Select — a native `<select>` styled to match Input, with a chevron affordance.
 *
 * The native control keeps full keyboard support, the platform option list, and
 * form integration. `appearance-none` hides the default arrow so a token-styled
 * `ChevronDown` (decorative, `aria-hidden`) can sit on the trailing edge. The
 * `invalid` variant restyles the border and sets `aria-invalid`. Provide an
 * accessible name via a Label / FormField. No hardcoded copy.
 *
 * Governed by: docs/Frontend-Bible.md §8.6, Phase 6 design-system spec (Select).
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

const select = cva(
  'block w-full appearance-none bg-surface-raised text-text rounded-md border border-border h-12 ps-4 pe-10 text-body-md transition-colors duration-fast focus-visible:outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      invalid: {
        true: 'border-danger focus-visible:border-danger focus-visible:ring-danger',
        false: '',
      },
    },
    defaultVariants: { invalid: false },
  },
);

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>, VariantProps<typeof select> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(select({ invalid }), className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
});

Select.displayName = 'Select';
