/**
 * WildAtlas India Design System Tokens
 * Near-monochrome UI chrome, photo-led wildlife focus.
 * Apple Human Interface Guidelines (HIG) aligned.
 */

export const colorSwatches = [
  // Grayscale / Monochrome
  { name: "Zinc 950", hex: "#09090b", class: "bg-zinc-950", category: "Grayscale", usage: "Primary text, solid button active state" },
  { name: "Zinc 900", hex: "#18181b", class: "bg-zinc-900", category: "Grayscale", usage: "Headers, dark cards, primary buttons" },
  { name: "Zinc 800", hex: "#27272a", class: "bg-zinc-800", category: "Grayscale", usage: "Active hover states, headings" },
  { name: "Zinc 600", hex: "#52525b", class: "bg-zinc-600", category: "Grayscale", usage: "Sub-text, body descriptions, icons" },
  { name: "Zinc 400", hex: "#a1a1aa", class: "bg-zinc-400", category: "Grayscale", usage: "Placeholders, state labels, secondary icons" },
  { name: "Zinc 300", hex: "#d4d4d8", class: "bg-zinc-300", category: "Grayscale", usage: "Dividers, card outlines, switch track" },
  { name: "Zinc 200", hex: "#e4e4e7", class: "bg-zinc-200", category: "Grayscale", usage: "Badge backgrounds, button hover" },
  { name: "Zinc 100", hex: "#f4f4f5", class: "bg-zinc-100", category: "Grayscale", usage: "Section backgrounds, code blocks" },
  { name: "Zinc 50", hex: "#fafafa", class: "bg-zinc-50", category: "Grayscale", usage: "Page canvas, card interiors" },
  { name: "Pure White", hex: "#ffffff", class: "bg-white border border-zinc-200", category: "Grayscale", usage: "Cards, floating panels, tooltips" },

  // Status & Accents
  { name: "Emerald 500", hex: "#10b981", class: "bg-emerald-500", category: "Accent & Status", usage: "Active toggles, active indicators" },
  { name: "Emerald 700", hex: "#047857", class: "bg-emerald-700", category: "Accent & Status", usage: "Least Concern (LC) status, state animal tag" },
  { name: "Yellow 500", hex: "#eab308", class: "bg-yellow-500", category: "Accent & Status", usage: "Near Threatened (NT) status badge" },
  { name: "Orange 500", hex: "#f97316", class: "bg-orange-500", category: "Accent & Status", usage: "Vulnerable (VU) status badge" },
  { name: "Amber 600", hex: "#d97706", class: "bg-amber-600", category: "Accent & Status", usage: "Endangered (EN) status, zoo marker" },
  { name: "Red 600", hex: "#dc2626", class: "bg-red-600", category: "Accent & Status", usage: "Critically Endangered (CR) status, danger action" },
  { name: "Audio Blue", hex: "#1a73e8", class: "bg-[#1a73e8]", category: "Accent & Status", usage: "Species call audio speaker button" },
];

export const typographyScale = [
  {
    role: "H1 — Display Title",
    font: "Manrope (Sans)",
    size: "32px / 36px (text-3xl / text-4xl)",
    weight: "Extrabold (800)",
    sample: "WildAtlas India Design System",
    class: "text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900",
  },
  {
    role: "H2 — Section Header",
    font: "Manrope (Sans)",
    size: "20px (text-xl)",
    weight: "Bold (700)",
    sample: "Layer Details & Component Catalog",
    class: "text-xl font-bold text-zinc-900",
  },
  {
    role: "H3 — Card Title",
    font: "Manrope (Sans)",
    size: "16px (text-base)",
    weight: "Semibold (600)",
    sample: "Interactive States & Accessibility (a11y)",
    class: "text-base font-semibold text-zinc-900",
  },
  {
    role: "Body — Primary Description",
    font: "Manrope (Sans)",
    size: "14px (text-sm)",
    weight: "Regular (400)",
    sample: "State-first interactive map exploring species distribution and protected areas across India.",
    class: "text-sm font-normal text-zinc-700 leading-relaxed",
  },
  {
    role: "Sub-text — Caption & Secondary",
    font: "Manrope (Sans)",
    size: "12px (text-xs)",
    weight: "Medium (500)",
    sample: "Compact, accessible button for icons with standard 44px hit targets and focus rings.",
    class: "text-xs font-medium text-zinc-500",
  },
  {
    role: "Tags & Mono Labels",
    font: "JetBrains Mono",
    size: "12px / 10px (text-xs / text-[10px])",
    weight: "Semibold / Bold (600/700)",
    sample: "SHIFT + V · CR · EN · 44km² · v1.0",
    class: "font-mono text-xs font-semibold uppercase tracking-wider text-zinc-800",
  },
];

export const zIndex = {
  base: "z-0",
  mapControls: "z-[2]",
  nav: "z-10",
  floatingCard: "z-20",
  topNav: "z-30",
  drawer: "z-50",
  loader: "z-50",
} as const;

export const glassmorphism = {
  floatingCapsule: "border border-zinc-300/80 bg-white/90 shadow-md backdrop-blur-xl",
  floatingCard: "rounded-[22px] border border-white/60 bg-white/85 p-4 shadow-xl backdrop-blur-2xl",
  drawer: "border-l border-white/60 bg-white/90 backdrop-blur-2xl shadow-2xl",
} as const;

export const tokens = {
  colors: colorSwatches,
  typography: typographyScale,
  radii: {
    lg: "rounded-xl",
    xl: "rounded-2xl",
    full: "rounded-full",
  },
  focus: {
    ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 focus-visible:ring-offset-2",
  },
  animation: {
    ios: "transition-all duration-200 ease-ios",
  },
  zIndex,
  glassmorphism,
} as const;

