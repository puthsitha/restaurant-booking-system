"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyPlateIcon } from "@/components/ui/icons";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { useLanguage } from "@/lib/i18n/context";
import { createCuisine, deleteCuisine, listCuisines } from "@/lib/restaurants/api";
import type { Cuisine } from "@/lib/restaurants/types";

const FIELD_CLASS =
  "w-full rounded-xl border border-border px-4 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";

export default function AdminCuisinesPage() {
  const { token } = useAdminAuth();
  const { t } = useLanguage();
  const [cuisines, setCuisines] = useState<Cuisine[] | null>(null);
  const [name, setName] = useState("");
  const [nameKm, setNameKm] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function reload(): void {
    setLoadError(null);
    listCuisines()
      .then((res) => setCuisines(res.cuisines))
      .catch(() => setLoadError(t("adminCuisines.loadError")));
  }

  useEffect(reload, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setIsSaving(true);
    try {
      await createCuisine(
        {
          name,
          nameKm: nameKm || undefined,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
        },
        token,
      );
      setName("");
      setNameKm("");
      setImageUrl("");
      setDescription("");
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("adminCuisines.createError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(cuisine: Cuisine): Promise<void> {
    if (!token) return;
    if (!confirm(t("adminCuisines.deleteConfirm"))) return;
    setFormError(null);
    try {
      await deleteCuisine(cuisine.id, token);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("adminCuisines.deleteError"));
    }
  }

  return (
    <main className="p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">{t("adminCuisines.title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{t("adminCuisines.subtitle")}</p>

      <form onSubmit={handleAdd} className="mt-6 max-w-xl space-y-3 rounded-2xl border border-border bg-surface p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">{t("adminCuisines.name")}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("adminCuisines.namePlaceholder")}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">{t("adminCuisines.nameKm")}</label>
            <input
              value={nameKm}
              onChange={(e) => setNameKm(e.target.value)}
              placeholder={t("adminCuisines.nameKmPlaceholder")}
              className={`km ${FIELD_CLASS}`}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-label">{t("adminCuisines.imageUrl")}</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t("adminCuisines.imageUrlPlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-label">{t("adminCuisines.description")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder={t("adminCuisines.descriptionPlaceholder")}
            className={FIELD_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {t("adminCuisines.add")}
        </button>
      </form>

      {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

      {loadError ? (
        <ErrorState className="mt-8" message={loadError} onRetry={reload} />
      ) : cuisines === null ? (
        <div className="mt-8">
          <ListSkeleton rows={3} />
        </div>
      ) : cuisines.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={EmptyPlateIcon}
          title={t("adminCuisines.emptyTitle")}
          message={t("adminCuisines.emptyMessage")}
          compact
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cuisines.map((cuisine) => (
            <div
              key={cuisine.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-bg">
                {cuisine.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cuisine.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl">🍽️</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">{cuisine.name}</p>
                {cuisine.nameKm && <p className="km text-sm text-muted">{cuisine.nameKm}</p>}
                {cuisine.description && (
                  <p className="mt-1 text-xs text-muted">{cuisine.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(cuisine)}
                className="shrink-0 font-bold text-red-600"
                aria-label={t("adminCuisines.deleteAria", { name: cuisine.name })}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
