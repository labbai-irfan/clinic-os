/**
 * App.tsx — the application component: renders the router inside the provider stack.
 *
 * Governed by: docs/architecture/Architecture.md §9 (composition root) and the Phase 3 spec
 * (App renders RouterProvider with a minimal root route → the "Foundation Ready" screen).
 *
 * WHY App is thin:
 *   - All cross-cutting context lives in <AppProviders> (composed in main.tsx). App's only
 *     job is to render the <RouterProvider>. Keeping App minimal means the bootstrap order
 *     (validate env → init i18n → start MSW → mount providers → render App) stays obvious.
 */

import { RouterProvider } from 'react-router-dom';

import { router } from './router/router';

/**
 * App — mounts the data router. Rendered as <AppProviders><App/></AppProviders> in main.tsx.
 */
export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
