import { z } from "zod";

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const priceRangeEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const restaurantStatusEnum = z.enum(["ACTIVE", "DISABLED"]);
export const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);
export const tableStatusEnum = z.enum(["AVAILABLE", "SEATED", "RESERVED"]);

// ========================= Restaurant =========================

export const createRestaurantSchema = z.object({
  name: z.string().trim().min(1).max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(150)
    .regex(SLUG, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().max(2000).optional(),
  cuisineType: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1).max(120).default("Cambodia"),
  postalCode: z.string().trim().max(30).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  website: z.string().trim().url().optional(),
  coverImageUrl: z.string().trim().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  priceRange: priceRangeEnum.default("MEDIUM"),
  minBookingNotice: z.number().int().min(0).default(60),
  maxBookingDays: z.number().int().min(1).default(30),
  cancellationHours: z.number().int().min(0).default(24),
  depositRequired: z.boolean().default(false),
  depositAmount: z.number().min(0).default(0),
  maxCapacity: z.number().int().min(0).default(0),
  minCapacity: z.number().int().min(1).default(1),
  parkingAvailable: z.boolean().default(false),
  dressCode: z.string().trim().max(120).optional(),
});
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;

export const updateRestaurantSchema = createRestaurantSchema.partial();
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;

export const updateRestaurantStatusSchema = z.object({
  status: restaurantStatusEnum,
});
export type UpdateRestaurantStatusInput = z.infer<typeof updateRestaurantStatusSchema>;

export const listRestaurantsQuerySchema = z.object({
  city: z.string().trim().min(1).optional(),
  cuisineType: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  priceRange: priceRangeEnum.optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListRestaurantsQuery = z.infer<typeof listRestaurantsQuerySchema>;

// Admin moderation view: same filters, plus an optional status filter since
// admins (unlike the public listing) can see DISABLED restaurants too.
export const adminListRestaurantsQuerySchema = listRestaurantsQuerySchema.extend({
  status: restaurantStatusEnum.optional(),
});
export type AdminListRestaurantsQuery = z.infer<typeof adminListRestaurantsQuerySchema>;

// ====================== Operating hours ========================

const operatingHourEntrySchema = z.object({
  dayOfWeek: dayOfWeekEnum,
  openTime: z.string().regex(HHMM, "Use HH:MM 24-hour format"),
  closeTime: z.string().regex(HHMM, "Use HH:MM 24-hour format"),
  isClosed: z.boolean().default(false),
});

export const setOperatingHoursSchema = z
  .object({
    hours: z.array(operatingHourEntrySchema).min(1).max(7),
  })
  .refine(
    (data) => new Set(data.hours.map((h) => h.dayOfWeek)).size === data.hours.length,
    { message: "Each day of week may only appear once", path: ["hours"] },
  );
export type SetOperatingHoursInput = z.infer<typeof setOperatingHoursSchema>;

// =========================== Tables ============================

export const createTableSchema = z.object({
  tableNumber: z.string().trim().min(1).max(20),
  capacity: z.number().int().min(1).max(50),
  floor: z.string().trim().max(60).optional(),
  zone: z.string().trim().max(60).optional(),
  description: z.string().trim().max(255).optional(),
  status: tableStatusEnum.default("AVAILABLE"),
});
export type CreateTableInput = z.infer<typeof createTableSchema>;

export const updateTableSchema = createTableSchema.partial();
export type UpdateTableInput = z.infer<typeof updateTableSchema>;

// ============================ Menus ============================

export const createMenuSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type CreateMenuInput = z.infer<typeof createMenuSchema>;

export const updateMenuSchema = createMenuSchema.partial();
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;

export const createMenuItemSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).optional(),
  price: z.number().min(0),
  category: z.string().trim().max(80).optional(),
  imageUrl: z.string().trim().url().optional(),
  isAvailable: z.boolean().default(true),
  isVegan: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;

export const updateMenuItemSchema = createMenuItemSchema.partial();
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;

// =========================== Gallery ============================

export const createGalleryImageSchema = z.object({
  url: z.string().trim().url(),
  caption: z.string().trim().max(255).optional(),
  sortOrder: z.number().int().default(0),
});
export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;

export const updateGalleryImageSchema = createGalleryImageSchema.partial();
export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;

// ====================== Special closures ========================

export const createSpecialClosureSchema = z.object({
  date: z.coerce.date(),
  reason: z.string().trim().max(255).optional(),
});
export type CreateSpecialClosureInput = z.infer<typeof createSpecialClosureSchema>;

// ============================= Tags ==============================

export const setRestaurantTagsSchema = z.object({
  tagIds: z.array(z.string().min(1)).max(20),
});
export type SetRestaurantTagsInput = z.infer<typeof setRestaurantTagsSchema>;
