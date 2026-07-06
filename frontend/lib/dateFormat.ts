// Shared date formatting for the booking flow: locale-aware absolute dates
// (en: "06-Jul-2027", km: "ថ្ងៃទី 06 ខែកក្កដា ឆ្នាំ 2027") plus relative
// labels (Today / Tomorrow / Next week (on …) / Next month (on …)) so the
// same date reads naturally in either language.
import type { Locale } from "@/lib/theme";
import type { TranslationKey, TranslationParams } from "@/lib/i18n/translations";

type Translate = (key: TranslationKey, params?: TranslationParams) => string;

const MONTH_KEYS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec"
] as const;

export function parseIsoDate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export function formatAbsoluteDate(date: Date, locale: Locale, t: Translate): string {
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const month = t(`dateField.months.${MONTH_KEYS[date.getMonth()]}` as TranslationKey);
  if (locale === "km") {
    return `ថ្ងៃទី ${day} ខែ${month} ឆ្នាំ ${year}`;
  }
  return `${day}-${month.slice(0, 3)}-${year}`;
}

// Buckets a date relative to `now` into Today / Tomorrow / next calendar
// week / next calendar month, falling back to the plain absolute date.
export function formatRelativeDate(
  date: Date,
  locale: Locale,
  t: Translate,
  now: Date = new Date()
): string {
  const today = startOfDay(now);
  const target = startOfDay(date);
  const absolute = formatAbsoluteDate(target, locale, t);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return t("dateField.today");
  if (diffDays === 1) return t("dateField.tomorrow");

  const nextWeekStart = startOfWeek(today);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const weekAfterNextStart = new Date(nextWeekStart);
  weekAfterNextStart.setDate(weekAfterNextStart.getDate() + 7);
  if (target >= nextWeekStart && target < weekAfterNextStart) {
    return t("dateField.nextWeekOn", { date: absolute });
  }

  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const monthAfterNextStart = new Date(today.getFullYear(), today.getMonth() + 2, 1);
  if (target >= nextMonthStart && target < monthAfterNextStart) {
    return t("dateField.nextMonthOn", { date: absolute });
  }

  return absolute;
}
