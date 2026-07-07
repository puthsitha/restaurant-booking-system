import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";

const savedRestaurantSelect = {
  id: true,
  createdAt: true,
  restaurant: {
    select: {
      id: true,
      slug: true,
      name: true,
      cuisine: { select: { name: true, nameKm: true } },
      city: { select: { name: true, nameKm: true } },
      coverImageUrl: true,
      priceRange: true,
    },
  },
} satisfies Prisma.SavedRestaurantSelect;

export async function listSavedRestaurants(userId: string) {
  const saved = await prisma.savedRestaurant.findMany({
    where: { userId },
    select: savedRestaurantSelect,
    orderBy: { createdAt: "desc" },
  });
  return saved.map(({ restaurant, ...rest }) => {
    const { cuisine, city, ...restaurantFields } = restaurant;
    return {
      ...rest,
      restaurant: { ...restaurantFields, cuisineType: cuisine.name, city: city.name },
    };
  });
}

export async function saveRestaurant(userId: string, restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }

  return prisma.savedRestaurant.upsert({
    where: { userId_restaurantId: { userId, restaurantId } },
    create: { userId, restaurantId },
    update: {},
    select: savedRestaurantSelect,
  });
}

export async function unsaveRestaurant(userId: string, restaurantId: string): Promise<void> {
  await prisma.savedRestaurant.deleteMany({ where: { userId, restaurantId } });
}
