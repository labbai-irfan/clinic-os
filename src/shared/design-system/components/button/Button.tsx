/**
 * Button — the primary action control for ClinicOS.
 *
 * Token-only styling via CVA; `forwardRef` to the underlying `<button>` (or the
 * `asChild` element); full a11y (keyboard-operable, focus ring, busy state). No
 * hardcoded copy — all text (label, loading label) comes from props/children.
 *
 * Variants: primary | secondary | accent | ghost | danger | link.
 * Sizes: sm | md | lg. Flags: fullWidth, isLoading, asChild.
 *
 * Governed by: docs/Frontend-Bible.md §8.3, Phase 6 design-system spec (Button).
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

import { cn } from '@shared/lib/cn';

import { Slot } from '../../lib/slot';

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-fast ease-standard disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active shadow-xs',
        secondary: 'bg-surface-raised text-text border border-strong hover:bg-surface-sunken',
        accent: 'bg-accent text-accent-fg hover:bg-accent-hover',
        ghost: 'bg-transparent text-text hover:bg-surface-sunken',
        danger: 'bg-danger text-danger-fg hover:bg-danger-hover',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline h-auto px-0',
      },
      size: {
        sm: 'h-10 px-4 text-body-sm',
        md: 'h-12 px-5 text-body-md',
        lg: 'h-16 px-6 text-body-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  /** Render the styling onto the single child element (e.g. an `<a>` / router Link). */
  asChild?: boolean;
  /** When true, shows a spinner, disables the control and sets `aria-busy`. */
  isLoading?: boolean;
  /** Screen-reader-only busy label, e.g. `t('common.saving')`. */
  loadingLabel?: string;
  /** Leading decorative icon (rendered before children). */
  iconStart?: ReactNode;
  /** Trailing decorative icon (rendered after children). */
  iconEnd?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    asChild = false,
    isLoading = false,
    loadingLabel,
    iconStart,
    iconEnd,
    disabled,
    children,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(button({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {asChild ? (
        // asChild: the single child element IS the rendered control — icon/loading
        // wrappers don't compose with an arbitrary child, so forward it untouched.
        children
      ) : (
        <>
          {isLoading ? (
            <Loader2 aria-hidden className="animate-spin motion-reduce:animate-none" />
          ) : (
            iconStart
          )}
          {isLoading && loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
          {children}
          {!isLoading ? iconEnd : null}
        </>
      )}
    </Comp>
  );
});

Button.displayName = 'Button';
