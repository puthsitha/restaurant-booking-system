import type { Request } from "express";

export type Locale = "en" | "km";

// Diner-facing clients send their active UI language as a plain "en"/"km"
// value in Accept-Language (not a full BCP-47 list) — see frontend's
// apiFetch. Anything else (including no header) falls back to English.
export function getRequestLocale(req: Request): Locale {
  const header = req.headers["accept-language"];
  const value = Array.isArray(header) ? header[0] : header;
  return value?.toLowerCase().startsWith("km") ? "km" : "en";
}

interface LocalizableRestaurant {
  name: string;
  nameKm?: string | null;
  description?: string | null;
  descriptionKm?: string | null;
}

// Swaps `name`/`description` for their Khmer counterparts when present,
// falling back to English so callers never see an empty field just because
// a restaurant hasn't been translated yet. The `*Km` source fields are left
// in the result (owner/admin management screens need them to edit the
// Khmer text) — only the `name`/`description` keys themselves change value,
// so public callers that just want the display text see the same shape
// regardless of locale.
export function localizeRestaurant<T extends LocalizableRestaurant>(entity: T, locale: Locale): T {
  if (locale === "km") {
    return { ...entity, name: entity.nameKm || entity.name, description: entity.descriptionKm || entity.description };
  }
  return entity;
}

interface LocalizableTag {
  name: string;
  nameKm?: string | null;
}

export function localizeTag<T extends LocalizableTag>(entity: T, locale: Locale): T {
  if (locale === "km") {
    return { ...entity, name: entity.nameKm || entity.name };
  }
  return entity;
}

export function localizeTags<T extends LocalizableTag>(entities: T[], locale: Locale): T[] {
  return entities.map((entity) => localizeTag(entity, locale));
}
