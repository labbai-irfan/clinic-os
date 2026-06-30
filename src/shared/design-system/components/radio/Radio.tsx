/**
 * Radio + RadioGroup — native radio inputs with shared-name management.
 *
 * RadioGroup renders a `role="radiogroup"` container and shares a single `name`
 * (plus controlled `value` or uncontrolled `defaultValue`) with its child Radios
 * through context, so a caller does not repeat `name` on every item. Native
 * inputs give arrow-key selection, the `radio` role, and form integration free.
 *
 * Pair the group with an accessible name (`aria-label`/`aria-labelledby`, or a
 * FormField) and each Radio with a visible label. No hardcoded copy.
 *
 * Governed by: docs/Frontend-Bible.md §8.6, Phase 6 design-system spec (Radio).
 */
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  useContext,
  useMemo,
} from 'react';

import { cn } from '@shared/lib/cn';

interface RadioGroupContextValue {
  name: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Shared input `name` for the group (required so options are mutually exclusive). */
  name: string;
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { name, value, defaultValue, onValueChange, className, children, ...props },
  ref,
) {
  // Memoize so the context value is stable across renders (perf — avoids
  // re-rendering every Radio consumer on each parent render).
  const ctx = useMemo<RadioGroupContextValue>(
    () => ({ name, value, defaultValue, onValueChange }),
    [name, value, defaultValue, onValueChange],
  );
  return (
    <RadioGroupContext.Provider value={ctx}>
      <div ref={ref} role="radiogroup" className={cn('flex flex-col gap-3', className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

RadioGroup.displayName = 'RadioGroup';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** The value this radio contributes to the group (required). */
  value: string;
  /** Marks the control invalid (sets `aria-invalid`). */
  invalid?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, invalid, name, value, checked, defaultChecked, onChange, ...props },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const resolvedName = name ?? group?.name;

  // Controlled when the group (or the radio) supplies `value`/`checked`;
  // otherwise fall back to uncontrolled `defaultChecked`.
  const isGroupControlled = group?.value !== undefined;
  const controlledChecked = isGroupControlled ? group.value === value : checked;
  const resolvedDefaultChecked =
    group?.defaultValue !== undefined ? group.defaultValue === value : defaultChecked;

  const stateProps =
    controlledChecked !== undefined
      ? { checked: controlledChecked }
      : resolvedDefaultChecked !== undefined
        ? { defaultChecked: resolvedDefaultChecked }
        : {};

  return (
    <input
      ref={ref}
      type="radio"
      name={resolvedName}
      value={value}
      data-invalid={invalid || undefined}
      {...stateProps}
      onChange={(event) => {
        onChange?.(event);
        if (event.currentTarget.checked) group?.onValueChange?.(value);
      }}
      className={cn(
        'border-strong size-5 rounded-full border text-primary accent-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-danger',
        className,
      )}
      {...props}
    />
  );
});

Radio.displayName = 'Radio';
