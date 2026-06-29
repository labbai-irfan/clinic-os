/**
 * Card — the foundational raised surface for grouping related content.
 *
 * Composes from `Card` + `CardHeader` / `CardTitle` / `CardDescription` /
 * `CardContent` / `CardFooter`. Token-only styling (Frontend-Bible §8.5/§8.6);
 * `interactive` opts into a hover/focus affordance for clickable cards — the
 * consumer is responsible for adding the real interactive semantics (a `<button>`
 * or `<a>` via `asChild`, a `role`, an `onClick` + keyboard handler).
 *
 * Presentational only: all copy comes from children (no hardcoded strings).
 *
 * Governed by: Phase 6 design-system spec (AGENT C — Card),
 * docs/Frontend-Bible.md §8.5 (Card reference).
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

import type { AsChildProps } from '../../lib/component.types';
import { Slot } from '../../lib/slot';

const card = cva(['bg-surface-raised text-text rounded-lg border border-border'], {
  variants: {
    elevation: {
      flat: 'shadow-none',
      raised: 'shadow-md',
      overlay: 'shadow-lg',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    interactive: {
      true: [
        'cursor-pointer transition-shadow duration-base ease-standard motion-reduce:transition-none',
        'hover:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        'focus-within:ring-2 focus-within:ring-focus',
      ],
      false: '',
    },
  },
  defaultVariants: { elevation: 'raised', padding: 'md', interactive: false },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof card>, AsChildProps {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, elevation, padding, interactive, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={ref}
      className={cn(card({ elevation, padding, interactive }), className)}
      {...props}
    />
  );
});
Card.displayName = 'Card';

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('flex flex-col gap-1', className)} {...props} />;
});
CardHeader.displayName = 'CardHeader';

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, children, ...props },
  ref,
) {
  return (
    <h3 ref={ref} className={cn('font-heading text-h4 text-text', className)} {...props}>
      {children}
    </h3>
  );
});
CardTitle.displayName = 'CardTitle';

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn('text-body-sm text-text-muted', className)} {...props} />;
  },
);
CardDescription.displayName = 'CardDescription';

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('text-body-md text-text', className)} {...props} />;
});
CardContent.displayName = 'CardContent';

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('mt-4 flex items-center gap-3', className)} {...props} />;
});
CardFooter.displayName = 'CardFooter';
