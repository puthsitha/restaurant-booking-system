"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { SavedToast } from "@/components/ui/SavedToast";
import { UnsavedChangesBar } from "@/components/ui/UnsavedChangesBar";
import { ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { setOperatingHours } from "@/lib/restaurants/api";
import type { DayOfWeek } from "@/lib/restaurants/types";

import type { DirtyTabHandle, ManageTabProps } from "./types";

const DAYS = [
  { key: "MONDAY", labelKey: "ownerManage.hours.monday" },
  { key: "TUESDAY", labelKey: "ownerManage.hours.tuesday" },
  { key: "WEDNESDAY", labelKey: "ownerManage.hours.wednesday" },
  { key: "THURSDAY", labelKey: "ownerManage.hours.thursday" },
  { key: "FRIDAY", labelKey: "ownerManage.hours.friday" },
  { key: "SATURDAY", labelKey: "ownerManage.hours.saturday" },
  { key: "SUNDAY", labelKey: "ownerManage.hours.sunday" },
] as const satisfies { key: DayOfWeek; labelKey: TranslationKey }[];

interface DayState {
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

type HoursDraft = Record<DayOfWeek, DayState>;

function draftFromRestaurant(restaurant: ManageTabProps["restaurant"]): HoursDraft {
  const existing = new Map(restaurant.operatingHours.map((h) => [h.dayOfWeek, h]));
  const draft = {} as HoursDraft;
  for (const { key } of DAYS) {
    const found = existing.get(key);
    draft[key] = found
      ? { openTime: found.openTime, closeTime: found.closeTime, isClosed: found.isClosed }
      : { openTime: "09:00", closeTime: "21:00", isClosed: false };
  }
  return draft;
}

export const HoursTab = forwardRef<DirtyTabHandle, ManageTabProps>(function HoursTab(
  { restaurant, token, onSaved, onDirtyChange },
  ref,
) {
  const { t } = useLanguage();
  const baseline = useRef(draftFromRestaurant(restaurant));
  const [hours, setHours] = useState(baseline.current);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = JSON.stringify(hours) !== JSON.stringify(baseline.current);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function updateDay(day: DayOfWeek, patch: Partial<DayState>): void {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  const save = useCallback(async (): Promise<boolean> => {
    setError(null);
    setIsSaving(true);
    try {
      await setOperatingHours(
        restaurant.id,
        DAYS.map(({ key }) => ({ dayOfWeek: key, ...hours[key] })),
        token,
      );
      await onSaved();
      baseline.current = hours;
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.hours.loadError"));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [restaurant.id, token, hours, onSaved, t]);

  useImperativeHandle(ref, () => ({ save }), [save]);

  function discard(): void {
    setHours(baseline.current);
    setError(null);
  }

  return (
    <div className="max-w-xl space-y-3 pb-2">
      {DAYS.map(({ key, labelKey }) => {
        const day = hours[key];
        return (
          <div key={key} className="flex items-center gap-4 rounded-xl border border-border p-3">
            <span className="w-28 shrink-0 text-sm font-semibold text-ink">{t(labelKey)}</span>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={day.isClosed}
                onChange={(e) => updateDay(key, { isClosed: e.target.checked })}
              />
              {t("ownerManage.hours.closed")}
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

      <UnsavedChangesBar
        visible={isDirty || isSaving}
        isSaving={isSaving}
        error={error}
        onSave={save}
        onDiscard={discard}
        saveLabel={t("ownerManage.hours.saveHours")}
      />
      <SavedToast visible={justSaved && !isDirty} />
    </div>
  );
});
