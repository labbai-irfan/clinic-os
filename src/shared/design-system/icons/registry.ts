/**
 * Icon Registry — the single, curated, semantic source of truth for icons.
 *
 * The app NEVER imports lucide-react icons directly in feature code. Instead it
 * references a named, categorised icon from this registry (e.g. `icons.medical.
 * stethoscope`) and renders it through the design-system `<Icon>` wrapper. This:
 *   - decouples the product from the icon vendor (swap lucide → a custom pack by
 *     editing ONLY this file — backend/vendor independence, AI_RULES),
 *   - guarantees one consistent icon per concept across the whole UI,
 *   - keeps icons theme-aware (lucide renders `currentColor`; the wrapper applies
 *     the `--icon-stroke` / `--icon-size-*` tokens) and a11y-correct.
 *
 * Adding an icon: import the lucide glyph, add it to the right category below.
 * Categories are closed maps (`satisfies Record<string, LucideIcon>`), so a typo
 * or a removed glyph fails the build.
 *
 * Governed by: docs/assets/IconGuidelines.md, docs/design-system/* (Icon),
 * docs/Naming-Convention.md (icon keys are camelCase concepts, not glyph names).
 */
import {
  Accessibility,
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  Ban,
  BarChart3,
  Bell,
  BellRing,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Contrast,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  HeartPulse,
  Hourglass,
  Info,
  Languages,
  LayoutDashboard,
  LineChart,
  type LucideIcon,
  Menu,
  Microscope,
  Moon,
  MoreVertical,
  Pencil,
  PhoneCall,
  PieChart,
  Pill,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  Siren,
  Stethoscope,
  Sun,
  Syringe,
  Thermometer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Type,
  Upload,
  Users,
  UserX,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';

/** Clinical / healthcare concepts. Universal medical metaphors (Localization §10). */
export const medicalIcons = {
  consultation: Stethoscope,
  prescription: Pill,
  injection: Syringe,
  vitals: HeartPulse,
  activity: Activity,
  temperature: Thermometer,
  emergency: Ambulance,
  record: ClipboardList,
  document: FileText,
  lab: Microscope,
} as const satisfies Record<string, LucideIcon>;

/** Primary navigation — one icon per top-level destination (the patient journey). */
export const navigationIcons = {
  dashboard: LayoutDashboard,
  patients: Users,
  appointments: CalendarDays,
  queue: Hourglass,
  consultation: Stethoscope,
  pharmacy: Pill,
  billing: Receipt,
  analytics: BarChart3,
  notifications: Bell,
  settings: Settings,
  menu: Menu,
  next: ChevronRight,
  previous: ChevronLeft,
  expand: ChevronDown,
} as const satisfies Record<string, LucideIcon>;

/** Generic actions (verbs). Reused across every screen for consistency. */
export const actionIcons = {
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  print: Printer,
  save: Save,
  copy: Copy,
  refresh: RefreshCw,
  more: MoreVertical,
  confirm: Check,
  close: X,
} as const satisfies Record<string, LucideIcon>;

/** Status / lifecycle. Pair with text — never colour/icon alone (a11y §9). */
export const statusIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  pending: Clock,
  waiting: Hourglass,
  scheduled: CalendarClock,
  called: PhoneCall,
  noShow: UserX,
  blocked: Ban,
} as const satisfies Record<string, LucideIcon>;

/** Urgent / alerting. Reserved for genuine attention surfaces. */
export const alertIcons = {
  warning: AlertTriangle,
  critical: AlertOctagon,
  emergency: Siren,
  security: ShieldAlert,
  notify: BellRing,
} as const satisfies Record<string, LucideIcon>;

/** Analytics & charts. */
export const analyticsIcons = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  trendUp: TrendingUp,
  trendDown: TrendingDown,
  activity: Activity,
} as const satisfies Record<string, LucideIcon>;

/** Accessibility & theme controls (large text, contrast, language, motion). */
export const accessibilityIcons = {
  accessibility: Accessibility,
  largeText: Type,
  contrast: Contrast,
  language: Languages,
  show: Eye,
  hide: EyeOff,
  sound: Volume2,
  light: Sun,
  dark: Moon,
} as const satisfies Record<string, LucideIcon>;

/**
 * The complete registry, grouped by category. This is the public surface the app
 * reads from (`icons.medical.consultation`). Categories are the extension points
 * for future custom icon packs.
 */
export const icons = {
  medical: medicalIcons,
  navigation: navigationIcons,
  action: actionIcons,
  status: statusIcons,
  alert: alertIcons,
  analytics: analyticsIcons,
  accessibility: accessibilityIcons,
} as const;

/** Icon category names (`'medical' | 'navigation' | …`). */
export type IconCategory = keyof typeof icons;
