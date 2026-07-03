"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { createRestaurant } from "@/lib/restaurants/api";
import { slugify } from "@/lib/restaurants/slugify";

export default function NewRestaurantPage() {
  const { token } = useOwnerAuth();
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
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-[560px] p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">New restaurant</h1>
      <p className="mt-2 text-sm text-muted">
        You can add hours, tables, and a menu after creating it.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-bold text-label">Name</label>
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-label">
            URL slug (tablesite.com/restaurants/…)
          </label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-label">Cuisine type</label>
          <input
            required
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            placeholder="Khmer, Vietnamese, Italian…"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-label">Address</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-label">City</label>
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating…" : "Create restaurant"}
        </button>
      </form>
    </main>
  );
}
