/**
 * Switch — an accessible on/off toggle built as a `role="switch"` button.
 *
 * Exposes `aria-checked`, supports controlled (`checked` + `onCheckedChange`) and
 * uncontrolled (`defaultChecked`) usage, and is keyboard-operable (Space/Enter
 * toggle — native for `<button>`, with explicit handling for robustness). The
 * track/thumb are token-styled and switch via `data-[state=checked]`.
 *
 * Provide an accessible name via `aria-label`/`aria-labelledby` (or a Label).
 * No hardcoded copy.
 *
 * Governed by: docs/Frontend-Bible.md §8.6, Phase 6 design-system spec (Switch).
 */
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  useState,
} from 'react';

import { cn } from '@shared/lib/cn';

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'type' | 'value'
> {
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Called with the next checked state when toggled. */
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    className,
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    onClick,
    onKeyDown,
    ...props
  },
  ref,
) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  const toggle = (): void => {
    const next = !isChecked;
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      data-state={isChecked ? 'checked' : 'unchecked'}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          toggle();
        }
      }}
      className={cn(
        'border-strong inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-1',
        'bg-surface-sunken transition-colors duration-fast ease-standard motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'size-5 rounded-full bg-surface-raised shadow-xs',
          'transition-transform duration-fast ease-standard motion-reduce:transition-none',
          isChecked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
});

Switch.displayName = 'Switch';
