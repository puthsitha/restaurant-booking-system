"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { useLanguage } from "@/lib/i18n/context";
import { createRestaurant } from "@/lib/restaurants/api";
import { slugify } from "@/lib/restaurants/slugify";

export default function NewRestaurantPage() {
  const { token } = useOwnerAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [cuisineType, setCuisineType] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(value: string): void {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const { restaurant } = await createRestaurant(
        { name, slug, cuisineType, address, city },
        token,
      );
      router.replace(`/owner/restaurants/${restaurant.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-[560px] p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">{t("ownerRestaurantNew.pageTitle")}</h1>
      <p className="mt-2 text-sm text-muted">{t("ownerRestaurantNew.subtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-bold text-label">{t("ownerRestaurantNew.name")}</label>
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t("ownerRestaurantNew.namePlaceholder")}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-label">
            {t("ownerRestaurantNew.slugLabel")}
          </label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder={t("ownerRestaurantNew.slugPlaceholder")}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-label">
            {t("ownerRestaurantNew.cuisineType")}
          </label>
          <input
            required
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            placeholder={t("ownerRestaurantNew.cuisinePlaceholder")}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-label">{t("ownerRestaurantNew.address")}</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("ownerRestaurantNew.addressPlaceholder")}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-label">{t("ownerRestaurantNew.city")}</label>
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("ownerRestaurantNew.cityPlaceholder")}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSubmitting ? t("common.creating") : t("ownerRestaurantNew.createRestaurant")}
        </button>
      </form>
    </main>
  );
}
