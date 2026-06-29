/**
 * Tooltip — an accessible, dependency-free tooltip for the ClinicOS UI Kit.
 *
 * Behavior (Frontend-Bible §8.6, WAI-ARIA Tooltip pattern):
 *   - Shows on pointer hover AND keyboard focus (never hover-only).
 *   - The bubble has `role="tooltip"` and is wired to the trigger via
 *     `aria-describedby`, so screen readers announce it as supplementary text.
 *   - `Escape` dismisses it while the trigger keeps focus (SC 1.4.13).
 *   - Reduced-motion aware: the fade/transition is dropped under
 *     `prefers-reduced-motion` (`motion-reduce:` utilities).
 *   - Simple CSS positioning (top, absolute) for v1. Floating-UI can be adopted
 *     later for collision handling without changing this public API.
 *
 * The tooltip is supplementary, never the SOLE carrier of information (a11y).
 * It accepts the trigger as its single child and clones the listeners + the
 * `aria-describedby` onto it (no extra focusable wrapper). Content text is a
 * prop (presentational — no hardcoded copy).
 *
 * Governed by: Phase 6 design-system spec (AGENT D — Tooltip).
 */
import {
  cloneElement,
  type FocusEvent,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useId,
  useState,
} from 'react';

import { cn } from '@shared/lib/cn';

/** Props the Tooltip merges onto its single trigger child (React synthetic events). */
interface TriggerInjectedProps {
  'aria-describedby'?: string;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface TooltipProps {
  /** The supplementary text to display (localized by the caller — no default literal). */
  content: ReactNode;
  /** The single trigger element the tooltip describes (e.g. a Button or IconButton). */
  children: ReactElement;
  /** Extra classes for the tooltip bubble. */
  className?: string;
  /** Disable the tooltip (the trigger renders unchanged). */
  disabled?: boolean;
}

/**
 * Compose a handler that already exists on the child with the tooltip's own,
 * preserving the child's behavior. Typed via generics so no `any` leaks.
 */
function chain<E>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
): (event: E) => void {
  return (event: E): void => {
    theirs?.(event);
    ours(event);
  };
}

/**
 * Tooltip wraps a single trigger child in a positioned container, shows a
 * `role="tooltip"` bubble on hover/focus, and dismisses on Escape.
 */
export function Tooltip({
  content,
  children,
  className,
  disabled = false,
}: TooltipProps): ReactNode {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  const show = useCallback((): void => setOpen(true), []);
  const hide = useCallback((): void => setOpen(false), []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>): void => {
    // Escape dismisses without moving focus (WCAG 2.2 SC 1.4.13).
    if (event.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  if (disabled || !isValidElement(children)) {
    return children;
  }

  const child = children as ReactElement<TriggerInjectedProps>;
  const childProps = child.props;

  // Resolve the describedby value, preserving any the child already had. Build
  // the override object so we never pass an explicit `undefined` for the
  // optional `aria-describedby` (required under exactOptionalPropertyTypes).
  const describedBy = open ? tooltipId : childProps['aria-describedby'];
  const injected: TriggerInjectedProps = {
    onMouseEnter: chain(childProps.onMouseEnter, show),
    onMouseLeave: chain(childProps.onMouseLeave, hide),
    onFocus: chain(childProps.onFocus, show),
    onBlur: chain(childProps.onBlur, hide),
    onKeyDown: chain(childProps.onKeyDown, handleKeyDown),
    ...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {}),
  };

  const trigger = cloneElement<TriggerInjectedProps>(child, injected);

  return (
    <span className="relative inline-flex">
      {trigger}
      {/*
        Always rendered so `aria-describedby` resolves the moment it is set;
        visibility is toggled via opacity + pointer-events (not unmounting), so
        the description node exists for assistive tech. `aria-hidden` mirrors the
        visible state. Positioned above the trigger (simple top placement).
      */}
      <span
        id={tooltipId}
        role="tooltip"
        aria-hidden={!open}
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-popover mb-2 -translate-x-1/2',
          'whitespace-nowrap rounded-md bg-surface-raised px-3 py-2',
          'border border-border text-body-sm text-text shadow-md',
          'transition-opacity duration-fast ease-standard motion-reduce:transition-none',
          open ? 'opacity-100' : 'opacity-0',
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}

Tooltip.displayName = 'Tooltip';
