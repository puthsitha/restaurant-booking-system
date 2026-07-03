"use client";

import { useCallback, useEffect, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyPlateIcon } from "@/components/ui/icons";
import { RatingStars } from "@/components/ui/RatingStars";
import { ApiError } from "@/lib/api";
import { listReviews, replyToReview } from "@/lib/reviews/api";
import type { ListReviewsResponse } from "@/lib/reviews/types";

import type { ManageTabProps } from "./types";

export function ReviewsTab({ restaurant, token }: ManageTabProps) {
  const [data, setData] = useState<ListReviewsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    listReviews(restaurant.id)
      .then(setData)
      .catch(() => setError("Couldn't load reviews."));
  }, [restaurant.id]);

  useEffect(load, [load]);

  async function handleReply(reviewId: string): Promise<void> {
    const reply = replyDrafts[reviewId]?.trim();
    if (!reply) return;
    setSubmittingId(reviewId);
    try {
      await replyToReview(reviewId, reply, token);
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your reply.");
    } finally {
      setSubmittingId(null);
    }
  }

  if (!data) return null;

  return (
    <div className="max-w-2xl">
      {data.total > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
          <div className="text-center">
            <p className="disp text-3xl font-extrabold text-ink">{data.average.toFixed(1)}</p>
            <RatingStars rating={data.average} size="md" className="mt-1 justify-center" />
          </div>
          <p className="text-sm text-muted">Based on {data.total} reviews</p>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {data.items.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={EmptyPlateIcon}
          title="No reviews yet"
          message="Reviews from diners will show up here once they start booking."
          compact
        />
      ) : (
        <div className="mt-6 space-y-4">
          {data.items.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <Avatar name={review.user.name} imageUrl={review.user.avatarUrl} size="sm" />
                <div>
                  <p className="text-sm font-bold text-ink">{review.user.name}</p>
                  <RatingStars rating={review.rating} />
                </div>
              </div>
              {review.text && <p className="mt-2 text-sm text-ink">{review.text}</p>}

              {review.ownerReply ? (
                <div className="mt-3 rounded-xl bg-bg px-4 py-3 text-sm text-ink">
                  <span className="font-semibold">Your reply: </span>
                  {review.ownerReply}
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <input
                    value={replyDrafts[review.id] ?? ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))
                    }
                    placeholder="Reply to this review…"
                    className="flex-1 rounded-xl border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                  />
                  <button
                    type="button"
                    onClick={() => handleReply(review.id)}
                    disabled={submittingId === review.id || !replyDrafts[review.id]?.trim()}
                    className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
