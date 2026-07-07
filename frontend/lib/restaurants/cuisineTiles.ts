import type { TranslationKey } from "@/lib/i18n/translations";

// Preset cuisine categories used both as the home page's browse tiles and
// the search sidebar's cuisine chips — `cuisine` is the exact (case
// insensitive) value matched against `Restaurant.cuisineType` server-side,
// so keep it in sync with how restaurants are actually tagged.
export const CUISINE_TILES: { labelKey: TranslationKey; icon: string; cuisine?: string }[] = [
  { labelKey: "cuisines.khmer", icon: "🍚", cuisine: "Khmer" },
  { labelKey: "cuisines.seafood", icon: "🦐", cuisine: "Seafood" },
  { labelKey: "cuisines.bbqGrill", icon: "🔥", cuisine: "BBQ" },
  { labelKey: "cuisines.fineDining", icon: "🍽️", cuisine: undefined },
  { labelKey: "cuisines.cafe", icon: "☕", cuisine: "Café" },
  { labelKey: "cuisines.streetFood", icon: "🍢", cuisine: "Street food" },
];
