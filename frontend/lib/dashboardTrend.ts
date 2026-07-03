import type { StatTrend } from "@/components/dashboard/StatCard";

// Real day-over-day comparison (never a fabricated number) — used by the
// owner/admin dashboards to power each stat tile's trend pill.
export function trendFrom(current: number, previous: number): StatTrend | undefined {
  if (previous === 0) {
    if (current === 0) return undefined;
    return { label: "New", tone: "positive" };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { label: "No change", tone: "neutral" };
  return { label: `${pct > 0 ? "+" : ""}${pct}%`, tone: pct > 0 ? "positive" : "negative" };
}
