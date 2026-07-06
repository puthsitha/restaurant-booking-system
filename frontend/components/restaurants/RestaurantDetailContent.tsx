"use client";

import { BookingWidget } from "@/components/booking/BookingWidget";
import { GalleryViewer } from "@/components/restaurants/GalleryViewer";
import { ReviewsSection } from "@/components/restaurants/ReviewsSection";
import { SaveRestaurantButton } from "@/components/restaurants/SaveRestaurantButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { DayOfWeek, RestaurantPublicDetail } from "@/lib/restaurants/types";

const PRICE_LABEL: Record<string, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" };

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

interface RestaurantDetailContentProps {
  restaurant: RestaurantPublicDetail;
}

export function RestaurantDetailContent({ restaurant }: RestaurantDetailContentProps) {
  const { t } = useLanguage();

  const hoursByDay = new Map(restaurant.operatingHours.map((h) => [h.dayOfWeek, h]));
  const quickInfo = [
    restaurant.dressCode ? { label: t("restaurantPage.dressCode"), value: restaurant.dressCode } : null,
    restaurant.depositRequired
      ? {
          label: t("restaurantPage.deposit"),
          value: t("restaurantPage.depositAmount", {
            amount: `$${Number(restaurant.depositAmount).toFixed(2)}`,
          }),
        }
      : { label: t("restaurantPage.deposit"), value: t("restaurantPage.depositNotRequired") },
    {
      label: t("restaurantPage.cancellation"),
      value: t("restaurantPage.cancellationNotice", { hours: restaurant.cancellationHours }),
    },
    restaurant.parkingAvailable
      ? { label: t("restaurantPage.parking"), value: t("restaurantPage.parkingAvailable") }
      : null,
  ].filter((x): x is { label: string; value: string } => x !== null);

  return (
    <main className="mx-auto max-w-[1120px] px-8 py-12">
      <FadeIn className="relative h-64 w-full overflow-hidden rounded-2xl bg-bg">
        {restaurant.coverImageUrl ? (
          <ZoomableImage
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">🍽️</div>
        )}
        <SaveRestaurantButton restaurantId={restaurant.id} className="absolute right-4 top-4" />
      </FadeIn>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <FadeIn delay={0.05}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="disp text-3xl font-extrabold text-ink">{restaurant.name}</h1>
              <p className="mt-1 text-sm text-muted">
                {restaurant.cuisineType} · {restaurant.address}, {restaurant.city}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-bg px-3 py-1.5 text-sm font-bold text-ink">
              {PRICE_LABEL[restaurant.priceRange]}
            </span>
          </div>

          {restaurant.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {restaurant.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-ink"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {restaurant.description && (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink">
              {restaurant.description}
            </p>
          )}

          {quickInfo.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickInfo.map((info) => (
                <div key={info.label} className="rounded-xl border border-border bg-surface p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                    {info.label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">{info.value}</p>
                </div>
              ))}
            </div>
          )}

          <section className="mt-10">
            <h2 className="disp text-lg font-bold text-ink">{t("restaurantPage.hours")}</h2>
            <div className="mt-3 max-w-sm space-y-1.5 text-sm">
              {DAY_ORDER.map((day) => {
                const hour = hoursByDay.get(day);
                return (
                  <div key={day} className="flex justify-between">
                    <span className="text-muted">{t(DAY_LABEL_KEY[day])}</span>
                    <span className="text-ink">
                      {!hour || hour.isClosed
                        ? t("restaurantPage.closed")
                        : `${hour.openTime} – ${hour.closeTime}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {restaurant.menus.length > 0 && (
            <section className="mt-10">
              <h2 className="disp text-lg font-bold text-ink">{t("restaurantPage.menu")}</h2>
              {restaurant.menus
                .filter((menu) => menu.isActive)
                .map((menu) => (
                  <div key={menu.id} className="mt-5">
                    <h3 className="font-bold text-ink">{menu.name}</h3>
                    <div className="mt-2 divide-y divide-border">
                      {menu.items
                        .filter((item) => item.isAvailable)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-4 py-3"
                          >
                            <div className="flex items-start gap-3">
                              {item.imageUrl && (
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                                  <ZoomableImage
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-14 w-14 object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-ink">{item.name}</p>
                                {item.description && (
                                  <p className="mt-0.5 text-sm text-muted">{item.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="shrink-0 font-semibold text-ink">
                              ${Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </section>
          )}

          {restaurant.galleryImages.length > 0 && (
            <section className="mt-10">
              <h2 className="disp text-lg font-bold text-ink">{t("restaurantPage.gallery")}</h2>
              <div className="mt-3">
                <GalleryViewer images={restaurant.galleryImages} fallbackAlt={restaurant.name} />
              </div>
            </section>
          )}

          <ReviewsSection restaurantId={restaurant.id} />
        </FadeIn>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget restaurant={restaurant} />
        </div>
      </div>
    </main>
  );
}
