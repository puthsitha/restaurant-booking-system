"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { ApiError } from "@/lib/api";
import { useAuthModal } from "@/lib/auth/authModal";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { createReview, listReviews } from "@/lib/reviews/api";
import type { ListReviewsResponse } from "@/lib/reviews/types";

interface ReviewsSectionProps {
  restaurantId: string;
}

export function ReviewsSection({ restaurantId }: ReviewsSectionProps) {
  const { token, status } = useCustomerAuth();
  const { open: openLogin } = useAuthModal();
  const [data, setData] = useState<ListReviewsResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    listReviews(restaurantId)
      .then(setData)
      .catch(() => setData(null));
  }, [restaurantId]);

  useEffect(load, [load]);

  async function handleSubmit(): Promise<void> {
    if (status !== "authenticated" || !token) {
      openLogin();
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createReview(restaurantId, { rating, text: text || undefined }, token);
      setShowForm(false);
      setText("");
      setRating(5);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="disp text-lg font-bold text-ink">Reviews</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-bg"
        >
          Write a review
        </button>
      </div>

      {data.total > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="text-center">
            <p className="disp text-3xl font-extrabold text-ink">{data.average.toFixed(1)}</p>
            <RatingStars rating={data.average} size="md" className="mt-1 justify-center" />
            <p className="mt-1 text-xs text-muted">{data.total} reviews</p>
          </div>
          <div className="min-w-[180px] flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.countByRating[star] ?? 0;
              const pct = data.total ? Math.round((count / data.total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-muted">
                  <span className="w-3">{star}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
                    <div className="h-full rounded-full bg-[#E8B04B]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <label className="mb-1.5 block text-xs font-bold text-label">Your rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="text-xl"
                style={{ color: n <= rating ? "#E8B04B" : "#D8CCBF" }}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Share your experience…"
            className="mt-3 w-full resize-none rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
          {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </div>
      )}

      {data.items.length > 0 && (
        <motion.div
          className="mt-6 space-y-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {data.items.map((review) => (
            <motion.div key={review.id} variants={fadeUp} className="border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Avatar name={review.user.name} imageUrl={review.user.avatarUrl} size="sm" />
                <div>
                  <p className="text-sm font-bold text-ink">{review.user.name}</p>
                  <RatingStars rating={review.rating} />
                </div>
              </div>
              {review.text && <p className="mt-2 text-sm text-ink">{review.text}</p>}
              {review.ownerReply && (
                <div className="mt-2 rounded-xl bg-bg px-4 py-3 text-sm text-ink">
                  <span className="font-semibold">Owner reply: </span>
                  {review.ownerReply}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
