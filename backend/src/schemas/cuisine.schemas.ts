import { z } from "zod";

export const createCuisineSchema = z.object({
  name: z.string().trim().min(1).max(60),
  nameKm: z.string().trim().max(60).optional(),
  description: z.string().trim().max(500).optional(),
  descriptionKm: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().url().optional(),
});
export type CreateCuisineInput = z.infer<typeof createCuisineSchema>;

export const updateCuisineSchema = createCuisineSchema.partial();
export type UpdateCuisineInput = z.infer<typeof updateCuisineSchema>;
