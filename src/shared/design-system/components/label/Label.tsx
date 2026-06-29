/**
 * Label — an accessible `<label>` for form controls.
 *
 * Associate it with a control via `htmlFor` (FormField wires this automatically).
 * When `requiredMark` is set, a decorative `*` is shown (`aria-hidden`) alongside
 * a screen-reader-only required hint supplied by the caller — never color/marker
 * alone. No hardcoded copy: both the visible label and the required hint are props.
 *
 * Governed by: docs/Frontend-Bible.md §8.4 (Label), Phase 6 spec (Label).
 */
import { forwardRef, type LabelHTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Render the required asterisk (paired with `requiredHint` for screen readers). */
  requiredMark?: boolean;
  /** Screen-reader-only required text, e.g. `t('common.required')`. Shown when `requiredMark`. */
  requiredHint?: string;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, requiredMark = false, requiredHint, children, ...props },
  ref,
) {
  return (
    <label ref={ref} className={cn('text-body-sm font-semibold text-text', className)} {...props}>
      {children}
      {requiredMark ? (
        <>
          <span aria-hidden className="ms-1 text-danger">
            *
          </span>
          {requiredHint ? <span className="sr-only">{requiredHint}</span> : null}
        </>
      ) : null}
    </label>
  );
});

Label.displayName = 'Label';
