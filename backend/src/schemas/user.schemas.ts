import { z } from "zod";

export const manageableRoleEnum = z.enum(["DINER", "OWNER"]);
export const userStatusEnum = z.enum(["ACTIVE", "SUSPENDED"]);

export const listUsersQuerySchema = z.object({
  role: manageableRoleEnum.optional(),
  search: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const updateUserStatusSchema = z.object({
  status: userStatusEnum,
  reason: z.string().trim().min(1).max(500),
});
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

// Owners can no longer self-register; an admin provisions the account here
// instead (see user.service.ts createOwner).
export const createOwnerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  restaurantLimit: z.number().int().min(1).max(100).default(3),
});
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
