"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { setOperatingHours } from "@/lib/restaurants/api";
import type { DayOfWeek } from "@/lib/restaurants/types";

import type { ManageTabProps } from "./types";

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
  { key: "FRIDAY", label: "Friday" },
  { key: "SATURDAY", label: "Saturday" },
  { key: "SUNDAY", label: "Sunday" },
];

interface DayState {
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export function HoursTab({ restaurant, token, onSaved }: ManageTabProps) {
  const existing = new Map(restaurant.operatingHours.map((h) => [h.dayOfWeek, h]));

  const [hours, setHours] = useState<Record<DayOfWeek, DayState>>(() => {
    const initial = {} as Record<DayOfWeek, DayState>;
    for (const { key } of DAYS) {
      const found = existing.get(key);
      initial[key] = found
        ? { openTime: found.openTime, closeTime: found.closeTime, isClosed: found.isClosed }
        : { openTime: "09:00", closeTime: "21:00", isClosed: false };
    }
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function updateDay(day: DayOfWeek, patch: Partial<DayState>): void {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await setOperatingHours(
        restaurant.id,
        DAYS.map(({ key }) => ({ dayOfWeek: key, ...hours[key] })),
        token,
      );
      await onSaved();
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save hours");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-3">
      {DAYS.map(({ key, label }) => {
        const day = hours[key];
        return (
          <div key={key} className="flex items-center gap-4 rounded-xl border border-border p-3">
            <span className="w-28 shrink-0 text-sm font-semibold text-ink">{label}</span>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={day.isClosed}
                onChange={(e) => updateDay(key, { isClosed: e.target.checked })}
              />
              Closed
            </label>
            {!day.isClosed && (
              <>
                <input
                  type="time"
                  value={day.openTime}
                  onChange={(e) => updateDay(key, { openTime: e.target.value })}
                  className="rounded-lg border border-border px-2 py-1.5 text-sm text-ink"
                />
                <span className="text-muted">–</span>
                <input
                  type="time"
                  value={day.closeTime}
                  onChange={(e) => updateDay(key, { closeTime: e.target.value })}
                  className="rounded-lg border border-border px-2 py-1.5 text-sm text-ink"
                />
              </>
            )}
          </div>
        );
      })}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {savedAt && !error && <p className="text-sm text-secondary">Saved.</p>}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save hours"}
      </button>
    </form>
  );
}
