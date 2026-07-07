import { z } from "zod";

export const createCitySchema = z.object({
  name: z.string().trim().min(1).max(80),
  nameKm: z.string().trim().max(80).optional(),
  imageUrl: z.string().trim().url().optional(),
});
export type CreateCityInput = z.infer<typeof createCitySchema>;

export const updateCitySchema = createCitySchema.partial();
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
