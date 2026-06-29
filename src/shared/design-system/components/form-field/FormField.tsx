/**
 * FormField — wires a Label, optional hint, and optional error to a single
 * control with real accessibility plumbing.
 *
 * It generates a stable `id` (`useId`), clones the child control to attach:
 *   - `id` (so the `<label htmlFor>` points at it),
 *   - `aria-describedby` referencing the hint and/or error elements,
 *   - `aria-invalid` when an error is present,
 *   - `aria-required` when `required`,
 *   - `invalid` (the control's own CVA variant) when an error is present.
 *
 * The error is announced via `role="alert"` and is never conveyed by color alone
 * (the consumer-provided message carries the meaning). No hardcoded copy: label,
 * hint and error are all props.
 *
 * Governed by: docs/Frontend-Bible.md §8.5 (Field), Phase 6 spec (FormField).
 */
import {
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  useId,
} from 'react';

import { cn } from '@shared/lib/cn';

import { Label } from '../label';

/** The subset of control props FormField injects when cloning the child. */
interface InjectedControlProps {
  id?: string;
  invalid?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible field label (caller passes `t(...)`). */
  label: string;
  /** Optional helper text shown below the label. */
  hint?: string;
  /** Optional error message; presence marks the control invalid + announces it. */
  error?: string;
  /** Marks the field required (asterisk + `aria-required`). */
  required?: boolean;
  /** Screen-reader-only required hint passed to the Label, e.g. `t('common.required')`. */
  requiredHint?: string;
  /** The single control element (Input, Textarea, Select, …). */
  children: ReactElement<InjectedControlProps>;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { label, hint, error, required = false, requiredHint, children, className, ...props },
  ref,
) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = cn(hintId, errorId) || undefined;

  const injected: InjectedControlProps = { id };
  if (describedBy !== undefined) injected['aria-describedby'] = describedBy;
  if (error) {
    injected.invalid = true;
    injected['aria-invalid'] = true;
  }
  if (required) injected['aria-required'] = true;

  const control = isValidElement(children) ? cloneElement(children, injected) : children;

  return (
    <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
      <Label
        htmlFor={id}
        requiredMark={required}
        {...(requiredHint !== undefined ? { requiredHint } : {})}
      >
        {label}
      </Label>
      {hint ? (
        <p id={hintId} className="text-caption text-text-muted">
          {hint}
        </p>
      ) : null}
      {control}
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});

FormField.displayName = 'FormField';
