"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { updateRestaurant } from "@/lib/restaurants/api";
import type { PriceRange } from "@/lib/restaurants/types";

import type { ManageTabProps } from "./types";

const FIELD_CLASS =
  "w-full rounded-xl border border-border px-4 py-2.5 text-sm text-ink outline-none";
const LABEL_CLASS = "mb-1.5 block text-xs font-bold text-[#5C5048]";

export function ProfileTab({ restaurant, token, onSaved }: ManageTabProps) {
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [cuisineType, setCuisineType] = useState(restaurant.cuisineType);
  const [address, setAddress] = useState(restaurant.address);
  const [city, setCity] = useState(restaurant.city);
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [website, setWebsite] = useState(restaurant.website ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(restaurant.coverImageUrl ?? "");
  const [priceRange, setPriceRange] = useState<PriceRange>(restaurant.priceRange);
  const [depositRequired, setDepositRequired] = useState(restaurant.depositRequired);
  const [depositAmount, setDepositAmount] = useState(restaurant.depositAmount);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await updateRestaurant(
        restaurant.id,
        {
          name,
          slug: restaurant.slug,
          description: description || undefined,
          cuisineType,
          address,
          city,
          phone: phone || undefined,
          website: website || undefined,
          coverImageUrl: coverImageUrl || undefined,
          priceRange,
          depositRequired,
          depositAmount: Number(depositAmount) || 0,
        },
        token,
      );
      await onSaved();
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className={LABEL_CLASS}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD_CLASS} />
      </div>
      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={FIELD_CLASS}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Cuisine type</label>
          <input
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className={FIELD_CLASS} />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASS}>Address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={FIELD_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Website</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASS}>Cover image URL</label>
        <input
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>Price range</label>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value as PriceRange)}
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
          checked={depositRequired}
          onChange={(e) => setDepositRequired(e.target.checked)}
        />
        <label htmlFor="depositRequired" className="text-sm text-ink">
          Require a deposit to book
        </label>
      </div>
      {depositRequired && (
        <div>
          <label className={LABEL_CLASS}>Deposit amount (USD)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {savedAt && !error && <p className="text-sm text-secondary">Saved.</p>}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
