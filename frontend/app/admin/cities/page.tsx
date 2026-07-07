"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyPlateIcon } from "@/components/ui/icons";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { useLanguage } from "@/lib/i18n/context";
import { createCity, deleteCity, listCities } from "@/lib/restaurants/api";
import type { City } from "@/lib/restaurants/types";

const FIELD_CLASS =
  "w-full rounded-xl border border-border px-4 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";

export default function AdminCitiesPage() {
  const { token } = useAdminAuth();
  const { t } = useLanguage();
  const [cities, setCities] = useState<City[] | null>(null);
  const [name, setName] = useState("");
  const [nameKm, setNameKm] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<City | null>(null);

  function reload(): void {
    setLoadError(null);
    listCities()
      .then((res) => setCities(res.cities))
      .catch(() => setLoadError(t("adminCities.loadError")));
  }

  useEffect(reload, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setIsSaving(true);
    try {
      await createCity({ name, nameKm: nameKm || undefined, imageUrl: imageUrl || undefined }, token);
      setName("");
      setNameKm("");
      setImageUrl("");
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("adminCities.createError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!token || !pendingDelete) return;
    setFormError(null);
    try {
      await deleteCity(pendingDelete.id, token);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("adminCities.deleteError"));
    }
  }

  return (
    <main className="p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">{t("adminCities.title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{t("adminCities.subtitle")}</p>

      <form onSubmit={handleAdd} className="mt-6 flex max-w-[820px] flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-bold text-label">{t("adminCities.name")}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("adminCities.namePlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-bold text-label">{t("adminCities.nameKm")}</label>
          <input
            value={nameKm}
            onChange={(e) => setNameKm(e.target.value)}
            placeholder={t("adminCities.nameKmPlaceholder")}
            className={`km ${FIELD_CLASS}`}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-bold text-label">{t("adminCities.imageUrl")}</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t("adminCities.imageUrlPlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {t("adminCities.add")}
        </button>
      </form>

      {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

      {loadError ? (
        <ErrorState className="mt-8" message={loadError} onRetry={reload} />
      ) : cities === null ? (
        <div className="mt-8">
          <ListSkeleton rows={3} />
        </div>
      ) : cities.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={EmptyPlateIcon}
          title={t("adminCities.emptyTitle")}
          message={t("adminCities.emptyMessage")}
          compact
        />
      ) : (
        <div className="mt-6 flex flex-wrap gap-2">
          {cities.map((city) => (
            <span
              key={city.id}
              className="flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm text-ink"
            >
              {city.name}
              {city.nameKm && <span className="km text-muted">({city.nameKm})</span>}
              <button
                onClick={() => setPendingDelete(city)}
                className="font-bold text-red-600"
                aria-label={t("adminCities.deleteAria", { name: city.name })}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        open={pendingDelete !== null}
        title={t("adminCities.deleteConfirm")}
        body={t("adminCities.deleteModalBody")}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </main>
  );
}
