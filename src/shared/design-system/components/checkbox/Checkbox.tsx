/**
 * Checkbox — a native `<input type="checkbox">` styled from tokens.
 *
 * Using the native input keeps full keyboard support (Space toggles), the
 * implicit `checkbox` role, and form integration for free. The brand tint comes
 * from `accent-primary`; the visible box uses token border/size utilities. Pair
 * with a Label / FormField for the accessible name. `invalid` sets `aria-invalid`
 * (never color alone — surface the error via FormField text). No hardcoded copy.
 *
 * Governed by: docs/Frontend-Bible.md §8.6, Phase 6 design-system spec (Checkbox).
 */
import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Marks the control invalid (sets `aria-invalid`); pair with FormField error text. */
  invalid?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-invalid={invalid || undefined}
      className={cn(
        'border-strong size-5 rounded-sm border text-primary accent-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-danger',
        className,
      )}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';
