/**
 * shared/notifications — public API barrel.
 * Governed by docs/Brain.md §11. Trigger toasts via the `notify` port (i18n keys only).
 */
export type { NotificationPort, NotifyOptions, PromiseKeys } from './notifications';
export { notify } from './notifications';
