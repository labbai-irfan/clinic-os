/**
 * app/providers — public API barrel.
 * Governed by docs/architecture/Architecture.md §9. The app bootstrap imports AppProviders
 * from here; individual providers are exported for testing/composition.
 */
export type { AppProvidersProps } from './AppProviders';
export { AppProviders } from './AppProviders';
export { I18nProvider } from './I18nProvider';
export { NotificationProvider } from './NotificationProvider';
export type { OverlayContextValue, OverlayEntry } from './OverlayProviders';
export { DrawerProvider, ModalProvider, useDrawer, useModal } from './OverlayProviders';
export { QueryProvider } from './QueryProvider';
export { ThemeProvider } from './ThemeProvider';
