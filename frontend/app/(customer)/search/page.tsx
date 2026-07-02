"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchOffIcon } from "@/components/ui/icons";
import { RestaurantGridSkeleton } from "@/components/ui/skeletons";
import { listRestaurants, listTags } from "@/lib/restaurants/api";
import type { ListRestaurantsResponse, PriceRange, Tag } from "@/lib/restaurants/types";

const PRICE_OPTIONS: { value: PriceRange | ""; label: string }[] = [
  { value: "", label: "Any price" },
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
  const [tag, setTag] = useState(searchParams.get("tag") ?? "");
  const [priceRange, setPriceRange] = useState<PriceRange | "">(
    (searchParams.get("priceRange") as PriceRange | null) ?? "",
  );
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));

  const [tags, setTags] = useState<Tag[]>([]);
  const [result, setResult] = useState<ListRestaurantsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTags()
      .then((res) => setTags(res.tags))
      .catch(() => setTags([]));
  }, []);

  const runSearch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    listRestaurants({
      search: search || undefined,
      city: city || undefined,
      tag: tag || undefined,
      priceRange: priceRange || undefined,
      page,
      pageSize: 12,
    })
      .then(setResult)
      .catch(() => setError("Couldn't load restaurants. Try again."))
      .finally(() => setIsLoading(false));
  }, [search, city, tag, priceRange, page]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    setPage(1);
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px" }}>
      <h1 className="disp text-2xl font-extrabold text-ink">Search restaurants</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Restaurant name"
          className="min-w-[200px] flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-40 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none"
        />
        <select
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none"
        >
          <option value="">Any tag</option>
          {tags.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={priceRange}
          onChange={(e) => {
            setPriceRange(e.target.value as PriceRange | "");
            setPage(1);
          }}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none"
        >
          {PRICE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white"
        >
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="mt-8">
          <RestaurantGridSkeleton count={6} />
        </div>
      ) : error ? (
        <ErrorState className="mt-8" message={error} onRetry={runSearch} />
      ) : result && result.items.length > 0 ? (
        <>
          <p className="mt-8 text-sm text-muted">{result.total} restaurants found</p>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
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
          className="mt-8"
          icon={SearchOffIcon}
          title="No tables match that search"
          message="Try a different city, cuisine, or clear a filter — your next favorite spot is still out there."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch("");
            setCity("");
            setTag("");
            setPriceRange("");
            setPage(1);
          }}
        />
      )}
    </main>
  );
}
