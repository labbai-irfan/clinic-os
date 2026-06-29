/**
 * Component Registry — the permanent, machine-checkable source of truth for every
 * ClinicOS design-system component.
 *
 * WHY a code registry (not just docs): it is type-checked, it powers tooling
 * (`pnpm ds:registry` validates that every registered component has a folder + a
 * public export, and flags unregistered folders), and it generates the human
 * catalog (`docs/design-system/ComponentRegistry.md`). This is how the AI_RULES
 * "always check the registry / never duplicate a component" is *enforced*, not
 * just asked. Adding a component WITHOUT registering it fails `ds:registry`.
 *
 * Governed by: docs/design-system/DesignSystem.md (Part 8 — Component Registry),
 * docs/design-system/ContributionGuide.md, PROJECT_BRAIN.md §22.
 */

/** Lifecycle status of a component. */
export type ComponentStatus = 'stable' | 'beta' | 'experimental' | 'deprecated' | 'planned';

/** The component categories (Part 4) — one primary category per component. */
export type ComponentCategory =
  | 'primitive' // atoms: text-agnostic building blocks
  | 'form' // interactive inputs/controls
  | 'layout' // structure & composition surfaces
  | 'navigation' // wayfinding (planned)
  | 'data-display' // present data
  | 'feedback' // status, loading, empty/error
  | 'overlay' // floating layers
  | 'healthcare' // clinical-domain components
  | 'analytics' // charts/metrics (planned)
  | 'utility'; // a11y/headless helpers

/** A single registry entry. */
export interface ComponentEntry {
  /** PascalCase public export name. */
  readonly name: string;
  /** Primary category. */
  readonly category: ComponentCategory;
  /** Lifecycle status. */
  readonly status: ComponentStatus;
  /** Foundation version the component was introduced in. */
  readonly since: string;
  /** Folder under `design-system/components/` (kebab); `null` for planned. */
  readonly slug: string | null;
  /** Other design-system components this composes/exports alongside. */
  readonly composes?: readonly string[];
  /** Whether a Storybook story exists. */
  readonly hasStories: boolean;
  /** Whether a Vitest test (incl. axe) exists. */
  readonly hasTests: boolean;
  /** One-line accessibility contract. */
  readonly a11y: string;
  /** One-line purpose. */
  readonly description: string;
}

const V1 = '0.6.0'; // Component Library phase

/** The registry. STABLE entries map 1:1 to `components/<slug>/`. */
export const COMPONENT_REGISTRY: readonly ComponentEntry[] = [
  // ----- Form -----
  {
    name: 'Button',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'button',
    hasStories: true,
    hasTests: true,
    a11y: 'keyboard-operable, focus ring, aria-busy when loading, asChild-safe',
    description: 'Primary action control; variants + sizes + loading.',
  },
  {
    name: 'IconButton',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'icon-button',
    composes: ['Icon'],
    hasStories: true,
    hasTests: false,
    a11y: 'requires aria-label (icon-only)',
    description: 'Square icon-only action button.',
  },
  {
    name: 'Input',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'input',
    hasStories: true,
    hasTests: true,
    a11y: 'aria-invalid on error; label via FormField',
    description: 'Single-line text field.',
  },
  {
    name: 'Textarea',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'textarea',
    hasStories: true,
    hasTests: false,
    a11y: 'aria-invalid; resizable',
    description: 'Multi-line text field.',
  },
  {
    name: 'Label',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'label',
    hasStories: true,
    hasTests: false,
    a11y: 'associates via htmlFor; required marker',
    description: 'Form control label.',
  },
  {
    name: 'FormField',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'form-field',
    composes: ['Label'],
    hasStories: true,
    hasTests: false,
    a11y: 'wires label + hint + error to control (id/aria-describedby/aria-invalid)',
    description: 'Accessible field wrapper.',
  },
  {
    name: 'Checkbox',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'checkbox',
    hasStories: true,
    hasTests: true,
    a11y: 'native checkbox semantics; aria-invalid',
    description: 'Boolean toggle (multi-select).',
  },
  {
    name: 'Radio',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'radio',
    composes: ['RadioGroup'],
    hasStories: true,
    hasTests: false,
    a11y: 'radiogroup semantics; data-invalid',
    description: 'Single-select option (with RadioGroup).',
  },
  {
    name: 'Switch',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'switch',
    hasStories: true,
    hasTests: true,
    a11y: 'role=switch, aria-checked, Space/Enter',
    description: 'On/off toggle.',
  },
  {
    name: 'Select',
    category: 'form',
    status: 'stable',
    since: V1,
    slug: 'select',
    composes: ['Icon'],
    hasStories: true,
    hasTests: false,
    a11y: 'native select semantics',
    description: 'Single-select dropdown (native).',
  },

  // ----- Layout -----
  {
    name: 'Card',
    category: 'layout',
    status: 'stable',
    since: V1,
    slug: 'card',
    composes: ['Slot'],
    hasStories: true,
    hasTests: true,
    a11y: 'interactive variant gets focus ring; semantics via consumer',
    description: 'Raised surface (+ Header/Title/Description/Content/Footer).',
  },
  {
    name: 'BentoGrid',
    category: 'layout',
    status: 'stable',
    since: V1,
    slug: 'bento-grid',
    composes: ['BentoItem'],
    hasStories: true,
    hasTests: false,
    a11y: 'responsive grid; tiles are content regions',
    description: 'Calm bento dashboard grid (+ BentoItem with col/row span).',
  },
  {
    name: 'Divider',
    category: 'layout',
    status: 'stable',
    since: V1,
    slug: 'divider',
    hasStories: true,
    hasTests: false,
    a11y: 'role=separator + orientation',
    description: 'Visual/semantic separator.',
  },

  // ----- Data display -----
  {
    name: 'Badge',
    category: 'data-display',
    status: 'stable',
    since: V1,
    slug: 'badge',
    hasStories: true,
    hasTests: true,
    a11y: 'tone paired with text/icon — never colour alone',
    description: 'Compact tone-coded label.',
  },
  {
    name: 'Avatar',
    category: 'data-display',
    status: 'stable',
    since: V1,
    slug: 'avatar',
    hasStories: true,
    hasTests: false,
    a11y: 'alt required; initials fallback',
    description: 'User/org avatar with fallback.',
  },

  // ----- Healthcare -----
  {
    name: 'StatusBadge',
    category: 'healthcare',
    status: 'stable',
    since: V1,
    slug: 'status-badge',
    composes: ['Badge'],
    hasStories: true,
    hasTests: false,
    a11y: 'colour + icon + text for each queue state',
    description: 'Queue-lifecycle status (scheduled→cancelled).',
  },

  // ----- Feedback -----
  {
    name: 'Alert',
    category: 'feedback',
    status: 'stable',
    since: V1,
    slug: 'alert',
    hasStories: true,
    hasTests: true,
    a11y: 'role=status|alert by tone; icon + text',
    description: 'Inline status banner.',
  },
  {
    name: 'EmptyState',
    category: 'feedback',
    status: 'stable',
    since: V1,
    slug: 'empty-state',
    composes: ['Button'],
    hasStories: true,
    hasTests: true,
    a11y: 'heading + description + one CTA',
    description: 'No-data surface.',
  },
  {
    name: 'ErrorState',
    category: 'feedback',
    status: 'stable',
    since: V1,
    slug: 'error-state',
    composes: ['Button'],
    hasStories: true,
    hasTests: false,
    a11y: 'danger-toned; retry action',
    description: 'Failed-async surface.',
  },
  {
    name: 'Spinner',
    category: 'feedback',
    status: 'stable',
    since: V1,
    slug: 'spinner',
    hasStories: true,
    hasTests: false,
    a11y: 'aria-hidden unless labelled (role=status)',
    description: 'Indeterminate loading indicator.',
  },
  {
    name: 'Skeleton',
    category: 'feedback',
    status: 'stable',
    since: V1,
    slug: 'skeleton',
    hasStories: true,
    hasTests: false,
    a11y: 'aria-hidden; reduced-motion safe',
    description: 'Loading placeholder.',
  },

  // ----- Overlay -----
  {
    name: 'Tooltip',
    category: 'overlay',
    status: 'stable',
    since: V1,
    slug: 'tooltip',
    hasStories: true,
    hasTests: false,
    a11y: 'hover+focus, role=tooltip, aria-describedby, Escape',
    description: 'Contextual hint on hover/focus.',
  },

  // ----- Utility / primitive -----
  {
    name: 'Icon',
    category: 'utility',
    status: 'stable',
    since: V1,
    slug: 'icon',
    hasStories: true,
    hasTests: false,
    a11y: 'decorative (aria-hidden) unless aria-label',
    description: 'Token-sized lucide wrapper (consumes the Icon Registry).',
  },
  {
    name: 'VisuallyHidden',
    category: 'utility',
    status: 'stable',
    since: V1,
    slug: 'visually-hidden',
    hasStories: true,
    hasTests: false,
    a11y: 'sr-only content for assistive tech',
    description: 'Visually hides content while keeping it announced.',
  },

  // ----- Planned (next phases) — registered so they are NOT re-invented ad-hoc -----
  {
    name: 'Tabs',
    category: 'navigation',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'tablist/tab/tabpanel, arrow-key roving',
    description: 'Tabbed navigation.',
  },
  {
    name: 'Breadcrumb',
    category: 'navigation',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'nav + aria-current',
    description: 'Hierarchical wayfinding.',
  },
  {
    name: 'Pagination',
    category: 'navigation',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'nav + aria-current page',
    description: 'Paged navigation.',
  },
  {
    name: 'Dialog',
    category: 'overlay',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'focus trap + restore, Escape, aria-modal',
    description: 'Modal dialog.',
  },
  {
    name: 'Drawer',
    category: 'overlay',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'focus trap, Escape, aria-modal',
    description: 'Side sheet.',
  },
  {
    name: 'DropdownMenu',
    category: 'overlay',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'menu/menuitem, arrow-key roving',
    description: 'Action menu.',
  },
  {
    name: 'Toast',
    category: 'feedback',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'aria-live polite/assertive',
    description: 'Transient notification (visual; port exists).',
  },
  {
    name: 'Progress',
    category: 'feedback',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'role=progressbar + aria-valuenow',
    description: 'Determinate progress.',
  },
  {
    name: 'Stepper',
    category: 'navigation',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'ordered steps + aria-current',
    description: 'Multi-step flow indicator.',
  },
  {
    name: 'Table',
    category: 'data-display',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'native table semantics, sortable headers',
    description: 'Data table / grid.',
  },
  {
    name: 'Combobox',
    category: 'form',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'combobox + listbox, type-ahead',
    description: 'Searchable select.',
  },
  {
    name: 'DatePicker',
    category: 'form',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'grid calendar, keyboard nav, locale-aware',
    description: 'Date selection.',
  },
  {
    name: 'VitalBadge',
    category: 'healthcare',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'severity by colour + icon + text',
    description: 'Vital-sign severity indicator.',
  },
  {
    name: 'Chart',
    category: 'analytics',
    status: 'planned',
    since: 'TBD',
    slug: null,
    hasStories: false,
    hasTests: false,
    a11y: 'accessible name + data table fallback',
    description: 'Token-themed chart primitive.',
  },
];

/** All categories present in the registry (for grouped rendering). */
export const COMPONENT_CATEGORIES: readonly ComponentCategory[] = [
  'primitive',
  'form',
  'layout',
  'navigation',
  'data-display',
  'feedback',
  'overlay',
  'healthcare',
  'analytics',
  'utility',
];

/** Look up an entry by its export name. */
export function getComponentEntry(name: string): ComponentEntry | undefined {
  return COMPONENT_REGISTRY.find((entry) => entry.name === name);
}

/** Shipped (non-planned) components only. */
export const SHIPPED_COMPONENTS: readonly ComponentEntry[] = COMPONENT_REGISTRY.filter(
  (entry) => entry.slug !== null,
);
