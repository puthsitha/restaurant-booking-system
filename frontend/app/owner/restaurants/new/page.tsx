"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Select } from "@/components/ui/Select";
import { ApiError } from "@/lib/api";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { useLanguage } from "@/lib/i18n/context";
import { createRestaurant, listCities, listCuisines } from "@/lib/restaurants/api";
import { slugify } from "@/lib/restaurants/slugify";
import type { City, Cuisine } from "@/lib/restaurants/types";

export default function NewRestaurantPage() {
  const { token } = useOwnerAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [cuisineId, setCuisineId] = useState("");
  const [cityId, setCityId] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listCuisines().then((res) => setCuisines(res.cuisines)).catch(() => setCuisines([]));
    listCities().then((res) => setCities(res.cities)).catch(() => setCities([]));
  }, []);

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
        { name, slug, cuisineId, address, cityId },
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
        <Select
          label={t("ownerRestaurantNew.cuisineType")}
          value={cuisineId}
          onChange={setCuisineId}
          placeholder={t("ownerRestaurantNew.cuisinePlaceholder")}
          options={cuisines.map((cuisine) => ({ value: cuisine.id, label: cuisine.name }))}
        />
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
        <Select
          label={t("ownerRestaurantNew.city")}
          value={cityId}
          onChange={setCityId}
          placeholder={t("ownerRestaurantNew.cityPlaceholder")}
          options={cities.map((city) => ({ value: city.id, label: city.name }))}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting || !cuisineId || !cityId}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSubmitting ? t("common.creating") : t("ownerRestaurantNew.createRestaurant")}
        </button>
      </form>
    </main>
  );
}
