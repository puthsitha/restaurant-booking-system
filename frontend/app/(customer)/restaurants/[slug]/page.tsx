import { notFound } from "next/navigation";

import { BookingWidget } from "@/components/booking/BookingWidget";
import { ApiError } from "@/lib/api";
import { getRestaurantBySlug } from "@/lib/restaurants/api";
import type { DayOfWeek } from "@/lib/restaurants/types";

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
const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export default async function RestaurantDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let restaurant;
  try {
    ({ restaurant } = await getRestaurantBySlug(params.slug));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const hoursByDay = new Map(restaurant.operatingHours.map((h) => [h.dayOfWeek, h]));

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 32px" }}>
      <div className="h-64 w-full overflow-hidden rounded-2xl bg-bg">
        {restaurant.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">🍽️</div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div>
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

          <section className="mt-10">
            <h2 className="disp text-lg font-bold text-ink">Hours</h2>
            <div className="mt-3 max-w-sm space-y-1.5 text-sm">
              {DAY_ORDER.map((day) => {
                const hour = hoursByDay.get(day);
                return (
                  <div key={day} className="flex justify-between">
                    <span className="text-muted">{DAY_LABEL[day]}</span>
                    <span className="text-ink">
                      {!hour || hour.isClosed ? "Closed" : `${hour.openTime} – ${hour.closeTime}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {restaurant.menus.length > 0 && (
            <section className="mt-10">
              <h2 className="disp text-lg font-bold text-ink">Menu</h2>
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
                            <div>
                              <p className="font-semibold text-ink">{item.name}</p>
                              {item.description && (
                                <p className="mt-0.5 text-sm text-muted">{item.description}</p>
                              )}
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
              <h2 className="disp text-lg font-bold text-ink">Gallery</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {restaurant.galleryImages.map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={image.id}
                    src={image.url}
                    alt={image.caption ?? restaurant.name}
                    className="h-32 w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <BookingWidget restaurant={restaurant} />
        </div>
      </div>
    </main>
  );
}
