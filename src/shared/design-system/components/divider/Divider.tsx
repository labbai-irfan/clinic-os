/**
 * Divider — a token-driven separator between content groups.
 *
 * Renders a semantic `<hr>` (role="separator" is implicit). Supports horizontal
 * (default) and vertical orientation; vertical dividers are marked
 * `aria-orientation="vertical"`. Colour comes from the `border-divider` token.
 *
 * Governed by: Phase 6 design-system spec (AGENT C — Divider).
 */
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /** Layout axis of the rule. Defaults to `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { className, orientation = 'horizontal', ...props },
  ref,
) {
  const isVertical = orientation === 'vertical';
  return (
    <hr
      ref={ref}
      aria-orientation={isVertical ? 'vertical' : undefined}
      className={cn(
        'border-divider',
        isVertical ? 'h-full w-0 border-s' : 'h-0 w-full border-t',
        className,
      )}
      {...props}
    />
  );
});
Divider.displayName = 'Divider';
