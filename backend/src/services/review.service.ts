import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import type {
  CreateReviewInput,
  ReplyToReviewInput,
  UpdateReviewInput,
} from "../schemas/review.schemas";

const reviewSelect = {
  id: true,
  restaurantId: true,
  userId: true,
  user: { select: { id: true, name: true, avatarUrl: true } },
  rating: true,
  text: true,
  ownerReply: true,
  repliedAt: true,
  createdAt: true,
};

export async function listReviews(restaurantId: string) {
  const [reviews, distribution] = await Promise.all([
    prisma.review.findMany({
      where: { restaurantId },
      select: reviewSelect,
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { restaurantId },
      _count: { rating: true },
    }),
  ]);

  const countByRating: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of distribution) {
    countByRating[row.rating] = row._count.rating;
  }
  const total = reviews.length;
  const average = total === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  return { items: reviews, total, average, countByRating };
}

export async function createReview(
  userId: string,
  restaurantId: string,
  input: CreateReviewInput,
) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant || restaurant.status !== "ACTIVE") {
    throw new HttpError(404, "Restaurant not found");
  }

  const existing = await prisma.review.findFirst({ where: { restaurantId, userId } });
  if (existing) {
    throw new HttpError(409, "You've already reviewed this restaurant");
  }

  return prisma.review.create({
    data: { restaurantId, userId, rating: input.rating, text: input.text },
    select: reviewSelect,
  });
}

async function getOwnReviewOrThrow(userId: string, reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.userId !== userId) {
    throw new HttpError(404, "Review not found");
  }
  return review;
}

export async function updateReview(userId: string, reviewId: string, input: UpdateReviewInput) {
  await getOwnReviewOrThrow(userId, reviewId);
  return prisma.review.update({
    where: { id: reviewId },
    data: { rating: input.rating, text: input.text },
    select: reviewSelect,
  });
}

export async function deleteReview(userId: string, reviewId: string): Promise<void> {
  await getOwnReviewOrThrow(userId, reviewId);
  await prisma.review.delete({ where: { id: reviewId } });
}

export async function replyToReview(
  ownerId: string,
  reviewId: string,
  input: ReplyToReviewInput,
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { restaurant: { select: { ownerId: true } } },
  });
  if (!review || review.restaurant.ownerId !== ownerId) {
    throw new HttpError(404, "Review not found");
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: { ownerReply: input.reply, repliedAt: new Date() },
    select: reviewSelect,
  });
}
