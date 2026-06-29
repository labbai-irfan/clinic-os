/**
 * Input — a single-line text field styled from tokens.
 *
 * `forwardRef` to the `<input>`; the `invalid` variant both restyles the border
 * and sets `aria-invalid` so the error state is conveyed to assistive tech (not
 * by color alone — pair with FormField's error text). No hardcoded copy.
 *
 * Governed by: docs/Frontend-Bible.md §8.4, Phase 6 design-system spec (Input).
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

const input = cva(
  'block w-full bg-surface-raised text-text rounded-md border border-border h-12 px-4 text-body-md placeholder:text-text-subtle transition-colors duration-fast focus-visible:outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed',
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

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof input> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(input({ invalid }), className)}
      {...props}
    />
  );
});

Input.displayName = 'Input';
