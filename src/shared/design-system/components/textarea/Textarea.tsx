/**
 * Textarea — a multi-line text field sharing Input's token styling.
 *
 * Vertically resizable, with a sensible minimum height. The `invalid` variant
 * restyles the border and sets `aria-invalid`. Wired the same way as Input via
 * FormField. No hardcoded copy.
 *
 * Governed by: docs/Frontend-Bible.md §8.4 / §8.6, Phase 6 spec (Textarea).
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

const textarea = cva(
  'block w-full bg-surface-raised text-text rounded-md border border-border min-h-24 px-4 py-3 text-body-md placeholder:text-text-subtle resize-y transition-colors duration-fast focus-visible:outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed',
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

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textarea> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(textarea({ invalid }), className)}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
