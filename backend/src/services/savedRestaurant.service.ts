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
      cuisineType: true,
      city: true,
      coverImageUrl: true,
      priceRange: true,
    },
  },
} satisfies Prisma.SavedRestaurantSelect;

export async function listSavedRestaurants(userId: string) {
  return prisma.savedRestaurant.findMany({
    where: { userId },
    select: savedRestaurantSelect,
    orderBy: { createdAt: "desc" },
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
