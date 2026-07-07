"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { RatingStars } from "@/components/ui/RatingStars";
import { StarRatingInput } from "@/components/ui/StarRatingInput";
import { formatAbsoluteDate } from "@/lib/dateFormat";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { ApiError } from "@/lib/api";
import { useAuthModal } from "@/lib/auth/authModal";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { createReview, deleteReview, listReviews, updateReview } from "@/lib/reviews/api";
import type { ListReviewsResponse } from "@/lib/reviews/types";
import { useLanguage } from "@/lib/i18n/context";

interface ReviewsSectionProps {
  restaurantId: string;
}

export function ReviewsSection({ restaurantId }: ReviewsSectionProps) {
  const { t, locale } = useLanguage();
  const { token, status, user } = useCustomerAuth();
  const { open: openLogin } = useAuthModal();
  const [data, setData] = useState<ListReviewsResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    listReviews(restaurantId)
      .then(setData)
      .catch(() => setData(null));
  }, [restaurantId]);

  useEffect(load, [load]);

  const myReview = useMemo(
    () => (user ? (data?.items.find((r) => r.userId === user.id) ?? null) : null),
    [data, user],
  );

  function openForm(): void {
    if (status !== "authenticated") {
      openLogin();
      return;
    }
    setError(null);
    setRating(myReview?.rating ?? 5);
    setText(myReview?.text ?? "");
    setShowForm(true);
  }

  async function handleSubmit(): Promise<void> {
    if (status !== "authenticated" || !token) {
      openLogin();
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (myReview) {
        await updateReview(myReview.id, { rating, text: text || undefined }, token);
      } else {
        await createReview(restaurantId, { rating, text: text || undefined }, token);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("reviewsSection.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!myReview || !token) return;
    setDeleting(true);
    try {
      await deleteReview(myReview.id, token);
      setConfirmDelete(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("reviewsSection.deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  if (!data) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="disp text-lg font-bold text-ink">{t("reviewsSection.title")}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (showForm ? setShowForm(false) : openForm())}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-bg"
          >
            {myReview ? t("reviewsSection.editReview") : t("reviewsSection.writeReview")}
          </button>
          {myReview && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
            >
              {t("reviewsSection.delete")}
            </button>
          )}
        </div>
      </div>

      {data.total > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr] sm:items-center">
            <div className="text-center sm:border-r sm:border-border sm:pr-6">
              <p className="disp text-5xl font-extrabold text-accent">{data.average.toFixed(1)}</p>
              <RatingStars rating={data.average} size="md" className="mt-1.5 justify-center" />
              <p className="km mt-1.5 text-xs text-muted">
                {t("reviewsSection.reviewsCount", { count: data.total })}
              </p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = data.countByRating[star] ?? 0;
                const pct = data.total ? Math.round((count / data.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2.5 text-xs font-semibold text-muted">
                    <span className="w-6 shrink-0">{star}★</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
                      <div className="h-full rounded-full bg-[#E8B04B]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <label className="mb-1.5 block text-xs font-bold text-label">{t("reviewsSection.yourRating")}</label>
          <StarRatingInput value={rating} onChange={setRating} size="lg" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={t("reviewsSection.sharePlaceholder")}
            className="mt-3 w-full resize-none rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
          {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {submitting
              ? t("reviewsSection.saving")
              : myReview
                ? t("reviewsSection.saveChanges")
                : t("reviewsSection.submitReview")}
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
            <motion.div
              key={review.id}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start gap-3">
                <Avatar name={review.user.name} imageUrl={review.user.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">
                    {review.user.name}
                    {user && review.userId === user.id && (
                      <span className="ml-2 rounded-full bg-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                        {t("reviewsSection.you")}
                      </span>
                    )}
                  </p>
                  <p className="km mt-0.5 text-xs text-muted">
                    {formatAbsoluteDate(new Date(review.createdAt), locale, t)}
                  </p>
                </div>
                <RatingStars rating={review.rating} className="shrink-0" />
              </div>
              {review.text && <p className="mt-3 text-sm leading-relaxed text-ink">{review.text}</p>}
              {review.ownerReply && (
                <div className="mt-3 rounded-xl border-l-[3px] border-accent bg-bg py-3 pl-3.5 pr-4">
                  <p className="km text-xs font-bold text-accent">↳ {t("reviewsSection.ownerReply")}</p>
                  <p className="km mt-1 text-sm text-ink">{review.ownerReply}</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t("reviewsSection.deleteModalTitle")}
      >
        <div>
          <p className="text-sm text-ink">{t("reviewsSection.cantUndo")}</p>
          {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-ink"
            >
              {t("reviewsSection.keepReview")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {deleting ? t("reviewsSection.deleting") : t("reviewsSection.deleteReview")}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
