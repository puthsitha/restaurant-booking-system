import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { hashPassword } from "../lib/password";
import type {
  CreateOwnerInput,
  ListUsersQuery,
  UpdateRestaurantLimitInput,
  UpdateUserStatusInput,
} from "../schemas/user.schemas";

// Admins manage diners and owners only; other admin accounts never appear
// here or become editable through this endpoint.
const userListSelect = {
  id: true,
  role: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  status: true,
  statusReason: true,
  restaurantLimit: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export async function listUsers(query: ListUsersQuery) {
  const where: Prisma.UserWhereInput = {
    role: query.role ? query.role : { in: ["DINER", "OWNER"] },
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { phone: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userListSelect,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function createOwner(input: CreateOwnerInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "OWNER",
      restaurantLimit: input.restaurantLimit,
    },
    select: userListSelect,
  });
}

export async function updateUserStatus(userId: string, input: UpdateUserStatusInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN") {
    throw new HttpError(404, "User not found");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status: input.status, statusReason: input.reason },
    select: userListSelect,
  });
}

export async function updateRestaurantLimit(userId: string, input: UpdateRestaurantLimitInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "OWNER") {
    throw new HttpError(404, "Owner not found");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { restaurantLimit: input.restaurantLimit },
    select: userListSelect,
  });
}
