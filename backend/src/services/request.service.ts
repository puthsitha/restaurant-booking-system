import type { Prisma, RestaurantRequest } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import type {
  CreateRestaurantRequestInput,
  ReviewRestaurantRequestInput,
  ListRestaurantRequestsQuery,
} from "../schemas/request.schemas";

const requestListInclude = {
  owner: { select: { id: true, name: true, email: true, restaurantLimit: true } },
  reviewedBy: { select: { id: true, name: true } },
} satisfies Prisma.RestaurantRequestInclude;

// ============================ Owner ================================

export async function createRestaurantRequest(
  ownerId: string,
  input: CreateRestaurantRequestInput,
): Promise<RestaurantRequest> {
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) {
    throw new HttpError(404, "Owner not found");
  }

  if (input.requestedCount <= owner.restaurantLimit) {
    throw new HttpError(
      400,
      `You already have a limit of ${owner.restaurantLimit}; request a higher number`,
    );
  }

  const existingPending = await prisma.restaurantRequest.findFirst({
    where: { ownerId, status: "PENDING" },
  });
  if (existingPending) {
    throw new HttpError(409, "You already have a pending request awaiting review");
  }

  const currentCount = await prisma.restaurant.count({ where: { ownerId } });

  return prisma.restaurantRequest.create({
    data: {
      ownerId,
      currentCount,
      requestedCount: input.requestedCount,
      reason: input.reason,
    },
  });
}

export async function listMyRestaurantRequests(ownerId: string) {
  return prisma.restaurantRequest.findMany({
    where: { ownerId },
    include: requestListInclude,
    orderBy: { createdAt: "desc" },
  });
}

// ============================ Admin ================================

export async function listAllRestaurantRequests(query: ListRestaurantRequestsQuery) {
  const where: Prisma.RestaurantRequestWhereInput = {
    ...(query.status ? { status: query.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.restaurantRequest.findMany({
      where,
      include: requestListInclude,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.restaurantRequest.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function reviewRestaurantRequest(
  requestId: string,
  adminId: string,
  input: ReviewRestaurantRequestInput,
): Promise<RestaurantRequest> {
  const request = await prisma.restaurantRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    throw new HttpError(404, "Request not found");
  }
  if (request.status !== "PENDING") {
    throw new HttpError(409, "This request has already been reviewed");
  }

  return prisma.$transaction(async (tx) => {
    if (input.status === "APPROVED") {
      await tx.user.update({
        where: { id: request.ownerId },
        data: { restaurantLimit: request.requestedCount },
      });
    }

    return tx.restaurantRequest.update({
      where: { id: requestId },
      data: {
        status: input.status,
        reviewNote: input.reviewNote,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
      include: requestListInclude,
    });
  });
}
