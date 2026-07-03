import { z } from "zod";

export const saveRestaurantSchema = z.object({
  restaurantId: z.string().min(1),
});
export type SaveRestaurantInput = z.infer<typeof saveRestaurantSchema>;
