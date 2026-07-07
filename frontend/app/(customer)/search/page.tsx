"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { RestaurantMapView } from "@/components/search/RestaurantMapView";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { MapIcon, MenuIcon, SearchOffIcon, StarIcon } from "@/components/ui/icons";
import { RestaurantGridSkeleton } from "@/components/ui/skeletons";
import { Switch } from "@/components/ui/Switch";
import { useLanguage } from "@/lib/i18n/context";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { listCuisines, listRestaurants } from "@/lib/restaurants/api";
import { PRICE_SYMBOL } from "@/lib/restaurants/priceLabels";
import type { Cuisine, ListRestaurantsResponse, PriceRange } from "@/lib/restaurants/types";
import { useClientLocation } from "@/lib/useClientLocation";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const PRICE_VALUES: PriceRange[] = ["LOW", "MEDIUM", "HIGH"];
const RATING_OPTIONS = [4.5, 4, 3.5];
const MIN_DISTANCE_KM = 1;
const MAX_DISTANCE_KM = 20;
const DEFAULT_DISTANCE_KM = 8;

type ViewMode = "list" | "map";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const clientLocation = useClientLocation();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [cuisineType, setCuisineType] = useState(searchParams.get("cuisineType") ?? "");
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange | "">(
    (searchParams.get("priceRange") as PriceRange | null) ?? "",
  );
  const [availableNow, setAvailableNow] = useState(searchParams.get("availableNow") === "true");
  const [maxDistanceKm, setMaxDistanceKm] = useState(() => {
    const param = Number(searchParams.get("maxDistanceKm"));
    return Number.isFinite(param) && param > 0 ? param : DEFAULT_DISTANCE_KM;
  });
  const [minRating, setMinRating] = useState<number | undefined>(() => {
    const param = Number(searchParams.get("minRating"));
    return Number.isFinite(param) && param > 0 ? param : undefined;
  });
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Debounce the free-text field so typing doesn't fire a request per
  // keystroke — the name filter runs 350ms after the user pauses.
  const debouncedSearch = useDebouncedValue(search, 350);

  // Fetched without a locale so `cuisine.name` stays the canonical English
  // value the search filter matches on — the Khmer label (when shown) comes
  // from `nameKm` client-side instead of a locale-swapped `name`.
  useEffect(() => {
    listCuisines()
      .then((res) => setCuisines(res.cuisines))
      .catch(() => setCuisines([]));
  }, []);

  const [result, setResult] = useState<ListRestaurantsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A new debounced text filter should restart pagination at page 1, same
  // as the other filter handlers already do.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const runSearch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    listRestaurants(
      {
        search: debouncedSearch || undefined,
        cuisineType: cuisineType || undefined,
        priceRange: priceRange || undefined,
        availableNow: availableNow || undefined,
        maxDistanceKm,
        minRating,
        page,
        pageSize: 12,
      },
      locale,
      clientLocation,
    )
      .then(setResult)
      .catch(() => setError(t("searchPage.loadError")))
      .finally(() => setIsLoading(false));
  }, [
    debouncedSearch,
    cuisineType,
    priceRange,
    availableNow,
    maxDistanceKm,
    minRating,
    page,
    locale,
    clientLocation,
    t,
  ]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    setPage(1);
  }

  function clearFilters(): void {
    setSearch("");
    setCuisineType("");
    setPriceRange("");
    setAvailableNow(false);
    setMaxDistanceKm(DEFAULT_DISTANCE_KM);
    setMinRating(undefined);
    setPage(1);
  }

  const totalPages = result
    ? Math.max(1, Math.ceil(result.total / result.pageSize))
    : 1;

  return (
    <main className="mx-auto max-w-[1280px] px-8 py-12">
      <Breadcrumb
        className="mb-4"
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("searchPage.breadcrumbTitle") },
        ]}
      />
      <h1 className="disp text-2xl font-extrabold text-ink">
        {t("searchPage.title")}
      </h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <form
          onSubmit={handleSubmit}
          className="sticky top-20 h-fit w-full shrink-0 space-y-5 rounded-2xl border border-border bg-surface p-5 lg:w-72"
        >
          <div className="flex items-center justify-between">
            <h2 className="disp text-base font-extrabold text-ink">
              {t("searchPage.filters")}
            </h2>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-accent"
            >
              {t("searchPage.clear")}
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">
              {t("searchPage.restaurantName")}
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPage.restaurantNamePlaceholder")}
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg p-3">
            <span>
              <span className="km block text-sm font-bold text-ink">
                {t("searchPage.availableNow")}
              </span>
              <span className="km block text-xs text-muted">
                {t("searchPage.availableNowSubtitle")}
              </span>
            </span>
            <Switch
              checked={availableNow}
              onChange={(checked) => {
                setAvailableNow(checked);
                setPage(1);
              }}
              label={t("searchPage.availableNow")}
            />
          </label>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">
              {t("searchPage.cuisine")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setCuisineType("");
                  setPage(1);
                }}
                className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                  cuisineType === ""
                    ? "border-accent bg-accent text-white"
                    : "border-border text-ink hover:bg-bg"
                }`}
              >
                {t("searchPage.any")}
              </button>
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine.id}
                  type="button"
                  onClick={() => {
                    setCuisineType(cuisine.name);
                    setPage(1);
                  }}
                  className={`km rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    cuisineType.toLowerCase() === cuisine.name.toLowerCase()
                      ? "border-accent bg-accent text-white"
                      : "border-border text-ink hover:bg-bg"
                  }`}
                >
                  {locale === "km" ? cuisine.nameKm || cuisine.name : cuisine.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">
              {t("searchPage.price")}
            </label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setPriceRange("");
                  setPage(1);
                }}
                className={`w-full rounded-lg border py-2 text-sm font-bold transition ${
                  priceRange === ""
                    ? "border-accent bg-accent text-white"
                    : "border-border text-ink hover:bg-bg"
                }`}
              >
                {t("searchPage.any")}
              </button>
              <div className="grid grid-cols-3 gap-1.5">
                {PRICE_VALUES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPriceRange(value);
                      setPage(1);
                    }}
                    className={`rounded-lg border py-2 text-sm font-bold transition ${
                      priceRange === value
                        ? "border-accent bg-accent text-white"
                        : "border-border text-ink hover:bg-bg"
                    }`}
                  >
                    {PRICE_SYMBOL[value]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">
              {t("searchPage.distance")}
            </label>
            <input
              type="range"
              min={MIN_DISTANCE_KM}
              max={MAX_DISTANCE_KM}
              value={maxDistanceKm}
              onChange={(e) => {
                setMaxDistanceKm(Number(e.target.value));
                setPage(1);
              }}
              className="w-full accent-accent"
            />
            <p className="km mt-1 text-xs text-muted">
              {t("searchPage.withinKm", { km: maxDistanceKm })}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-label">
              {t("searchPage.rating")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RATING_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setMinRating(minRating === option ? undefined : option);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    minRating === option
                      ? "border-accent bg-accent text-white"
                      : "border-border text-ink hover:bg-bg"
                  }`}
                >
                  <StarIcon className="h-3.5 w-3.5" />
                  {option.toFixed(1)}+
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <RestaurantGridSkeleton count={3} />
          ) : error ? (
            <ErrorState message={error} onRetry={runSearch} />
          ) : result && result.items.length > 0 ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="disp text-xl font-extrabold text-ink">
                    {t("searchPage.resultsFound", { count: result.total })}
                  </h2>
                  <p className="km text-sm text-muted">{t("searchPage.sortedByPopularity")}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`km flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition ${
                      viewMode === "list" ? "bg-accent text-white" : "text-ink hover:bg-bg"
                    }`}
                  >
                    <MenuIcon className="h-4 w-4" />
                    {t("searchPage.list")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    className={`km flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition ${
                      viewMode === "map" ? "bg-accent text-white" : "text-ink hover:bg-bg"
                    }`}
                  >
                    <MapIcon className="h-4 w-4" />
                    {t("searchPage.map")}
                  </button>
                </div>
              </div>

              {viewMode === "list" ? (
                <>
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
                        {t("searchPage.previous")}
                      </button>
                      <span className="text-sm text-muted">
                        {t("searchPage.pageOf", { page, total: totalPages })}
                      </span>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
                      >
                        {t("searchPage.next")}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4">
                  <RestaurantMapView restaurants={result.items} />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={SearchOffIcon}
              title={t("searchPage.emptyTitle")}
              message={t("searchPage.emptyMessage")}
              actionLabel={t("searchPage.clearFilters")}
              onAction={clearFilters}
            />
          )}
        </div>
      </div>
    </main>
  );
}
