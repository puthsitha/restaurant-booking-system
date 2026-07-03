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
    muted: "#9A8E82",
    // Form-field label / secondary body text (between ink and muted).
    label: "#5C5048",
    // Owner/admin dashboard page background (slightly cooler than the
    // customer site's warm `bg`).
    dashboardBg: "#F4F1ED",
    dashboardBorder: "#E7E0D8",
    // Dark sidebar chrome for the owner portal and admin panel.
    ownerSidebar: "#1C1714",
    adminSidebar: "#15110F",
    sidebarText: "#B7ABA0",
    sidebarMuted: "#6B5F55",
    sidebarBorder: "#2D2520",
    // Admin panel's brand accent (distinct from the owner/customer orange).
    adminAccent: "#6D28D9",
    // Fixed dark tint for modal/lightbox scrims — stays the same across the
    // light/dark theme toggle. Dark-theme overrides for bg/surface/border/
    // ink/muted/label/dashboardBg/dashboardBorder live in globals.css only
    // (under `:root[data-theme="dark"]`), since this object always reflects
    // the light values.
    scrim: "#241D19",
    // Reservation status colors: [text, bg-tint].
    status: {
      pending: { text: "#B45309", bg: "#FEF3C7" },
      confirmed: { text: "#1F6F54", bg: "#DCFCE7" },
      seated: { text: "#1D4ED8", bg: "#DBEAFE" },
      completed: { text: "#1F6F54", bg: "#DCFCE7" },
      cancelled: { text: "#9A8E82", bg: "#EDE7E0" },
      noShow: { text: "#B91C1C", bg: "#FEE2E2" }
    }
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
