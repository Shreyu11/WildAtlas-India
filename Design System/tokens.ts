/**
 * WildAtlas India Design System Tokens
 * Near-monochrome UI chrome, photo-led wildlife focus.
 */

export const tokens = {
  colors: {
    bg: {
      primary: "bg-white",
      secondary: "bg-zinc-100",
      subtle: "bg-zinc-50",
      glass: "bg-white/90 backdrop-blur-xl",
      glassDense: "bg-white/95 backdrop-blur-2xl",
      dark: "bg-zinc-900",
    },
    text: {
      primary: "text-zinc-900",
      secondary: "text-zinc-700",
      muted: "text-zinc-500",
      subtle: "text-zinc-400",
      inverse: "text-white",
      accent: "text-emerald-600",
    },
    border: {
      light: "border-zinc-200/60",
      standard: "border-zinc-300/80",
      strong: "border-zinc-400",
      glass: "border-white/20",
    },
    accent: {
      emerald: "bg-emerald-500",
      emeraldHover: "bg-emerald-600",
      emeraldLight: "bg-emerald-50",
    },
  },
  typography: {
    sans: "font-sans",
    mono: "font-mono",
  },
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
} as const;
