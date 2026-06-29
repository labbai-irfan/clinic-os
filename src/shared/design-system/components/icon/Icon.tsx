/**
 * Icon — a token-sized wrapper around any lucide-react icon component.
 *
 * Takes the icon *component* (a {@link LucideIcon}) as a prop and renders it at
 * one of the `--icon-size-*` tokens (size-4 … size-10) with the shared stroke
 * width (`--icon-stroke` = 2). Decorative by default (`aria-hidden`); pass
 * `aria-label` to make the icon a labelled image — no hardcoded default label.
 *
 * Icons inherit `currentColor`, so they re-theme automatically; never hardcode
 * an icon colour (Frontend-Bible §6.1).
 *
 * Governed by: Phase 6 design-system spec (AGENT C — Icon).
 */
import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@shared/lib/cn';

/** Icon size scale → `--icon-size-*` tokens. */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASS: Record<IconSize, string> = {
  xs: 'size-4',
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-8',
  xl: 'size-10',
};

export interface IconProps extends Omit<LucideProps, 'ref' | 'size'> {
  /** The lucide icon component to render (e.g. `Stethoscope`). */
  icon: LucideIcon;
  /** Visual size from the icon-size token scale. Defaults to `md`. */
  size?: IconSize;
  /**
   * Accessible name. When provided the icon is meaningful (role="img"); when
   * omitted the icon is decorative and hidden from assistive tech.
   */
  'aria-label'?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { icon: IconComponent, size = 'md', className, ...props },
  ref,
) {
  const labelled = typeof props['aria-label'] === 'string' && props['aria-label'].length > 0;
  return (
    <IconComponent
      ref={ref}
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      strokeWidth="var(--icon-stroke)"
      className={cn('shrink-0', SIZE_CLASS[size], className)}
      {...props}
    />
  );
});
Icon.displayName = 'Icon';
