"use client";

import { FavoriteButton } from "@/components/restaurants/FavoriteButton";

interface SaveRestaurantButtonProps {
  restaurantId: string;
  className?: string;
}

// Standalone heart toggle for pages (like the restaurant detail page) that
// aren't rendering a `RestaurantCard` — thin wrapper around the shared
// `FavoriteButton` at its larger size.
export function SaveRestaurantButton({ restaurantId, className }: SaveRestaurantButtonProps) {
  return <FavoriteButton restaurantId={restaurantId} size="md" className={className} />;
}
