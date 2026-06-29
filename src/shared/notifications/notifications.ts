/**
 * notifications.ts — the ClinicOS toast/notification port.
 *
 * Governed by: docs/Brain.md §11 (Success state: "optimistic feedback (toast/inline)") and
 * §4 (vendor SDKs sit behind a port). docs/Frontend-Bible.md §9.7 (reduced motion).
 *
 * WHY a port over react-hot-toast:
 *   - UI/feature code calls `notify.success('feature.area.done')` with an i18n KEY, never a
 *     literal string (Brain §8). The port resolves the key via i18next, so copy stays
 *     localized and the toast library stays swappable.
 *   - react-hot-toast is rendered by NotificationProvider's <Toaster/>; this module only
 *     triggers toasts. Reduced-motion users get an instant, non-animated toast.
 *
 * NEVER pass PHI or raw error text as a message — always an i18n key.
 */

import toast, { type ToastOptions } from 'react-hot-toast';

import { i18n } from '@shared/localization';
import { isReducedMotion } from '@shared/theme';

/** Optional per-call settings (all PHI-free). */
export interface NotifyOptions {
  /** i18next interpolation values for the message key. */
  values?: Record<string, unknown>;
  /** Auto-dismiss duration (ms). */
  durationMs?: number;
  /** Stable id to dedupe/replace an existing toast. */
  id?: string;
}

/** i18n key map for the promise() lifecycle states. */
export interface PromiseKeys {
  loading: string;
  success: string;
  error: string;
}

/**
 * NotificationPort — the stable notification contract. `messageKey` is always an i18n key.
 */
export interface NotificationPort {
  success(messageKey: string, options?: NotifyOptions): void;
  error(messageKey: string, options?: NotifyOptions): void;
  info(messageKey: string, options?: NotifyOptions): void;
  warning(messageKey: string, options?: NotifyOptions): void;
  /** Bind a toast lifecycle to a promise (loading → success/error), all via keys. */
  promise<T>(promise: Promise<T>, keys: PromiseKeys, options?: NotifyOptions): Promise<T>;
  /** Programmatically dismiss a toast (or all, if no id). */
  dismiss(id?: string): void;
}

/** Resolve an i18n key (with optional interpolation) to a localized string. */
function translate(messageKey: string, values?: Record<string, unknown>): string {
  return i18n.t(messageKey, values ?? {});
}

/** Build react-hot-toast options, disabling motion for reduced-motion users. */
function toToastOptions(options?: NotifyOptions): ToastOptions {
  const opts: ToastOptions = {};
  if (options?.durationMs !== undefined) opts.duration = options.durationMs;
  if (options?.id !== undefined) opts.id = options.id;
  if (isReducedMotion()) {
    // Collapse enter/exit animation to an instant appearance (Frontend-Bible §9.7).
    opts.className = 'motion-reduce';
    opts.style = { animation: 'none', transition: 'none' };
  }
  return opts;
}

/**
 * notify — the default NotificationPort implementation, delegating to react-hot-toast.
 * The <Toaster/> that renders these lives in app/providers/NotificationProvider.tsx.
 */
export const notify: NotificationPort = {
  success(messageKey, options) {
    toast.success(translate(messageKey, options?.values), toToastOptions(options));
  },
  error(messageKey, options) {
    toast.error(translate(messageKey, options?.values), toToastOptions(options));
  },
  info(messageKey, options) {
    // react-hot-toast has no dedicated "info" — use the neutral toast.
    toast(translate(messageKey, options?.values), toToastOptions(options));
  },
  warning(messageKey, options) {
    toast(translate(messageKey, options?.values), {
      ...toToastOptions(options),
      icon: '⚠️',
    });
  },
  promise(promise, keys, options) {
    void toast.promise(
      promise,
      {
        loading: translate(keys.loading, options?.values),
        success: translate(keys.success, options?.values),
        error: translate(keys.error, options?.values),
      },
      toToastOptions(options),
    );
    return promise;
  },
  dismiss(id) {
    toast.dismiss(id);
  },
};
