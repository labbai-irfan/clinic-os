/**
 * OverlayProviders.tsx — Modal + Drawer overlay context (minimal, real, empty registries).
 *
 * Governed by: docs/architecture/Architecture.md (provider hierarchy) and docs/Brain.md §9
 * (UI/overlay state is client state).
 *
 * WHY these exist & their position:
 *   - They are the INNERMOST providers (just outside the Router) so any route/page can open
 *     a modal or drawer through a stable context, and overlays render above all page content
 *     but inside the themed, localized, query-enabled tree.
 *   - This phase ships the *runtime contract* only: an open/close API + an empty registry.
 *     The actual overlay COMPONENTS (Dialog, Drawer) are design-system work for a later
 *     phase; wiring them now would violate "no design-system components". The empty
 *     registry is intentional and documented (spec: "empty registries are fine if
 *     documented").
 *
 * Design: a tiny context store keyed by overlay id. No portal/rendering of overlays yet —
 * the registry tracks *which* overlay is open so the future <ModalHost/> can render it.
 */

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

/** A single open-overlay record. `payload` is opaque, overlay-specific data (PHI-free). */
export interface OverlayEntry {
  id: string;
  payload?: unknown;
}

/** The open/close contract exposed to consumers via context. */
export interface OverlayContextValue {
  /** Currently-open overlays, in open order. Empty in this foundation phase. */
  readonly open: readonly OverlayEntry[];
  openOverlay: (id: string, payload?: unknown) => void;
  closeOverlay: (id: string) => void;
  closeAll: () => void;
  isOpen: (id: string) => boolean;
}

function createOverlayContext(): {
  Context: ReturnType<typeof createContext<OverlayContextValue | null>>;
  Provider: (props: { children: ReactNode }) => JSX.Element;
} {
  const Context = createContext<OverlayContextValue | null>(null);

  function Provider({ children }: { children: ReactNode }): JSX.Element {
    const [open, setOpen] = useState<readonly OverlayEntry[]>([]);

    const openOverlay = useCallback((id: string, payload?: unknown) => {
      setOpen((prev) => (prev.some((e) => e.id === id) ? prev : [...prev, { id, payload }]));
    }, []);

    const closeOverlay = useCallback((id: string) => {
      setOpen((prev) => prev.filter((e) => e.id !== id));
    }, []);

    const closeAll = useCallback(() => setOpen([]), []);

    const isOpen = useCallback((id: string) => open.some((e) => e.id === id), [open]);

    const value = useMemo<OverlayContextValue>(
      () => ({ open, openOverlay, closeOverlay, closeAll, isOpen }),
      [open, openOverlay, closeOverlay, closeAll, isOpen],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  return { Context, Provider };
}

const modal = createOverlayContext();
const drawer = createOverlayContext();

/**
 * ModalProvider — overlay context for modals/dialogs. Empty registry until the
 * design-system phase adds modal components and a <ModalHost/>.
 */
export function ModalProvider({ children }: { children: ReactNode }): JSX.Element {
  return <modal.Provider>{children}</modal.Provider>;
}

/**
 * DrawerProvider — overlay context for drawers/sheets. Empty registry until the
 * design-system phase adds drawer components and a <DrawerHost/>.
 */
export function DrawerProvider({ children }: { children: ReactNode }): JSX.Element {
  return <drawer.Provider>{children}</drawer.Provider>;
}

/** Access the modal overlay API. Throws if used outside <ModalProvider/>. */
export function useModal(): OverlayContextValue {
  const ctx = useContext(modal.Context);
  if (!ctx) throw new Error('useModal must be used within <ModalProvider/>');
  return ctx;
}

/** Access the drawer overlay API. Throws if used outside <DrawerProvider/>. */
export function useDrawer(): OverlayContextValue {
  const ctx = useContext(drawer.Context);
  if (!ctx) throw new Error('useDrawer must be used within <DrawerProvider/>');
  return ctx;
}
