// Shared design tokens, derived from design/TableSite.reference.html.
// Keep in sync with frontend/app/globals.css.

export const theme = {
  colors: {
    accent: "#C2410C",
    secondary: "#1F6F54",
    bg: "#FBF7F2",
    surface: "#FFFFFF",
    border: "#ECE1D5",
    ink: "#241D19",
    muted: "#9A8E82"
  },
  fonts: {
    sans: "Plus Jakarta Sans",
    khmer: "Noto Sans Khmer",
    display: "Outfit"
  },
  currency: {
    // USD is the base currency; KHR is shown alongside it for display.
    usdToKhrRate: 4100
  },
  locales: ["km", "en"] as const,
  defaultLocale: "km"
} as const;

export type Locale = (typeof theme.locales)[number];
