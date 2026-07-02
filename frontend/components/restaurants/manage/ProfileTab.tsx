"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { FormEvent } from "react";

import { SavedToast } from "@/components/ui/SavedToast";
import { UnsavedChangesBar } from "@/components/ui/UnsavedChangesBar";
import { ApiError } from "@/lib/api";
import { updateRestaurant } from "@/lib/restaurants/api";
import type { PriceRange } from "@/lib/restaurants/types";

import type { DirtyTabHandle, ManageTabProps } from "./types";

const FIELD_CLASS =
  "w-full rounded-xl border border-border px-4 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";
const LABEL_CLASS = "mb-1.5 block text-xs font-bold text-[#5C5048]";

interface ProfileDraft {
  name: string;
  description: string;
  cuisineType: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  coverImageUrl: string;
  priceRange: PriceRange;
  depositRequired: boolean;
  depositAmount: string;
}

function draftFromRestaurant(restaurant: ManageTabProps["restaurant"]): ProfileDraft {
  return {
    name: restaurant.name,
    description: restaurant.description ?? "",
    cuisineType: restaurant.cuisineType,
    address: restaurant.address,
    city: restaurant.city,
    phone: restaurant.phone ?? "",
    website: restaurant.website ?? "",
    coverImageUrl: restaurant.coverImageUrl ?? "",
    priceRange: restaurant.priceRange,
    depositRequired: restaurant.depositRequired,
    depositAmount: String(restaurant.depositAmount),
  };
}

export const ProfileTab = forwardRef<DirtyTabHandle, ManageTabProps>(function ProfileTab(
  { restaurant, token, onSaved, onDirtyChange },
  ref,
) {
  const baseline = useRef(draftFromRestaurant(restaurant));
  const [draft, setDraft] = useState(baseline.current);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(baseline.current);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function set<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]): void {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const save = useCallback(async (): Promise<boolean> => {
    setError(null);
    setIsSaving(true);
    try {
      await updateRestaurant(
        restaurant.id,
        {
          name: draft.name,
          slug: restaurant.slug,
          description: draft.description || undefined,
          cuisineType: draft.cuisineType,
          address: draft.address,
          city: draft.city,
          phone: draft.phone || undefined,
          website: draft.website || undefined,
          coverImageUrl: draft.coverImageUrl || undefined,
          priceRange: draft.priceRange,
          depositRequired: draft.depositRequired,
          depositAmount: Number(draft.depositAmount) || 0,
        },
        token,
      );
      await onSaved();
      baseline.current = draft;
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes");
      return false;
    } finally {
      setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant.id, restaurant.slug, token, draft, onSaved]);

  useImperativeHandle(ref, () => ({ save }), [save]);

  function discard(): void {
    setDraft(baseline.current);
    setError(null);
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    await save();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 pb-2">
      <div>
        <label className={LABEL_CLASS}>Name</label>
        <input
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          className={FIELD_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={FIELD_CLASS}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Cuisine type</label>
          <input
            value={draft.cuisineType}
            onChange={(e) => set("cuisineType", e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>City</label>
          <input
            value={draft.city}
            onChange={(e) => set("city", e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASS}>Address</label>
        <input
          value={draft.address}
          onChange={(e) => set("address", e.target.value)}
          className={FIELD_CLASS}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Phone</label>
          <input
            value={draft.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Website</label>
          <input
            value={draft.website}
            onChange={(e) => set("website", e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASS}>Cover image URL</label>
        <input
          value={draft.coverImageUrl}
          onChange={(e) => set("coverImageUrl", e.target.value)}
          className={FIELD_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>Price range</label>
        <select
          value={draft.priceRange}
          onChange={(e) => set("priceRange", e.target.value as PriceRange)}
          className={FIELD_CLASS}
        >
          <option value="LOW">$ — Low</option>
          <option value="MEDIUM">$$ — Medium</option>
          <option value="HIGH">$$$ — High</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <input
          id="depositRequired"
          type="checkbox"
          checked={draft.depositRequired}
          onChange={(e) => set("depositRequired", e.target.checked)}
        />
        <label htmlFor="depositRequired" className="text-sm text-ink">
          Require a deposit to book
        </label>
      </div>
      {draft.depositRequired && (
        <div>
          <label className={LABEL_CLASS}>Deposit amount (USD)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={draft.depositAmount}
            onChange={(e) => set("depositAmount", e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      )}

      <UnsavedChangesBar
        visible={isDirty || isSaving}
        isSaving={isSaving}
        error={error}
        onSave={save}
        onDiscard={discard}
      />
      <SavedToast visible={justSaved && !isDirty} />
    </form>
  );
});
