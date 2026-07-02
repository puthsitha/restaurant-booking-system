import { z } from "zod";

export const requestStatusEnum = z.enum(["PENDING", "APPROVED", "DENIED"]);

export const createRestaurantRequestSchema = z.object({
  requestedCount: z.number().int().min(1).max(100),
  reason: z.string().trim().min(1).max(1000),
});
export type CreateRestaurantRequestInput = z.infer<typeof createRestaurantRequestSchema>;

export const reviewRestaurantRequestSchema = z.object({
  status: z.enum(["APPROVED", "DENIED"]),
  reviewNote: z.string().trim().min(1).max(1000),
});
export type ReviewRestaurantRequestInput = z.infer<typeof reviewRestaurantRequestSchema>;

export const listRestaurantRequestsQuerySchema = z.object({
  status: requestStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListRestaurantRequestsQuery = z.infer<typeof listRestaurantRequestsQuerySchema>;
