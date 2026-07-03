import { apiFetch } from "@/lib/api";
import type { SavedRestaurant } from "@/lib/savedRestaurants/types";

export function listSavedRestaurants(token: string): Promise<{ savedRestaurants: SavedRestaurant[] }> {
  return apiFetch("/api/saved-restaurants", { token });
}

export function saveRestaurant(
  restaurantId: string,
  token: string,
): Promise<{ savedRestaurant: SavedRestaurant }> {
  return apiFetch("/api/saved-restaurants", { method: "POST", body: { restaurantId }, token });
}

export function unsaveRestaurant(restaurantId: string, token: string): Promise<void> {
  return apiFetch(`/api/saved-restaurants/${restaurantId}`, { method: "DELETE", token });
}
