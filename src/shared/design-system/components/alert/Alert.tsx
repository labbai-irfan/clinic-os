/**
 * Alert — a token-only, a11y-first inline status banner.
 *
 * Surfaces a contextual message (info / success / warning / danger / emergency)
 * with a tone-matched lucide icon, a title, an optional description, and an
 * optional action slot. NEVER color-only: every tone pairs its color with an
 * icon AND text (Frontend-Bible §9 "never color alone").
 *
 * Roles (WAI-ARIA): `info`/`success` use `role="status"` (polite live region);
 * `warning`/`danger`/`emergency` use `role="alert"` (assertive) so urgent
 * messages are announced immediately. The icon is `aria-hidden` (decorative —
 * the visible title carries the meaning). Presentational: all human text comes
 * from props (`title`, `description`, `action`); the component hardcodes none.
 *
 * Governed by: Phase 6 design-system spec (AGENT D — Alert), Frontend-Bible §8.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
  Siren,
} from 'lucide-react';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@shared/lib/cn';

const alert = cva(['relative flex items-start gap-3 rounded-lg border p-4', 'text-body-md'], {
  variants: {
    tone: {
      info: 'bg-info-subtle border-info text-text',
      success: 'bg-success-subtle border-success text-text',
      warning: 'bg-warning-subtle border-warning text-text',
      danger: 'bg-danger-subtle border-danger text-text',
      emergency: 'bg-emergency-subtle border-emergency text-text',
    },
  },
  defaultVariants: { tone: 'info' },
});

/** The tone union this component supports (a subset of the shared `Tone`). */
export type AlertTone = NonNullable<VariantProps<typeof alert>['tone']>;

/** Per-tone lucide icon (decorative — paired with the visible title). */
const TONE_ICON: Record<AlertTone, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertOctagon,
  emergency: Siren,
};

/** Per-tone icon color (the ONE place tone color is applied to the glyph). */
const TONE_ICON_CLASS: Record<AlertTone, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  emergency: 'text-emergency',
};

/**
 * `info` and `success` are non-urgent → polite `status`. `warning`, `danger`
 * and `emergency` are urgent → assertive `alert` so SRs interrupt.
 */
function roleForTone(tone: AlertTone): 'status' | 'alert' {
  return tone === 'info' || tone === 'success' ? 'status' : 'alert';
}

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof alert> {
  /** The headline message (required, localized by the caller — no default literal). */
  title: ReactNode;
  /** Optional supporting detail rendered beneath the title. */
  description?: ReactNode;
  /** Optional action slot (e.g. a Button or Link) aligned to the message end. */
  action?: ReactNode;
}

/**
 * Alert renders a `div` with the appropriate live-region role, a tone icon, the
 * title/description text block, and an optional trailing action. `forwardRef`
 * targets the root element so consumers can focus or measure it.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, tone = 'info', title, description, action, ...props },
  ref,
) {
  const resolvedTone: AlertTone = tone ?? 'info';
  const ToneIcon = TONE_ICON[resolvedTone];

  return (
    <div
      ref={ref}
      role={roleForTone(resolvedTone)}
      className={cn(alert({ tone: resolvedTone }), className)}
      {...props}
    >
      <ToneIcon aria-hidden className={cn('mt-1 size-5 shrink-0', TONE_ICON_CLASS[resolvedTone])} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-body-md font-semibold text-text">{title}</p>
        {description ? <div className="text-body-sm text-text-muted">{description}</div> : null}
      </div>
      {action ? <div className="ms-2 shrink-0">{action}</div> : null}
    </div>
  );
});

Alert.displayName = 'Alert';
