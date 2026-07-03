"use client";

import { HeartIcon } from "@/components/ui/icons";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { useSavedRestaurants } from "@/lib/savedRestaurants/context";

interface SaveRestaurantButtonProps {
  restaurantId: string;
  className?: string;
}

// Standalone heart toggle for pages (like the restaurant detail page) that
// aren't rendering a `RestaurantCard` — shares the same saved-restaurants
// context so the heart state stays in sync across the site.
export function SaveRestaurantButton({ restaurantId, className }: SaveRestaurantButtonProps) {
  const { status } = useCustomerAuth();
  const { savedIds, toggle } = useSavedRestaurants();

  if (status !== "authenticated") return null;

  const isSaved = savedIds.has(restaurantId);

  return (
    <button
      type="button"
      aria-label={isSaved ? "Remove from saved restaurants" : "Save restaurant"}
      aria-pressed={isSaved}
      onClick={() => toggle(restaurantId)}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-accent backdrop-blur transition hover:bg-white ${className ?? ""}`}
    >
      <HeartIcon className="h-5 w-5" filled={isSaved} />
    </button>
  );
}
