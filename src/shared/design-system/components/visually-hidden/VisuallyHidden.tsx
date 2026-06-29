/**
 * VisuallyHidden — renders content that is hidden visually but available to
 * assistive technology (the `sr-only` pattern).
 *
 * Use for skip-link targets, extra context for icon-only controls, and labels
 * that should be announced but not shown. With `asChild`, the `sr-only` styling
 * is merged onto the single child element instead of an extra `<span>`.
 *
 * Governed by: Phase 6 design-system spec (AGENT C — VisuallyHidden),
 * docs/Frontend-Bible.md §9.4 (.sr-only utility).
 */
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

import type { AsChildProps } from '../../lib/component.types';
import { Slot } from '../../lib/slot';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement>, AsChildProps {}

export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ className, asChild = false, ...props }, ref) {
    const Comp = asChild ? Slot : 'span';
    return <Comp ref={ref} className={cn('sr-only', className)} {...props} />;
  },
);
VisuallyHidden.displayName = 'VisuallyHidden';
