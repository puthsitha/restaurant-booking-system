"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { FormEvent } from "react";

import { SavedToast } from "@/components/ui/SavedToast";
import { Select } from "@/components/ui/Select";
import { UnsavedChangesBar } from "@/components/ui/UnsavedChangesBar";
import { ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import { listCities, listCuisines, updateRestaurant } from "@/lib/restaurants/api";
import type { City, Cuisine, PriceRange } from "@/lib/restaurants/types";

import type { DirtyTabHandle, ManageTabProps } from "./types";

const FIELD_CLASS =
  "w-full rounded-xl border border-border px-4 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";
const LABEL_CLASS = "mb-1.5 block text-xs font-bold text-label";

interface ProfileDraft {
  name: string;
  nameKm: string;
  description: string;
  descriptionKm: string;
  cuisineId: string;
  address: string;
  addressKm: string;
  cityId: string;
  phone: string;
  website: string;
  coverImageUrl: string;
  priceRange: PriceRange;
  depositRequired: boolean;
  depositAmount: string;
  latitude: string;
  longitude: string;
  isPopular: boolean;
  dressCode: string;
  dressCodeKm: string;
}

function draftFromRestaurant(restaurant: ManageTabProps["restaurant"]): ProfileDraft {
  return {
    name: restaurant.name,
    nameKm: restaurant.nameKm ?? "",
    description: restaurant.description ?? "",
    descriptionKm: restaurant.descriptionKm ?? "",
    cuisineId: restaurant.cuisineId,
    address: restaurant.address,
    addressKm: restaurant.addressKm ?? "",
    cityId: restaurant.cityId,
    phone: restaurant.phone ?? "",
    website: restaurant.website ?? "",
    coverImageUrl: restaurant.coverImageUrl ?? "",
    priceRange: restaurant.priceRange,
    depositRequired: restaurant.depositRequired,
    depositAmount: String(restaurant.depositAmount),
    latitude: restaurant.latitude ?? "",
    longitude: restaurant.longitude ?? "",
    isPopular: restaurant.isPopular,
    dressCode: restaurant.dressCode ?? "",
    dressCodeKm: restaurant.dressCodeKm ?? "",
  };
}

export const ProfileTab = forwardRef<DirtyTabHandle, ManageTabProps>(function ProfileTab(
  { restaurant, token, onSaved, onDirtyChange },
  ref,
) {
  const { t } = useLanguage();
  const baseline = useRef(draftFromRestaurant(restaurant));
  const [draft, setDraft] = useState(baseline.current);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    listCuisines().then((res) => setCuisines(res.cuisines)).catch(() => setCuisines([]));
    listCities().then((res) => setCities(res.cities)).catch(() => setCities([]));
  }, []);

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
          nameKm: draft.nameKm || undefined,
          slug: restaurant.slug,
          description: draft.description || undefined,
          descriptionKm: draft.descriptionKm || undefined,
          cuisineId: draft.cuisineId,
          address: draft.address,
          addressKm: draft.addressKm || undefined,
          cityId: draft.cityId,
          phone: draft.phone || undefined,
          website: draft.website || undefined,
          coverImageUrl: draft.coverImageUrl || undefined,
          priceRange: draft.priceRange,
          depositRequired: draft.depositRequired,
          depositAmount: Number(draft.depositAmount) || 0,
          latitude: draft.latitude ? Number(draft.latitude) : undefined,
          longitude: draft.longitude ? Number(draft.longitude) : undefined,
          isPopular: draft.isPopular,
          dressCode: draft.dressCode || undefined,
          dressCodeKm: draft.dressCodeKm || undefined,
        },
        token,
      );
      await onSaved();
      baseline.current = draft;
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.profile.loadError"));
      return false;
    } finally {
      setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant.id, restaurant.slug, token, draft, onSaved, t]);

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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.name")}</label>
          <input
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("ownerManage.profile.namePlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.nameKm")}</label>
          <input
            value={draft.nameKm}
            onChange={(e) => set("nameKm", e.target.value)}
            placeholder={t("ownerManage.profile.nameKmPlaceholder")}
            className={`km ${FIELD_CLASS}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.description")}</label>
          <textarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder={t("ownerManage.profile.descriptionPlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.descriptionKm")}</label>
          <textarea
            value={draft.descriptionKm}
            onChange={(e) => set("descriptionKm", e.target.value)}
            rows={3}
            placeholder={t("ownerManage.profile.descriptionKmPlaceholder")}
            className={`km ${FIELD_CLASS}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label={t("ownerManage.profile.cuisineType")}
          value={draft.cuisineId}
          onChange={(value) => set("cuisineId", value)}
          options={cuisines.map((cuisine) => ({ value: cuisine.id, label: cuisine.name }))}
        />
        <Select
          label={t("ownerManage.profile.city")}
          value={draft.cityId}
          onChange={(value) => set("cityId", value)}
          options={cities.map((city) => ({ value: city.id, label: city.name }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.address")}</label>
          <input
            value={draft.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder={t("ownerManage.profile.addressPlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.addressKm")}</label>
          <input
            value={draft.addressKm}
            onChange={(e) => set("addressKm", e.target.value)}
            placeholder={t("ownerManage.profile.addressKmPlaceholder")}
            className={`km ${FIELD_CLASS}`}
          />
        </div>
      </div>

      <LocationFields draft={draft} set={set} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.phone")}</label>
          <input
            value={draft.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder={t("ownerManage.profile.phonePlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.website")}</label>
          <input
            value={draft.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder={t("ownerManage.profile.websitePlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASS}>{t("ownerManage.profile.coverImageUrl")}</label>
        <input
          value={draft.coverImageUrl}
          onChange={(e) => set("coverImageUrl", e.target.value)}
          placeholder={t("ownerManage.profile.coverImageUrlPlaceholder")}
          className={FIELD_CLASS}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.dressCode")}</label>
          <input
            value={draft.dressCode}
            onChange={(e) => set("dressCode", e.target.value)}
            placeholder={t("ownerManage.profile.dressCodePlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.dressCodeKm")}</label>
          <input
            value={draft.dressCodeKm}
            onChange={(e) => set("dressCodeKm", e.target.value)}
            placeholder={t("ownerManage.profile.dressCodeKmPlaceholder")}
            className={`km ${FIELD_CLASS}`}
          />
        </div>
      </div>
      <Select
        label={t("ownerManage.profile.priceRange")}
        value={draft.priceRange}
        onChange={(value) => set("priceRange", value)}
        options={[
          { value: "LOW", label: t("ownerManage.profile.priceLow") },
          { value: "MEDIUM", label: t("ownerManage.profile.priceMedium") },
          { value: "HIGH", label: t("ownerManage.profile.priceHigh") }
        ]}
      />
      <div className="flex items-center gap-3">
        <input
          id="depositRequired"
          type="checkbox"
          checked={draft.depositRequired}
          onChange={(e) => set("depositRequired", e.target.checked)}
        />
        <label htmlFor="depositRequired" className="text-sm text-ink">
          {t("ownerManage.profile.requireDeposit")}
        </label>
      </div>
      <div className="flex items-center gap-3">
        <input
          id="isPopular"
          type="checkbox"
          checked={draft.isPopular}
          onChange={(e) => set("isPopular", e.target.checked)}
        />
        <label htmlFor="isPopular" className="text-sm text-ink">
          {t("ownerManage.profile.markPopular")}
        </label>
      </div>
      {draft.depositRequired && (
        <div>
          <label className={LABEL_CLASS}>{t("ownerManage.profile.depositAmount")}</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={draft.depositAmount}
            onChange={(e) => set("depositAmount", e.target.value)}
            placeholder={t("ownerManage.profile.depositAmountPlaceholder")}
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

// Lat/lng entry plus a live OpenStreetMap preview — no map SDK/API key
// needed, just an iframe embed, so the owner can see the pin land in the
// right place before saving. Feeds the same map shown on the public
// restaurant page and its "get directions" link.
function LocationFields({
  draft,
  set,
}: {
  draft: ProfileDraft;
  set: <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => void;
}) {
  const { t } = useLanguage();
  const lat = Number(draft.latitude);
  const lng = Number(draft.longitude);
  const hasCoordinates = draft.latitude !== "" && draft.longitude !== "" && Number.isFinite(lat) && Number.isFinite(lng);

  function useCurrentLocation(): void {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      set("latitude", String(position.coords.latitude));
      set("longitude", String(position.coords.longitude));
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className={LABEL_CLASS}>{t("ownerManage.profile.location")}</label>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="mb-1.5 text-xs font-bold text-accent"
        >
          {t("ownerManage.profile.useCurrentLocation")}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          step="any"
          min={-90}
          max={90}
          value={draft.latitude}
          onChange={(e) => set("latitude", e.target.value)}
          placeholder={t("ownerManage.profile.latitude")}
          className={FIELD_CLASS}
        />
        <input
          type="number"
          step="any"
          min={-180}
          max={180}
          value={draft.longitude}
          onChange={(e) => set("longitude", e.target.value)}
          placeholder={t("ownerManage.profile.longitude")}
          className={FIELD_CLASS}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">{t("ownerManage.profile.locationHint")}</p>
      {hasCoordinates && (
        <div className="mt-3 h-48 w-full overflow-hidden rounded-xl border border-border">
          <iframe
            title="location-preview"
            className="h-full w-full"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&marker=${lat}%2C${lng}&layer=mapnik`}
          />
        </div>
      )}
    </div>
  );
}
