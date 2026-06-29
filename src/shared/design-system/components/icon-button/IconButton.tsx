/**
 * IconButton — a square, icon-only button sharing Button's visual language.
 *
 * Because there is no visible text label, an `aria-label` is REQUIRED (typed as
 * required) so the control always has an accessible name. The icon itself is
 * decorative and should be passed `aria-hidden` by the consumer.
 *
 * Variants: primary | secondary | accent | ghost | danger. Sizes: sm | md | lg
 * (square h-10 / h-12 / h-16, all ≥44px target).
 *
 * Governed by: docs/Frontend-Bible.md §8.6 (IconButton), Phase 6 spec.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

import { cn } from '@shared/lib/cn';

const iconButton = cva(
  'inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-fast ease-standard disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active shadow-xs',
        secondary: 'bg-surface-raised text-text border border-strong hover:bg-surface-sunken',
        accent: 'bg-accent text-accent-fg hover:bg-accent-hover',
        ghost: 'bg-transparent text-text hover:bg-surface-sunken',
        danger: 'bg-danger text-danger-fg hover:bg-danger-hover',
      },
      size: {
        sm: 'size-10',
        md: 'size-12',
        lg: 'size-16',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

export interface IconButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>,
    VariantProps<typeof iconButton> {
  /** REQUIRED accessible name for the icon-only control (caller passes `t(...)`). */
  'aria-label': string;
  /** The (decorative, `aria-hidden`) icon to render. */
  icon: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, variant, size, icon, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(iconButton({ variant, size }), className)}
      {...props}
    >
      {icon}
    </button>
  );
});

IconButton.displayName = 'IconButton';
