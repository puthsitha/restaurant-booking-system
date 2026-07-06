import { apiFetch } from "@/lib/api";
import type {
  AdminListRestaurantsParams,
  DayOfWeek,
  GalleryImage,
  ListMyRestaurantsParams,
  ListRestaurantsParams,
  ListRestaurantsResponse,
  Menu,
  MenuItem,
  OperatingHours,
  PriceRange,
  RestaurantFull,
  RestaurantManagementDetail,
  RestaurantOwned,
  RestaurantPublicDetail,
  RestaurantStatus,
  RestaurantTable,
  SpecialClosure,
  Tag,
  TableStatus,
} from "@/lib/restaurants/types";

// ========================= Restaurant CRUD ========================

export interface RestaurantProfileInput {
  name: string;
  nameKm?: string;
  slug: string;
  description?: string;
  descriptionKm?: string;
  cuisineType: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  coverImageUrl?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: PriceRange;
  minBookingNotice?: number;
  maxBookingDays?: number;
  cancellationHours?: number;
  depositRequired?: boolean;
  depositAmount?: number;
  maxCapacity?: number;
  minCapacity?: number;
  parkingAvailable?: boolean;
  dressCode?: string;
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function listRestaurants(
  params: ListRestaurantsParams = {},
  locale?: "en" | "km",
): Promise<ListRestaurantsResponse> {
  return apiFetch<ListRestaurantsResponse>(
    `/api/restaurants${toQueryString(params as Record<string, string | number | undefined>)}`,
    { locale },
  );
}

export function getRestaurantBySlug(
  slug: string,
  locale?: "en" | "km",
): Promise<{ restaurant: RestaurantPublicDetail }> {
  return apiFetch(`/api/restaurants/slug/${encodeURIComponent(slug)}`, { locale });
}

export function listMyRestaurants(
  params: ListMyRestaurantsParams = {},
  token: string,
): Promise<ListRestaurantsResponse> {
  return apiFetch<ListRestaurantsResponse>(
    `/api/restaurants/mine${toQueryString(params as Record<string, string | number | undefined>)}`,
    { token },
  );
}

// Admin-only moderation view: every restaurant regardless of status.
export function listAllRestaurantsAdmin(
  params: AdminListRestaurantsParams,
  token: string,
): Promise<ListRestaurantsResponse> {
  return apiFetch<ListRestaurantsResponse>(
    `/api/restaurants/all${toQueryString(params as Record<string, string | number | undefined>)}`,
    { token },
  );
}

export function getRestaurant(
  id: string,
  token: string,
): Promise<{ restaurant: RestaurantManagementDetail }> {
  return apiFetch(`/api/restaurants/${id}`, { token });
}

export function createRestaurant(
  input: RestaurantProfileInput,
  token: string,
): Promise<{ restaurant: RestaurantFull }> {
  return apiFetch("/api/restaurants", { method: "POST", body: input, token });
}

export function updateRestaurant(
  id: string,
  input: Partial<RestaurantProfileInput>,
  token: string,
): Promise<{ restaurant: RestaurantFull }> {
  return apiFetch(`/api/restaurants/${id}`, { method: "PATCH", body: input, token });
}

export function updateRestaurantStatus(
  id: string,
  status: RestaurantStatus,
  reason: string,
  token: string,
): Promise<{ restaurant: RestaurantFull }> {
  return apiFetch(`/api/restaurants/${id}/status`, {
    method: "PATCH",
    body: { status, reason },
    token,
  });
}

// ====================== Operating hours ========================

export interface OperatingHourInput {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed?: boolean;
}

export function setOperatingHours(
  id: string,
  hours: OperatingHourInput[],
  token: string,
): Promise<{ hours: OperatingHours[] }> {
  return apiFetch(`/api/restaurants/${id}/hours`, { method: "PUT", body: { hours }, token });
}

// =========================== Tables ============================

export interface TableInput {
  tableNumber: string;
  capacity: number;
  floor?: string;
  zone?: string;
  description?: string;
  status?: TableStatus;
  positionX?: number | null;
  positionY?: number | null;
}

export function listTables(id: string, token: string): Promise<{ tables: RestaurantTable[] }> {
  return apiFetch(`/api/restaurants/${id}/tables`, { token });
}

export function createTable(
  id: string,
  input: TableInput,
  token: string,
): Promise<{ table: RestaurantTable }> {
  return apiFetch(`/api/restaurants/${id}/tables`, { method: "POST", body: input, token });
}

export function updateTable(
  id: string,
  tableId: string,
  input: Partial<TableInput>,
  token: string,
): Promise<{ table: RestaurantTable }> {
  return apiFetch(`/api/restaurants/${id}/tables/${tableId}`, {
    method: "PATCH",
    body: input,
    token,
  });
}

export function deleteTable(id: string, tableId: string, token: string): Promise<void> {
  return apiFetch(`/api/restaurants/${id}/tables/${tableId}`, { method: "DELETE", token });
}

// ============================ Menus ============================

export interface MenuInput {
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MenuItemInput {
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  sortOrder?: number;
}

export function createMenu(
  id: string,
  input: MenuInput,
  token: string,
): Promise<{ menu: Menu }> {
  return apiFetch(`/api/restaurants/${id}/menus`, { method: "POST", body: input, token });
}

export function updateMenu(
  id: string,
  menuId: string,
  input: Partial<MenuInput>,
  token: string,
): Promise<{ menu: Menu }> {
  return apiFetch(`/api/restaurants/${id}/menus/${menuId}`, {
    method: "PATCH",
    body: input,
    token,
  });
}

export function deleteMenu(id: string, menuId: string, token: string): Promise<void> {
  return apiFetch(`/api/restaurants/${id}/menus/${menuId}`, { method: "DELETE", token });
}

export function createMenuItem(
  id: string,
  menuId: string,
  input: MenuItemInput,
  token: string,
): Promise<{ item: MenuItem }> {
  return apiFetch(`/api/restaurants/${id}/menus/${menuId}/items`, {
    method: "POST",
    body: input,
    token,
  });
}

export function updateMenuItem(
  id: string,
  menuId: string,
  itemId: string,
  input: Partial<MenuItemInput>,
  token: string,
): Promise<{ item: MenuItem }> {
  return apiFetch(`/api/restaurants/${id}/menus/${menuId}/items/${itemId}`, {
    method: "PATCH",
    body: input,
    token,
  });
}

export function deleteMenuItem(
  id: string,
  menuId: string,
  itemId: string,
  token: string,
): Promise<void> {
  return apiFetch(`/api/restaurants/${id}/menus/${menuId}/items/${itemId}`, {
    method: "DELETE",
    token,
  });
}

// =========================== Gallery ============================

export interface GalleryImageInput {
  url: string;
  caption?: string;
  sortOrder?: number;
}

export function createGalleryImage(
  id: string,
  input: GalleryImageInput,
  token: string,
): Promise<{ image: GalleryImage }> {
  return apiFetch(`/api/restaurants/${id}/gallery`, { method: "POST", body: input, token });
}

export function updateGalleryImage(
  id: string,
  imageId: string,
  input: Partial<GalleryImageInput>,
  token: string,
): Promise<{ image: GalleryImage }> {
  return apiFetch(`/api/restaurants/${id}/gallery/${imageId}`, {
    method: "PATCH",
    body: input,
    token,
  });
}

export function deleteGalleryImage(id: string, imageId: string, token: string): Promise<void> {
  return apiFetch(`/api/restaurants/${id}/gallery/${imageId}`, { method: "DELETE", token });
}

// ====================== Special closures ========================

export interface SpecialClosureInput {
  date: string;
  reason?: string;
}

export function createSpecialClosure(
  id: string,
  input: SpecialClosureInput,
  token: string,
): Promise<{ closure: SpecialClosure }> {
  return apiFetch(`/api/restaurants/${id}/closures`, { method: "POST", body: input, token });
}

export function deleteSpecialClosure(
  id: string,
  closureId: string,
  token: string,
): Promise<void> {
  return apiFetch(`/api/restaurants/${id}/closures/${closureId}`, { method: "DELETE", token });
}

// ============================= Tags ==============================

export function setRestaurantTags(
  id: string,
  tagIds: string[],
  token: string,
): Promise<{ restaurant: RestaurantOwned }> {
  return apiFetch(`/api/restaurants/${id}/tags`, { method: "PUT", body: { tagIds }, token });
}

export function listTags(locale?: "en" | "km"): Promise<{ tags: Tag[] }> {
  return apiFetch("/api/tags", { locale });
}

export function createTag(name: string, nameKm: string | undefined, token: string): Promise<{ tag: Tag }> {
  return apiFetch("/api/tags", { method: "POST", body: { name, nameKm }, token });
}

export function updateTag(
  id: string,
  input: { name?: string; nameKm?: string },
  token: string,
): Promise<{ tag: Tag }> {
  return apiFetch(`/api/tags/${id}`, { method: "PATCH", body: input, token });
}

export function deleteTag(id: string, token: string): Promise<void> {
  return apiFetch(`/api/tags/${id}`, { method: "DELETE", token });
}
