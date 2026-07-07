import type { City } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { localizeTag, type Locale } from "../lib/locale";
import type { CreateCityInput, UpdateCityInput } from "../schemas/city.schemas";

export async function listCities(locale: Locale): Promise<City[]> {
  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });
  return cities.map((city) => localizeTag(city, locale));
}

export async function createCity(input: CreateCityInput): Promise<City> {
  const existing = await prisma.city.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new HttpError(409, `City "${input.name}" already exists`);
  }
  return prisma.city.create({ data: input });
}

export async function updateCity(id: string, input: UpdateCityInput): Promise<City> {
  const city = await prisma.city.findUnique({ where: { id } });
  if (!city) {
    throw new HttpError(404, "City not found");
  }
  if (input.name && input.name !== city.name) {
    const existing = await prisma.city.findUnique({ where: { name: input.name } });
    if (existing) {
      throw new HttpError(409, `City "${input.name}" already exists`);
    }
  }
  return prisma.city.update({ where: { id }, data: input });
}

export async function deleteCity(id: string): Promise<void> {
  const city = await prisma.city.findUnique({ where: { id } });
  if (!city) {
    throw new HttpError(404, "City not found");
  }
  const restaurantCount = await prisma.restaurant.count({ where: { cityId: id } });
  if (restaurantCount > 0) {
    throw new HttpError(409, "City is still assigned to one or more restaurants");
  }
  await prisma.city.delete({ where: { id } });
}
