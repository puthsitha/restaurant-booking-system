import type { Cuisine } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { localizeMenuItem, type Locale } from "../lib/locale";
import type { CreateCuisineInput, UpdateCuisineInput } from "../schemas/cuisine.schemas";

// Cuisine has the same name/nameKm/description/descriptionKm shape as a menu
// item, so it reuses that same generic localizer rather than duplicating it.
export async function listCuisines(locale: Locale): Promise<Cuisine[]> {
  const cuisines = await prisma.cuisine.findMany({ orderBy: { name: "asc" } });
  return cuisines.map((cuisine) => localizeMenuItem(cuisine, locale));
}

export async function createCuisine(input: CreateCuisineInput): Promise<Cuisine> {
  const existing = await prisma.cuisine.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new HttpError(409, `Cuisine "${input.name}" already exists`);
  }
  return prisma.cuisine.create({ data: input });
}

export async function updateCuisine(id: string, input: UpdateCuisineInput): Promise<Cuisine> {
  const cuisine = await prisma.cuisine.findUnique({ where: { id } });
  if (!cuisine) {
    throw new HttpError(404, "Cuisine not found");
  }
  if (input.name && input.name !== cuisine.name) {
    const existing = await prisma.cuisine.findUnique({ where: { name: input.name } });
    if (existing) {
      throw new HttpError(409, `Cuisine "${input.name}" already exists`);
    }
  }
  return prisma.cuisine.update({ where: { id }, data: input });
}

export async function deleteCuisine(id: string): Promise<void> {
  const cuisine = await prisma.cuisine.findUnique({ where: { id } });
  if (!cuisine) {
    throw new HttpError(404, "Cuisine not found");
  }
  const restaurantCount = await prisma.restaurant.count({ where: { cuisineId: id } });
  if (restaurantCount > 0) {
    throw new HttpError(409, "Cuisine is still assigned to one or more restaurants");
  }
  await prisma.cuisine.delete({ where: { id } });
}
