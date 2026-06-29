/**
 * ErrorState — the failed-async surface (Frontend-Bible §2.1, the four async
 * states). A danger-toned specialization of {@link EmptyState}: a danger icon,
 * a human title + description, and a single retry action.
 *
 * Pairs with the error-boundary philosophy (Brain §11): when an async read
 * fails, show a calm, localized message and a way to recover — never a raw
 * stack trace or a blank screen. Presentational: the message text and the retry
 * label come from props; the component hardcodes none.
 *
 * Governed by: Phase 6 design-system spec (AGENT D — ErrorState).
 */
import { AlertOctagon } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';

import { cn } from '@shared/lib/cn';

import { EmptyState, type EmptyStateProps } from '../empty-state';

export interface ErrorStateProps extends Omit<EmptyStateProps, 'action' | 'icon'> {
  /**
   * Optional override for the default danger icon. Pass `null` to omit the icon
   * entirely. When omitted, a danger-toned `AlertOctagon` is shown.
   */
  icon?: ReactNode;
  /** Localized label for the retry action (no default literal). */
  retryLabel?: ReactNode;
  /** Invoked when the retry action is activated. */
  onRetry?: () => void;
}

/**
 * ErrorState wires a danger icon + retry action into EmptyState. The retry is
 * only rendered when both `retryLabel` and `onRetry` are provided (a recovery
 * action without a handler — or a label-less handler — would be a dead end).
 */
export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(function ErrorState(
  { className, icon, title, description, retryLabel, onRetry, ...props },
  ref,
) {
  const resolvedIcon: ReactNode =
    icon === undefined ? <AlertOctagon aria-hidden className="size-12 text-danger" /> : icon;

  const action = retryLabel && onRetry ? { label: retryLabel, onClick: onRetry } : undefined;

  return (
    <EmptyState
      ref={ref}
      className={cn(className)}
      icon={resolvedIcon}
      title={title}
      description={description}
      action={action}
      {...props}
    />
  );
});

ErrorState.displayName = 'ErrorState';
