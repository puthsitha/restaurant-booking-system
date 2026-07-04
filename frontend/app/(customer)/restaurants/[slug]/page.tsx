import { notFound } from "next/navigation";

import { RestaurantDetailContent } from "@/components/restaurants/RestaurantDetailContent";
import { ApiError } from "@/lib/api";
import { getRestaurantBySlug } from "@/lib/restaurants/api";

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

  return <RestaurantDetailContent restaurant={restaurant} />;
}
