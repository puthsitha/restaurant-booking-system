export type PriceRange = "LOW" | "MEDIUM" | "HIGH";
export type RestaurantStatus = "PENDING" | "ACTIVE" | "DISABLED";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
export type TableStatus = "AVAILABLE" | "SEATED" | "RESERVED";

export interface Tag {
  id: string;
  name: string;
}

export interface OperatingHours {
  id: string;
  restaurantId: string;
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  floor: string | null;
  zone: string | null;
  description: string | null;
  status: TableStatus;
  positionX: number | null;
  positionY: number | null;
}

export interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  description: string | null;
  // Prisma Decimal fields serialize to strings over JSON.
  price: string;
  category: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  sortOrder: number;
}

export interface Menu {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  items: MenuItem[];
}

export interface GalleryImage {
  id: string;
  restaurantId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export interface SpecialClosure {
  id: string;
  restaurantId: string;
  date: string;
  reason: string | null;
}

// Base fields shared by every restaurant representation the API returns.
export interface RestaurantCore {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cuisineType: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  coverImageUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  priceRange: PriceRange;
  isPopular: boolean;
  status: RestaurantStatus;
  // Admin-supplied reason for the current status (approval, rejection,
  // suspension, or reactivation) — null until an admin has acted on it.
  statusReason: string | null;
  minBookingNotice: number;
  maxBookingDays: number;
  cancellationHours: number;
  depositRequired: boolean;
  depositAmount: string;
  maxCapacity: number;
  minCapacity: number;
  parkingAvailable: boolean;
  dressCode: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// GET /api/restaurants (public), GET /api/restaurants/all (admin), and
// GET /api/restaurants/mine (owner) — a narrow projection, not the full row.
// status/statusReason/ownerId are only populated on the admin/owner variants.
export interface RestaurantSummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cuisineType: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  coverImageUrl: string | null;
  priceRange: PriceRange;
  isPopular: boolean;
  createdAt: string;
  tags: Tag[];
  status?: RestaurantStatus;
  statusReason?: string | null;
  ownerId?: string;
}

// PUT .../tags — the full row plus tags.
export interface RestaurantOwned extends RestaurantCore {
  tags: Tag[];
}

// POST/PATCH /api/restaurants(/:id)(/status) — the full row, no relations.
export type RestaurantFull = RestaurantCore;

// GET /api/restaurants/slug/:slug (public) — no tables.
export interface RestaurantPublicDetail extends RestaurantCore {
  operatingHours: OperatingHours[];
  menus: Menu[];
  galleryImages: GalleryImage[];
  specialClosures: SpecialClosure[];
  tags: Tag[];
}

export interface RestaurantOwnerInfo {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

// GET /api/restaurants/:id (owner/admin) — includes tables and, for the
// admin moderation view, who owns it.
export interface RestaurantManagementDetail extends RestaurantPublicDetail {
  tables: RestaurantTable[];
  owner: RestaurantOwnerInfo;
}

export interface ListRestaurantsResponse {
  items: RestaurantSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListRestaurantsParams {
  city?: string;
  cuisineType?: string;
  tag?: string;
  priceRange?: PriceRange;
  search?: string;
  page?: number;
  pageSize?: number;
}

// GET /api/restaurants/all (admin) adds an optional status filter on top of
// the public search params.
export interface AdminListRestaurantsParams extends ListRestaurantsParams {
  status?: RestaurantStatus;
}

// GET /api/restaurants/mine (owner) — name search + status filter, paginated.
export interface ListMyRestaurantsParams {
  search?: string;
  status?: RestaurantStatus;
  page?: number;
  pageSize?: number;
}
