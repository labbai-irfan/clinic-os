/**
 * Slot — a minimal `asChild` primitive for the ClinicOS design system.
 *
 * When a component supports `asChild`, it renders a {@link Slot} instead of its
 * default element. Slot expects EXACTLY ONE valid React element child, and it
 * merges the props it receives (className, event handlers, aria-*, etc.) onto
 * that child while forwarding the ref. This lets a consumer change the rendered
 * element (e.g. render a `Button`'s styling onto an `<a>` or a router `<Link>`)
 * without an extra wrapper node.
 *
 * Inspired by Radix UI's `Slot`, kept intentionally small (single child, no
 * `Slottable`) for v1. Strictly typed — no `any`.
 *
 * Governed by: Phase 6 design-system spec (lib/slot.tsx).
 */
import {
  cloneElement,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { cn } from '@shared/lib/cn';

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  /**
   * Exactly one React element to merge props + ref onto. Optional at the type
   * level so the common `const Comp = asChild ? Slot : 'div'` idiom type-checks
   * when host props are spread onto `<Comp>`; at runtime a missing/invalid child
   * renders nothing (and warns in dev).
   */
  children?: ReactNode;
}

/** Props shape we read off the child element when merging. */
interface ChildProps {
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * Merge the Slot's own props with the single child element's props.
 * Child props win for identity, but className/style are composed and event
 * handlers from both are chained (child handler first, then Slot's).
 */
function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: ChildProps,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...slotProps };

  for (const key of Object.keys(childProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    // Compose event handlers (onClick, onKeyDown, …): call both.
    const isHandler = /^on[A-Z]/.test(key);
    if (isHandler && typeof slotValue === 'function' && typeof childValue === 'function') {
      merged[key] = (...args: unknown[]): void => {
        (childValue as (...a: unknown[]) => void)(...args);
        (slotValue as (...a: unknown[]) => void)(...args);
      };
    } else if (childValue !== undefined) {
      merged[key] = childValue;
    }
  }

  // className / style are composed regardless of the loop above.
  merged['className'] = cn(slotProps['className'] as string | undefined, childProps.className);
  if (slotProps['style'] !== undefined || childProps.style !== undefined) {
    merged['style'] = {
      ...(slotProps['style'] as CSSProperties | undefined),
      ...childProps.style,
    };
  }

  return merged;
}

/**
 * Slot clones its single child, merging the Slot's props onto it and forwarding
 * the ref. Renders nothing (and warns in dev) if the child is not a valid element.
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef,
) {
  if (!isValidElement(children)) {
    if (import.meta.env.DEV) {
      console.warn('Slot expects a single valid React element child when used with `asChild`.');
    }
    return null;
  }

  const child = children as ReactElement<ChildProps & { ref?: Ref<unknown> }>;
  const merged = mergeProps(slotProps, child.props);
  merged['ref'] = forwardedRef;

  return cloneElement(child, merged);
});

Slot.displayName = 'Slot';
