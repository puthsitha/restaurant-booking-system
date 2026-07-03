export interface SavedRestaurantSummary {
  id: string;
  slug: string;
  name: string;
  cuisineType: string;
  city: string;
  coverImageUrl: string | null;
  priceRange: "LOW" | "MEDIUM" | "HIGH";
}

export interface SavedRestaurant {
  id: string;
  createdAt: string;
  restaurant: SavedRestaurantSummary;
}
