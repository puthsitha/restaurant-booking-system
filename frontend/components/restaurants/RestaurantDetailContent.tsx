"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { PanInfo } from "framer-motion";

import { BookingWidget } from "@/components/booking/BookingWidget";
import { ReviewsSection } from "@/components/restaurants/ReviewsSection";
import { SaveRestaurantButton } from "@/components/restaurants/SaveRestaurantButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { ChevronDownIcon, ZoomInIcon } from "@/components/ui/icons";
import { Lightbox } from "@/components/ui/Lightbox";
import { RatingStars } from "@/components/ui/RatingStars";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { formatTimeLabel } from "@/lib/dateFormat";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { listReviews } from "@/lib/reviews/api";
import { getRestaurantBySlug } from "@/lib/restaurants/api";
import type {
  DayOfWeek,
  RestaurantPublicDetail,
} from "@/lib/restaurants/types";
import { useSavedRestaurants } from "@/lib/savedRestaurants/context";
import { theme } from "@/lib/theme";

const PRICE_LABEL: Record<string, string> = {
  LOW: "$",
  MEDIUM: "$$",
  HIGH: "$$$",
};

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const DAY_LABEL_KEY: Record<DayOfWeek, TranslationKey> = {
  MONDAY: "restaurantPage.days.monday",
  TUESDAY: "restaurantPage.days.tuesday",
  WEDNESDAY: "restaurantPage.days.wednesday",
  THURSDAY: "restaurantPage.days.thursday",
  FRIDAY: "restaurantPage.days.friday",
  SATURDAY: "restaurantPage.days.saturday",
  SUNDAY: "restaurantPage.days.sunday",
};

function khr(usd: number): string {
  return `៛${Math.round(usd * theme.currency.usdToKhrRate).toLocaleString()}`;
}

// A single currency, matching the active UI language, rather than both at
// once — Khmer readers think in riel, English readers in dollars.
function menuPrice(usd: number, locale: "en" | "km"): string {
  return locale === "km" ? khr(usd) : `$${usd.toFixed(2)}`;
}

function todayDayOfWeek(): DayOfWeek {
  return DAY_ORDER[(new Date().getDay() + 6) % 7];
}

// Whether the restaurant is open right now, from its weekly operating hours
// — handles overnight ranges (close time past midnight) as a wraparound.
function isOpenNow(
  hoursByDay: Map<DayOfWeek, RestaurantPublicDetail["operatingHours"][number]>,
): boolean {
  const now = new Date();
  const hour = hoursByDay.get(todayDayOfWeek());
  if (!hour || hour.isClosed) return false;
  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  if (hour.closeTime < hour.openTime) {
    return current >= hour.openTime || current < hour.closeTime;
  }
  return current >= hour.openTime && current < hour.closeTime;
}

interface HeroImage {
  id: string;
  url: string;
  alt: string;
}

const SWIPE_THRESHOLD = 80;

// Cover photo + first three gallery shots laid out as a mosaic (one large
// cell, three smaller ones, the last with a "+N" overlay for the rest),
// sharing a single Lightbox so any cell opens into a swipeable/arrow-key
// carousel across every photo on file.
function HeroGallery({
  images,
  restaurantId,
}: {
  images: HeroImage[];
  restaurantId: string;
}) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hasMultiple = images.length > 1;
  const activeIndex = openIndex ?? 0;
  const current = openIndex !== null ? images[openIndex] : null;

  function goTo(index: number): void {
    setOpenIndex(((index % images.length) + images.length) % images.length);
  }

  useEffect(() => {
    if (openIndex === null || !hasMultiple) return;
    const index = openIndex;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, hasMultiple]);

  function handleDragEnd(_event: unknown, info: PanInfo): void {
    if (info.offset.x > SWIPE_THRESHOLD) goTo(activeIndex - 1);
    else if (info.offset.x < -SWIPE_THRESHOLD) goTo(activeIndex + 1);
  }

  if (images.length === 0) {
    return (
      <FadeIn className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-bg text-5xl">
        🍽️
        <SaveRestaurantButton
          restaurantId={restaurantId}
          className="absolute right-4 top-4"
        />
      </FadeIn>
    );
  }

  if (images.length === 1) {
    return (
      <FadeIn className="relative h-64 w-full overflow-hidden rounded-2xl bg-bg">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group block h-full w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0].url}
            alt={images[0].alt}
            className="h-full w-full object-cover transition group-hover:opacity-90"
          />
        </button>
      </FadeIn>
    );
  }

  // Main photo (2fr, spans both rows) plus however many side cells actually
  // exist — the grid shape (columns/rows/spans) changes with the photo count
  // so every cell is always filled with a photo; nothing is ever left as bare
  // empty space. Mirrors design/TableSite.reference.html's `scDetail` hero
  // mosaic for 5+ photos (3 columns, "+N" overlay on the last cell); 2–4
  // photos degrade to a matching layout with no gaps.
  const sideImages = images.slice(1, 5);
  const extraCount = images.length - 5;

  const GRID_CLASS: Record<number, string> = {
    1: "grid-cols-[2fr_1fr] grid-rows-1",
    2: "grid-cols-[2fr_1fr] grid-rows-2",
    3: "grid-cols-[2fr_1fr_1fr] grid-rows-2",
    4: "grid-cols-[2fr_1fr_1fr] grid-rows-2",
  };
  const SIDE_CELL_CLASS: Record<number, string[]> = {
    1: [""],
    2: ["", ""],
    3: ["", "", "col-span-2"],
    4: ["", "", "", ""],
  };

  return (
    <>
      <FadeIn
        className={`grid h-[290px] gap-2.5 overflow-hidden rounded-2xl ${GRID_CLASS[sideImages.length]}`}
      >
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative row-span-full block h-full w-full overflow-hidden bg-bg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0].url}
            alt={images[0].alt}
            className="h-full w-full object-cover transition group-hover:opacity-90"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/20 group-hover:opacity-100">
            <ZoomInIcon className="h-6 w-6 text-white drop-shadow" />
          </span>
        </button>
        {sideImages.map((image, index) => {
          const isLast =
            index === sideImages.length - 1 && sideImages.length === 4;
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setOpenIndex(index + 1)}
              className={`group relative block h-full w-full overflow-hidden bg-bg ${SIDE_CELL_CLASS[sideImages.length][index]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt}
                className="h-full w-full object-cover transition group-hover:opacity-90"
              />
              {isLast && extraCount > 0 ? (
                <span className="km absolute inset-0 flex items-center justify-center bg-ink/55 text-sm font-bold text-white">
                  {t("restaurantPage.morePhotos", { count: extraCount })}
                </span>
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/20 group-hover:opacity-100">
                  <ZoomInIcon className="h-6 w-6 text-white drop-shadow" />
                </span>
              )}
            </button>
          );
        })}
      </FadeIn>

      <Lightbox open={current !== null} onClose={() => setOpenIndex(null)}>
        {current && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <motion.img
                key={current.id}
                src={current.url}
                alt={current.alt}
                className="max-h-[80vh] max-w-[90vw] touch-pan-y rounded-lg object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                drag={hasMultiple ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={handleDragEnd}
              />
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label={t("restaurantPage.galleryPrevious")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:left-4"
                  >
                    <ChevronDownIcon className="h-5 w-5 rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    aria-label={t("restaurantPage.galleryNext")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:right-4"
                  >
                    <ChevronDownIcon className="h-5 w-5 -rotate-90" />
                  </button>
                </>
              )}
            </div>
            {hasMultiple && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {t("restaurantPage.galleryCounter", {
                  current: activeIndex + 1,
                  total: images.length,
                })}
              </span>
            )}
          </div>
        )}
      </Lightbox>
    </>
  );
}

interface RestaurantDetailContentProps {
  restaurant: RestaurantPublicDetail;
}

export function RestaurantDetailContent({
  restaurant: initialRestaurant,
}: RestaurantDetailContentProps) {
  const { t, locale } = useLanguage();
  const { savedIds } = useSavedRestaurants();
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [ratingSummary, setRatingSummary] = useState<{
    average: number;
    total: number;
  } | null>(null);

  // The page is server-rendered with the UI shell's default locale (the
  // user's stored preference isn't known yet at that point — see the page
  // component) — re-fetch on the client once the real locale is known, and
  // again on every toggle, so the restaurant's own bilingual fields
  // (name/description/address/menu, not just chrome strings) follow it too.
  useEffect(() => {
    getRestaurantBySlug(initialRestaurant.slug, locale)
      .then((res) => setRestaurant(res.restaurant))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, initialRestaurant.slug]);

  useEffect(() => {
    listReviews(restaurant.id)
      .then((res) =>
        setRatingSummary({ average: res.average, total: res.total }),
      )
      .catch(() => setRatingSummary(null));
  }, [restaurant.id]);

  const heroImages: HeroImage[] = [
    ...(restaurant.coverImageUrl
      ? [{ id: "cover", url: restaurant.coverImageUrl, alt: restaurant.name }]
      : []),
    ...restaurant.galleryImages.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.caption ?? restaurant.name,
    })),
  ];

  const hoursByDay = new Map(
    restaurant.operatingHours.map((h) => [h.dayOfWeek, h]),
  );
  const openNow = isOpenNow(hoursByDay);
  const today = todayDayOfWeek();
  const quickInfo = [
    restaurant.dressCode
      ? { label: t("restaurantPage.dressCode"), value: restaurant.dressCode }
      : null,
    restaurant.depositRequired
      ? {
          label: t("restaurantPage.deposit"),
          value: t("restaurantPage.depositAmount", {
            amount: `$${Number(restaurant.depositAmount).toFixed(2)}`,
          }),
          accent: true,
        }
      : {
          label: t("restaurantPage.deposit"),
          value: t("restaurantPage.depositNotRequired"),
        },
    {
      label: t("restaurantPage.cancellation"),
      value: t("restaurantPage.cancellationNotice", {
        hours: restaurant.cancellationHours,
      }),
    },
    restaurant.parkingAvailable
      ? {
          label: t("restaurantPage.parking"),
          value: t("restaurantPage.parkingAvailable"),
        }
      : null,
  ].filter(
    (x): x is { label: string; value: string; accent?: boolean } => x !== null,
  );

  return (
    <main className="mx-auto max-w-[1280px] px-8 py-6">
      <HeroGallery images={heroImages} restaurantId={restaurant.id} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_364px]">
        <FadeIn delay={0.05}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {restaurant.tags.length > 0 && (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {restaurant.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="km rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="disp text-3xl font-extrabold text-ink">
                {restaurant.name}
              </h1>
              <p className="km mt-1.5 text-sm text-muted">
                {restaurant.cuisineType} · {restaurant.address},{" "}
                {restaurant.city}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {ratingSummary && ratingSummary.total > 0 && (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-accent">
                    <RatingStars rating={ratingSummary.average} size="sm" />
                    {ratingSummary.average.toFixed(1)}
                    <span className="font-semibold text-muted">
                      (
                      {t("reviewsSection.reviewsCount", {
                        count: ratingSummary.total,
                      })}
                      )
                    </span>
                  </span>
                )}
                <span className="km text-sm text-muted">
                  {PRICE_LABEL[restaurant.priceRange]}
                </span>
                <span
                  className={`km flex items-center gap-1.5 text-sm font-bold ${openNow ? "text-secondary" : "text-red-600"}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-secondary" : "bg-red-600"}`}
                  />
                  {openNow
                    ? t("restaurantPage.openNow")
                    : t("restaurantPage.closedNow")}
                </span>
              </div>
            </div>
            <SaveRestaurantButton
              restaurantId={restaurant.id}
              label={
                savedIds.has(restaurant.id)
                  ? t("restaurantPage.saved")
                  : t("restaurantPage.save")
              }
              className="shrink-0"
            />
          </div>

          {restaurant.description && (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink">
              {restaurant.description}
            </p>
          )}

          {quickInfo.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickInfo.map((info) => (
                <div
                  key={info.label}
                  className="rounded-xl border border-border bg-surface p-3.5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                    {info.label}
                  </p>
                  <p
                    className={`km mt-1 text-sm font-bold ${info.accent ? "text-accent" : "text-ink"}`}
                  >
                    {info.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {restaurant.menus.length > 0 && (
            <section className="mt-10">
              <h2 className="disp text-lg font-bold text-ink">
                {t("restaurantPage.menu")}
              </h2>
              {restaurant.menus
                .filter((menu) => menu.isActive)
                .map((menu) => (
                  <div key={menu.id} className="mt-5">
                    <h3 className="km font-bold text-ink">{menu.name}</h3>
                    {menu.description && (
                      <p className="km mt-0.5 text-sm text-muted">
                        {menu.description}
                      </p>
                    )}
                    <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      {menu.items
                        .filter((item) => item.isAvailable)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3.5 rounded-2xl border border-border bg-surface p-3"
                          >
                            {item.imageUrl ? (
                              <div className="h-[74px] w-[74px] shrink-0 overflow-hidden rounded-xl">
                                <ZoomableImage
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-[74px] w-[74px] shrink-0 rounded-xl bg-bg" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="km font-bold text-ink">
                                {item.name}
                              </p>
                              {item.description && (
                                <p className="km mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                                  {item.description}
                                </p>
                              )}
                              {(item.isVegan ||
                                item.isVegetarian ||
                                item.isGlutenFree) && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {item.isVegan && (
                                    <span className="km rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
                                      {t("ownerManage.menu.vegan")}
                                    </span>
                                  )}
                                  {item.isVegetarian && !item.isVegan && (
                                    <span className="km rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
                                      {t("ownerManage.menu.vegetarian")}
                                    </span>
                                  )}
                                  {item.isGlutenFree && (
                                    <span className="km rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
                                      {t("ownerManage.menu.glutenFree")}
                                    </span>
                                  )}
                                </div>
                              )}
                              <p className="km mt-1.5 text-sm font-extrabold text-accent">
                                {menuPrice(Number(item.price), locale)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </section>
          )}

          {restaurant.latitude && restaurant.longitude && (
            <section className="mt-10">
              <h2 className="disp text-lg font-bold text-ink">
                {t("restaurantPage.location")}
              </h2>
              <div
                className="relative mt-3 h-60 overflow-hidden rounded-2xl border border-border"
                style={{
                  background: "linear-gradient(135deg,#E8EEEA,#DCE6E0)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(31,111,84,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(31,111,84,.07) 1px,transparent 1px)",
                    backgroundSize: "42px 42px",
                  }}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                  <div
                    className="h-[30px] w-[30px] rounded-[50%_50%_50%_0] bg-accent shadow-[0_6px_14px_rgba(0,0,0,.3)]"
                    style={{ transform: "rotate(-45deg)" }}
                  />
                </div>
                <div className="absolute inset-x-3.5 bottom-3.5 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                  <div>
                    <p className="km text-sm font-bold text-ink">
                      {restaurant.name}
                    </p>
                    <p className="km text-xs text-muted">
                      {restaurant.address}, {restaurant.city}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="km shrink-0 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
                  >
                    {t("restaurantPage.getDirections")}
                  </a>
                </div>
              </div>
            </section>
          )}

          <ReviewsSection restaurantId={restaurant.id} />
        </FadeIn>

        <div className="lg:sticky lg:top-24 lg:self-start lg:space-y-4">
          <BookingWidget restaurant={restaurant} />

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="disp text-sm font-bold text-ink">
              {t("restaurantPage.hours")}
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              {DAY_ORDER.map((day) => {
                const hour = hoursByDay.get(day);
                const closed = !hour || hour.isClosed;
                const isToday = day === today;
                const colorClass = isToday
                  ? closed
                    ? "text-red-600"
                    : "text-secondary"
                  : closed
                    ? "text-muted"
                    : "text-ink";
                return (
                  <div key={day} className="flex justify-between font-semibold">
                    <span className={`km ${colorClass}`}>
                      {t(DAY_LABEL_KEY[day])}
                    </span>
                    <span className={`km ${colorClass}`}>
                      {closed
                        ? t("restaurantPage.closed")
                        : `${formatTimeLabel(hour.openTime, locale, t)} – ${formatTimeLabel(hour.closeTime, locale, t)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
