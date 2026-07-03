"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchOffIcon } from "@/components/ui/icons";
import { RestaurantGridSkeleton } from "@/components/ui/skeletons";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { listRestaurants, listTags } from "@/lib/restaurants/api";
import type { ListRestaurantsResponse, PriceRange, Tag } from "@/lib/restaurants/types";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const PRICE_OPTIONS: { value: PriceRange | ""; label: string }[] = [
  { value: "", label: "Any" },
  { value: "LOW", label: "$" },
  { value: "MEDIUM", label: "$$" },
  { value: "HIGH", label: "$$$" },
];

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [cuisineType, setCuisineType] = useState(searchParams.get("cuisineType") ?? "");
  const [tag, setTag] = useState(searchParams.get("tag") ?? "");
  const [priceRange, setPriceRange] = useState<PriceRange | "">(
    (searchParams.get("priceRange") as PriceRange | null) ?? "",
  );
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));

  // Debounce the free-text fields so typing doesn't fire a request per
  // keystroke — city/cuisine/name filters run 350ms after the user pauses.
  const debouncedSearch = useDebouncedValue(search, 350);
  const debouncedCity = useDebouncedValue(city, 350);
  const debouncedCuisineType = useDebouncedValue(cuisineType, 350);

  const [tags, setTags] = useState<Tag[]>([]);
  const [result, setResult] = useState<ListRestaurantsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTags()
      .then((res) => setTags(res.tags))
      .catch(() => setTags([]));
  }, []);

  // A new debounced text filter should restart pagination at page 1, same
  // as the tag/price handlers already do.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedCity, debouncedCuisineType]);

  const runSearch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    listRestaurants({
      search: debouncedSearch || undefined,
      city: debouncedCity || undefined,
      cuisineType: debouncedCuisineType || undefined,
      tag: tag || undefined,
      priceRange: priceRange || undefined,
      page,
      pageSize: 12,
    })
      .then(setResult)
      .catch(() => setError("Couldn't load restaurants. Try again."))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, debouncedCity, debouncedCuisineType, tag, priceRange, page]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    setPage(1);
  }

  function clearFilters(): void {
    setSearch("");
    setCity("");
    setCuisineType("");
    setTag("");
    setPriceRange("");
    setPage(1);
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <main className="mx-auto max-w-[1280px] px-8 py-12">
      <h1 className="disp text-2xl font-extrabold text-ink">Search restaurants</h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <form
          onSubmit={handleSubmit}
          className="sticky top-20 h-fit w-full shrink-0 space-y-4 rounded-2xl border border-border bg-surface p-5 lg:w-64"
        >
          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">Restaurant name</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Malis"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Phnom Penh"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">Cuisine</label>
            <input
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              placeholder="e.g. Khmer"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">Tag</label>
            <select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none"
            >
              <option value="">Any tag</option>
              {tags.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">Price</label>
            <div className="flex gap-1.5">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setPriceRange(opt.value);
                    setPage(1);
                  }}
                  className={`flex-1 rounded-lg border py-2 text-sm font-bold transition ${
                    priceRange === opt.value
                      ? "border-accent bg-accent text-white"
                      : "border-border text-ink hover:bg-bg"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-bold text-white"
            >
              Search
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-bg"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <RestaurantGridSkeleton count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={runSearch} />
          ) : result && result.items.length > 0 ? (
            <>
              <p className="text-sm text-muted">{result.total} restaurants found</p>
              <motion.div
                className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {result.items.map((restaurant) => (
                  <motion.div key={restaurant.id} variants={fadeUp}>
                    <RestaurantCard restaurant={restaurant} />
                  </motion.div>
                ))}
              </motion.div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={SearchOffIcon}
              title="No tables match that search"
              message="Try a different city, cuisine, or clear a filter — your next favorite spot is still out there."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          )}
        </div>
      </div>
    </main>
  );
}
