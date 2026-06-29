/**
 * EmptyState — the calm "no data" surface (Frontend-Bible §2.1, the four async
 * states). A centered illustration/icon slot, a title, a short description, and
 * exactly one primary action (Brain §11: never a blank screen).
 *
 * Presentational: all human text (`title`, `description`, the action label) is
 * passed in by the caller — the component hardcodes none. The `icon` slot is
 * decorative and wrapped in an `aria-hidden` container so the visible title
 * carries the meaning. `forwardRef` targets the root for measurement/scroll.
 *
 * Sibling `ErrorState` reuses this contract with a danger tone + retry.
 *
 * Governed by: Phase 6 design-system spec (AGENT D — EmptyState).
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@shared/lib/cn';

import { Button } from '../button';

/** A single primary action: a label + handler (rendered as a Button). */
export interface EmptyStateAction {
  /** Localized button label supplied by the caller (no default literal). */
  label: ReactNode;
  /** Click handler for the primary action. */
  onClick?: () => void;
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Decorative illustration or icon node (e.g. a lucide icon or an `<img>`).
   * Wrapped in an `aria-hidden` container — pass meaning via `title`, not here.
   */
  icon?: ReactNode;
  /** The headline (required, localized by the caller). */
  title: ReactNode;
  /** Optional supporting line beneath the title. */
  description?: ReactNode;
  /**
   * Optional single primary action. Either pass a structured `{ label, onClick }`
   * (rendered as the kit Button) or pass a fully custom node for full control.
   */
  action?: EmptyStateAction | ReactNode;
}

/** Narrow the `action` prop to the structured `{ label }` form. */
function isStructuredAction(action: EmptyStateProps['action']): action is EmptyStateAction {
  return typeof action === 'object' && action !== null && 'label' in action;
}

/**
 * EmptyState renders a vertically-stacked, centered block: icon → title →
 * description → one action. Used directly for "no data" surfaces and composed by
 * `ErrorState` for failed-load surfaces.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { className, icon, title, description, action, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col items-center justify-center gap-3 p-8 text-center', className)}
      {...props}
    >
      {icon ? (
        <div aria-hidden className="mb-2 flex items-center justify-center text-text-subtle">
          {icon}
        </div>
      ) : null}
      <h3 className="text-h4 text-text">{title}</h3>
      {description ? (
        <p className="max-w-container-sm text-body-md text-text-muted">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-4">
          {isStructuredAction(action) ? (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          ) : (
            action
          )}
        </div>
      ) : null}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
