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
});
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
