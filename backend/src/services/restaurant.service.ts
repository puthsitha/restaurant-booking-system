import type { Prisma, Restaurant } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { localizeRestaurant, localizeTags, localizeMenus, type Locale } from "../lib/locale";
import { haversineDistanceKm, type Coordinates } from "../lib/geo";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
  UpdateRestaurantStatusInput,
  ListRestaurantsQuery,
  AdminListRestaurantsQuery,
  ListMyRestaurantsQuery,
  SetOperatingHoursInput,
  CreateTableInput,
  UpdateTableInput,
  CreateMenuInput,
  UpdateMenuInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  CreateGalleryImageInput,
  UpdateGalleryImageInput,
  CreateSpecialClosureInput,
  SetRestaurantTagsInput,
} from "../schemas/restaurant.schemas";

// ============================ Helpers ============================

async function getRestaurantOrThrow(id: string): Promise<Restaurant> {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }
  return restaurant;
}

// 404 (not 403) when the restaurant exists but belongs to someone else, so
// owners can't probe for the existence of other owners' restaurants by id.
async function getOwnedRestaurantOrThrow(
  id: string,
  ownerId: string,
): Promise<Restaurant> {
  const restaurant = await getRestaurantOrThrow(id);
  if (restaurant.ownerId !== ownerId) {
    throw new HttpError(404, "Restaurant not found");
  }
  return restaurant;
}

async function assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
  const existing = await prisma.restaurant.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw new HttpError(409, "That URL slug is already taken");
  }
}

const publicListSelect = {
  id: true,
  slug: true,
  name: true,
  nameKm: true,
  description: true,
  descriptionKm: true,
  cuisineType: true,
  address: true,
  addressKm: true,
  city: true,
  state: true,
  country: true,
  coverImageUrl: true,
  latitude: true,
  longitude: true,
  priceRange: true,
  isPopular: true,
  depositRequired: true,
  depositAmount: true,
  createdAt: true,
  tags: { select: { id: true, name: true, nameKm: true } },
} satisfies Prisma.RestaurantSelect;

// Same as the public listing, plus fields diners don't need but admins
// moderating the platform do.
const adminListSelect = {
  ...publicListSelect,
  status: true,
  statusReason: true,
  ownerId: true,
} satisfies Prisma.RestaurantSelect;

// What an owner sees about their own restaurant in their list — same as the
// admin list minus the owner id (it's always themself).
const ownerListSelect = {
  ...publicListSelect,
  status: true,
  statusReason: true,
} satisfies Prisma.RestaurantSelect;

const publicDetailInclude = {
  operatingHours: true,
  menus: { include: { items: true }, orderBy: { sortOrder: "asc" as const } },
  galleryImages: { orderBy: { sortOrder: "asc" as const } },
  specialClosures: { where: { date: { gte: new Date() } } },
  tags: true,
} satisfies Prisma.RestaurantInclude;

const managementDetailInclude = {
  ...publicDetailInclude,
  specialClosures: true,
  tables: true,
  owner: { select: { id: true, name: true, email: true, phone: true } },
} satisfies Prisma.RestaurantInclude;

// ========================= Restaurant CRUD ========================

export async function createRestaurant(
  ownerId: string,
  input: CreateRestaurantInput,
): Promise<Restaurant> {
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) {
    throw new HttpError(404, "Owner not found");
  }

  const existingCount = await prisma.restaurant.count({ where: { ownerId } });
  if (existingCount >= owner.restaurantLimit) {
    throw new HttpError(
      403,
      `You've reached your limit of ${owner.restaurantLimit} restaurant(s). Contact support to request more.`,
    );
  }

  await assertSlugAvailable(input.slug);

  // New restaurants start PENDING — an admin has to approve them (with a
  // reason) before they're ACTIVE and visible to diners.
  return prisma.restaurant.create({ data: { ...input, ownerId, status: "PENDING" } });
}

// Distance from the client's coordinates, in kilometers rounded to 1 decimal
// place — omitted when the restaurant has no lat/lng on file yet.
function withDistance<T extends { latitude: unknown; longitude: unknown }>(
  restaurant: T,
  clientCoordinates: Coordinates,
): T & { distanceKm: number | null } {
  const latitude = restaurant.latitude === null || restaurant.latitude === undefined ? null : Number(restaurant.latitude);
  const longitude = restaurant.longitude === null || restaurant.longitude === undefined ? null : Number(restaurant.longitude);
  if (latitude === null || longitude === null) {
    return { ...restaurant, distanceKm: null };
  }
  const distanceKm = haversineDistanceKm(clientCoordinates, { latitude, longitude });
  return { ...restaurant, distanceKm: Math.round(distanceKm * 10) / 10 };
}

export async function listRestaurants(
  query: ListRestaurantsQuery,
  locale: Locale,
  clientCoordinates: Coordinates,
) {
  const where: Prisma.RestaurantWhereInput = {
    status: "ACTIVE",
    ...(query.city ? { city: { equals: query.city, mode: "insensitive" } } : {}),
    ...(query.cuisineType
      ? { cuisineType: { equals: query.cuisineType, mode: "insensitive" } }
      : {}),
    ...(query.priceRange ? { priceRange: query.priceRange } : {}),
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
    ...(query.tag
      ? { tags: { some: { name: { equals: query.tag, mode: "insensitive" } } } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      select: publicListSelect,
      orderBy: [{ isPopular: "desc" }, { createdAt: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.restaurant.count({ where }),
  ]);

  const localizedItems = items.map((item) => ({
    ...withDistance(localizeRestaurant(item, locale), clientCoordinates),
    tags: localizeTags(item.tags, locale),
  }));

  return { items: localizedItems, total, page: query.page, pageSize: query.pageSize };
}

export async function listAllRestaurantsForAdmin(query: AdminListRestaurantsQuery) {
  const where: Prisma.RestaurantWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.city ? { city: { equals: query.city, mode: "insensitive" } } : {}),
    ...(query.cuisineType
      ? { cuisineType: { equals: query.cuisineType, mode: "insensitive" } }
      : {}),
    ...(query.priceRange ? { priceRange: query.priceRange } : {}),
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
    ...(query.tag
      ? { tags: { some: { name: { equals: query.tag, mode: "insensitive" } } } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      select: adminListSelect,
      orderBy: [{ createdAt: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.restaurant.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function listMyRestaurants(ownerId: string, query: ListMyRestaurantsQuery) {
  const where: Prisma.RestaurantWhereInput = {
    ownerId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      select: ownerListSelect,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.restaurant.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getPublicRestaurantBySlug(slug: string, locale: Locale) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: publicDetailInclude,
  });
  if (!restaurant || restaurant.status !== "ACTIVE") {
    throw new HttpError(404, "Restaurant not found");
  }
  return {
    ...localizeRestaurant(restaurant, locale),
    tags: localizeTags(restaurant.tags, locale),
    menus: localizeMenus(restaurant.menus, locale),
  };
}

export async function getManagementRestaurant(
  id: string,
  requester: { id: string; role: string },
) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: managementDetailInclude,
  });
  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }
  if (restaurant.ownerId !== requester.id && requester.role !== "ADMIN") {
    throw new HttpError(404, "Restaurant not found");
  }
  return restaurant;
}

export async function updateRestaurant(
  id: string,
  ownerId: string,
  input: UpdateRestaurantInput,
): Promise<Restaurant> {
  const restaurant = await getOwnedRestaurantOrThrow(id, ownerId);
  if (input.slug && input.slug !== restaurant.slug) {
    await assertSlugAvailable(input.slug, id);
  }
  return prisma.restaurant.update({ where: { id }, data: input });
}

export async function updateRestaurantStatus(
  id: string,
  input: UpdateRestaurantStatusInput,
): Promise<Restaurant> {
  await getRestaurantOrThrow(id);
  return prisma.restaurant.update({
    where: { id },
    data: { status: input.status, statusReason: input.reason },
  });
}

// ====================== Operating hours ========================

export async function setOperatingHours(
  restaurantId: string,
  ownerId: string,
  input: SetOperatingHoursInput,
) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);

  return prisma.$transaction(async (tx) => {
    await tx.operatingHours.deleteMany({ where: { restaurantId } });
    await tx.operatingHours.createMany({
      data: input.hours.map((hour) => ({ ...hour, restaurantId })),
    });
    return tx.operatingHours.findMany({ where: { restaurantId } });
  });
}

// =========================== Tables ============================

export async function listTables(restaurantId: string, ownerId: string) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);
  return prisma.restaurantTable.findMany({
    where: { restaurantId },
    orderBy: { tableNumber: "asc" },
  });
}

export async function createTable(
  restaurantId: string,
  ownerId: string,
  input: CreateTableInput,
) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);
  const existing = await prisma.restaurantTable.findUnique({
    where: { restaurantId_tableNumber: { restaurantId, tableNumber: input.tableNumber } },
  });
  if (existing) {
    throw new HttpError(409, `Table "${input.tableNumber}" already exists`);
  }
  return prisma.restaurantTable.create({ data: { ...input, restaurantId } });
}

async function getOwnedTableOrThrow(restaurantId: string, ownerId: string, tableId: string) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);
  const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
  if (!table || table.restaurantId !== restaurantId) {
    throw new HttpError(404, "Table not found");
  }
  return table;
}

export async function updateTable(
  restaurantId: string,
  ownerId: string,
  tableId: string,
  input: UpdateTableInput,
) {
  await getOwnedTableOrThrow(restaurantId, ownerId, tableId);
  return prisma.restaurantTable.update({ where: { id: tableId }, data: input });
}

export async function deleteTable(
  restaurantId: string,
  ownerId: string,
  tableId: string,
): Promise<void> {
  await getOwnedTableOrThrow(restaurantId, ownerId, tableId);
  await prisma.restaurantTable.delete({ where: { id: tableId } });
}

// ============================ Menus ============================

export async function createMenu(
  restaurantId: string,
  ownerId: string,
  input: CreateMenuInput,
) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);
  return prisma.menu.create({ data: { ...input, restaurantId } });
}

async function getOwnedMenuOrThrow(restaurantId: string, ownerId: string, menuId: string) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);
  const menu = await prisma.menu.findUnique({ where: { id: menuId } });
  if (!menu || menu.restaurantId !== restaurantId) {
    throw new HttpError(404, "Menu not found");
  }
  return menu;
}

export async function updateMenu(
  restaurantId: string,
  ownerId: string,
  menuId: string,
  input: UpdateMenuInput,
) {
  await getOwnedMenuOrThrow(restaurantId, ownerId, menuId);
  return prisma.menu.update({ where: { id: menuId }, data: input });
}

export async function deleteMenu(
  restaurantId: string,
  ownerId: string,
  menuId: string,
): Promise<void> {
  await getOwnedMenuOrThrow(restaurantId, ownerId, menuId);
  await prisma.menu.delete({ where: { id: menuId } });
}

export async function createMenuItem(
  restaurantId: string,
  ownerId: string,
  menuId: string,
  input: CreateMenuItemInput,
) {
  await getOwnedMenuOrThrow(restaurantId, ownerId, menuId);
  return prisma.menuItem.create({ data: { ...input, menuId } });
}

async function getOwnedMenuItemOrThrow(
  restaurantId: string,
  ownerId: string,
  menuId: string,
  itemId: string,
) {
  await getOwnedMenuOrThrow(restaurantId, ownerId, menuId);
  const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
  if (!item || item.menuId !== menuId) {
    throw new HttpError(404, "Menu item not found");
  }
  return item;
}

export async function updateMenuItem(
  restaurantId: string,
  ownerId: string,
  menuId: string,
  itemId: string,
  input: UpdateMenuItemInput,
) {
  await getOwnedMenuItemOrThrow(restaurantId, ownerId, menuId, itemId);
  return prisma.menuItem.update({ where: { id: itemId }, data: input });
}

export async function deleteMenuItem(
  restaurantId: string,
  ownerId: string,
  menuId: string,
  itemId: string,
): Promise<void> {
  await getOwnedMenuItemOrThrow(restaurantId, ownerId, menuId, itemId);
  await prisma.menuItem.delete({ where: { id: itemId } });
}

// =========================== Gallery ============================

export async function createGalleryImage(
  restaurantId: string,
  ownerId: string,
  input: CreateGalleryImageInput,
) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);
  return prisma.galleryImage.create({ data: { ...input, restaurantId } });
}

async function getOwnedGalleryImageOrThrow(
  restaurantId: string,
  ownerId: string,
  imageId: string,
) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);
  const image = await prisma.galleryImage.findUnique({ where: { id: imageId } });
  if (!image || image.restaurantId !== restaurantId) {
    throw new HttpError(404, "Gallery image not found");
  }
  return image;
}

export async function updateGalleryImage(
  restaurantId: string,
  ownerId: string,
  imageId: string,
  input: UpdateGalleryImageInput,
) {
  await getOwnedGalleryImageOrThrow(restaurantId, ownerId, imageId);
  return prisma.galleryImage.update({ where: { id: imageId }, data: input });
}

export async function deleteGalleryImage(
  restaurantId: string,
  ownerId: string,
  imageId: string,
): Promise<void> {
  await getOwnedGalleryImageOrThrow(restaurantId, ownerId, imageId);
  await prisma.galleryImage.delete({ where: { id: imageId } });
}

// ====================== Special closures ========================

export async function createSpecialClosure(
  restaurantId: string,
  ownerId: string,
  input: CreateSpecialClosureInput,
) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);
  const existing = await prisma.specialClosure.findUnique({
    where: { restaurantId_date: { restaurantId, date: input.date } },
  });
  if (existing) {
    throw new HttpError(409, "This date is already marked as a closure");
  }
  return prisma.specialClosure.create({ data: { ...input, restaurantId } });
}

export async function deleteSpecialClosure(
  restaurantId: string,
  ownerId: string,
  closureId: string,
): Promise<void> {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);
  const closure = await prisma.specialClosure.findUnique({ where: { id: closureId } });
  if (!closure || closure.restaurantId !== restaurantId) {
    throw new HttpError(404, "Closure not found");
  }
  await prisma.specialClosure.delete({ where: { id: closureId } });
}

// ============================= Tags ==============================

export async function setRestaurantTags(
  restaurantId: string,
  ownerId: string,
  input: SetRestaurantTagsInput,
) {
  await getOwnedRestaurantOrThrow(restaurantId, ownerId);

  if (input.tagIds.length > 0) {
    const found = await prisma.tag.count({ where: { id: { in: input.tagIds } } });
    if (found !== new Set(input.tagIds).size) {
      throw new HttpError(400, "One or more tags don't exist");
    }
  }

  return prisma.restaurant.update({
    where: { id: restaurantId },
    data: { tags: { set: input.tagIds.map((id) => ({ id })) } },
    include: { tags: true },
  });
}
