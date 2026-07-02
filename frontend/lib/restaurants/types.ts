export type PriceRange = "LOW" | "MEDIUM" | "HIGH";
export type RestaurantStatus = "ACTIVE" | "DISABLED";
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

// GET /api/restaurants (public) and GET /api/restaurants/all (admin) —
// a narrow projection, not the full row. status/ownerId are only populated
// on the admin variant.
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
  ownerId?: string;
}

// GET /api/restaurants/mine and PUT .../tags — the full row plus tags.
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

// GET /api/restaurants/:id (owner/admin) — includes tables.
export interface RestaurantManagementDetail extends RestaurantPublicDetail {
  tables: RestaurantTable[];
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
