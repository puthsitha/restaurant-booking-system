import { apiFetch } from "@/lib/api";
import type { ListReviewsResponse, Review } from "@/lib/reviews/types";

export function listReviews(restaurantId: string): Promise<ListReviewsResponse> {
  return apiFetch(`/api/restaurants/${restaurantId}/reviews`);
}

export interface CreateReviewInput {
  rating: number;
  text?: string;
}

export function createReview(
  restaurantId: string,
  input: CreateReviewInput,
  token: string,
): Promise<{ review: Review }> {
  return apiFetch(`/api/restaurants/${restaurantId}/reviews`, {
    method: "POST",
    body: input,
    token,
  });
}

export function updateReview(
  reviewId: string,
  input: CreateReviewInput,
  token: string,
): Promise<{ review: Review }> {
  return apiFetch(`/api/reviews/${reviewId}`, {
    method: "PATCH",
    body: input,
    token,
  });
}

export function deleteReview(reviewId: string, token: string): Promise<void> {
  return apiFetch(`/api/reviews/${reviewId}`, { method: "DELETE", token });
}

export function replyToReview(
  reviewId: string,
  reply: string,
  token: string,
): Promise<{ review: Review }> {
  return apiFetch(`/api/reviews/${reviewId}/reply`, {
    method: "PATCH",
    body: { reply },
    token,
  });
}
