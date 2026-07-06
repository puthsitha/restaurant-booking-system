import { notFound } from "next/navigation";

import { RestaurantDetailContent } from "@/components/restaurants/RestaurantDetailContent";
import { ApiError } from "@/lib/api";
import { theme } from "@/lib/theme";
import { getRestaurantBySlug } from "@/lib/restaurants/api";

export default async function RestaurantDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let restaurant;
  try {
    // Server-rendered, so the user's stored locale preference (client-only,
    // in localStorage) isn't known yet — match the UI shell's own default
    // language until hydration; the language toggle only affects client fetches.
    ({ restaurant } = await getRestaurantBySlug(params.slug, theme.defaultLocale));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return <RestaurantDetailContent restaurant={restaurant} />;
}
