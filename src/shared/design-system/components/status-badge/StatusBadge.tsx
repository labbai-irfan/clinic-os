/**
 * StatusBadge — a Badge specialisation for the ClinicOS queue lifecycle.
 *
 * Maps each queue status (scheduled / waiting / called / in-progress /
 * completed / no-show / cancelled) to a {@link Badge} tone + a lucide icon, so
 * the state is ALWAYS conveyed by colour **and** icon **and** text — never
 * colour alone (Frontend-Bible §9.6, ColorSystem §3.10).
 *
 * The visible label is a required prop (`label`) — presentational, no hardcoded
 * copy. The icon is decorative (`aria-hidden`) because the label carries meaning.
 *
 * Governed by: Phase 6 design-system spec (AGENT C — StatusBadge),
 * docs/design-system/ColorSystem.md §3.10 (queue status tokens).
 */
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Hourglass,
  type LucideIcon,
  PhoneCall,
  Stethoscope,
  UserX,
} from 'lucide-react';
import { forwardRef } from 'react';

import { Badge, type BadgeProps } from '../badge/Badge';

/** ClinicOS queue lifecycle, in arrival → departure order. */
export type QueueStatus =
  | 'scheduled'
  | 'waiting'
  | 'called'
  | 'in-progress'
  | 'completed'
  | 'no-show'
  | 'cancelled';

type StatusMeta = { tone: NonNullable<BadgeProps['tone']>; icon: LucideIcon };

/**
 * Status → tone + icon. Tones reuse the Badge subtle palette (which mirrors the
 * `--color-status-*` intent: waiting=info, called=warning, in-progress=teal/
 * primary-emphasis, completed=success, cancelled=danger, no-show/scheduled=neutral).
 */
const STATUS_META: Record<QueueStatus, StatusMeta> = {
  scheduled: { tone: 'neutral', icon: CalendarClock },
  waiting: { tone: 'info', icon: Hourglass },
  called: { tone: 'warning', icon: PhoneCall },
  'in-progress': { tone: 'primary', icon: Stethoscope },
  completed: { tone: 'success', icon: CheckCircle2 },
  'no-show': { tone: 'neutral', icon: UserX },
  cancelled: { tone: 'danger', icon: AlertTriangle },
};

export interface StatusBadgeProps extends Omit<BadgeProps, 'tone' | 'children'> {
  /** The queue lifecycle state to render. */
  status: QueueStatus;
  /** Localised, human-readable label (e.g. t('queue.status.waiting')). */
  label: string;
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge(
  { status, label, ...props },
  ref,
) {
  const { tone, icon: StatusIcon } = STATUS_META[status];
  return (
    <Badge ref={ref} tone={tone} data-status={status} {...props}>
      <StatusIcon aria-hidden />
      {label}
    </Badge>
  );
});
StatusBadge.displayName = 'StatusBadge';
