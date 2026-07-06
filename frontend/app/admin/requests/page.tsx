"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TextAreaField } from "@/components/ui/FormField";
import { InboxIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { formatAbsoluteDate } from "@/lib/dateFormat";
import { useLanguage } from "@/lib/i18n/context";
import { listAllRestaurantRequests, reviewRestaurantRequest } from "@/lib/requests/api";
import type { RequestStatus, RestaurantRequest } from "@/lib/requests/types";

const STATUS_STYLE: Record<RequestStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-secondary/10 text-secondary",
  DENIED: "bg-red-100 text-red-700",
};

export default function AdminRequestsPage() {
  const { token } = useAdminAuth();
  const { locale, t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "">("PENDING");
  const [requests, setRequests] = useState<RestaurantRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<RestaurantRequest | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listAllRestaurantRequests({ status: statusFilter || undefined, pageSize: 50 }, token)
      .then((res) => setRequests(res.items))
      .catch(() => setError(t("adminRequests.loadError")));
  }, [token, statusFilter, t]);

  useEffect(load, [load]);

  return (
    <main className="p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">{t("adminRequests.title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("adminRequests.subtitle")}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: t("adminRequests.allStatuses") },
            { value: "PENDING", label: t("adminRequests.pending") },
            { value: "APPROVED", label: t("adminRequests.approved") },
            { value: "DENIED", label: t("adminRequests.denied") }
          ]}
        />
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : requests === null ? (
        <div className="mt-8">
          <ListSkeleton rows={3} />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState className="mt-8" icon={InboxIcon} title={t("adminRequests.emptyTitle")} />
      ) : (
        <div className="mt-8 space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-ink">{r.owner.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {t("ownerRequests.toArrow", { from: r.currentCount, to: r.requestedCount })}
                  </p>
                  <p className="mt-2 text-sm text-ink">{r.reason}</p>
                  <p className="mt-1 text-xs text-muted">
                    {t("adminRequests.submitted", { date: formatAbsoluteDate(new Date(r.createdAt), locale, t) })}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[r.status]}`}
                >
                  {r.status}
                </span>
              </div>
              {r.reviewNote && (
                <div className="mt-3 rounded-xl bg-bg px-4 py-3 text-sm text-ink">
                  <span className="font-semibold">{t("adminRequests.yourNotePrefix")}</span>
                  {r.reviewNote}
                </div>
              )}
              {r.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => setReviewing(r)}
                  className="mt-3 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white"
                >
                  {t("adminRequests.review")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ReviewModal
        request={reviewing}
        onClose={() => setReviewing(null)}
        token={token}
        onReviewed={(updated) => {
          setReviewing(null);
          // Update in place rather than re-fetching with the same filter —
          // if the admin is viewing "Pending", a re-fetch would make the
          // request they just reviewed vanish with no visible confirmation.
          setRequests((prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? prev);
        }}
      />
    </main>
  );
}

interface ReviewModalProps {
  request: RestaurantRequest | null;
  onClose: () => void;
  token: string | null;
  onReviewed: (updated: RestaurantRequest) => void;
}

function ReviewModal({ request, onClose, token, onReviewed }: ReviewModalProps) {
  const { t } = useLanguage();
  const [decision, setDecision] = useState<"APPROVED" | "DENIED">("APPROVED");
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setDecision("APPROVED");
      setReviewNote("");
      setError(null);
    }
  }, [request]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token || !request) return;
    setError(null);
    setSubmitting(true);
    try {
      const { request: updated } = await reviewRestaurantRequest(
        request.id,
        { status: decision, reviewNote },
        token,
      );
      onReviewed(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={request !== null} onClose={onClose} title={t("adminRequests.modalTitle")}>
      {request && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-ink">
            {t("adminRequests.wantsToGo", {
              name: request.owner.name,
              from: request.currentCount,
              to: request.requestedCount
            })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDecision("APPROVED")}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${
                decision === "APPROVED"
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-border text-ink"
              }`}
            >
              {t("adminRequests.approve")}
            </button>
            <button
              type="button"
              onClick={() => setDecision("DENIED")}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${
                decision === "DENIED" ? "border-red-400 bg-red-50 text-red-700" : "border-border text-ink"
              }`}
            >
              {t("adminRequests.deny")}
            </button>
          </div>
          <TextAreaField
            label={t("adminRequests.reason")}
            required
            rows={3}
            placeholder={t("adminRequests.reasonPlaceholder")}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting
              ? t("common.submitting")
              : decision === "APPROVED"
                ? t("adminRequests.confirmApproval")
                : t("adminRequests.confirmDenial")}
          </button>
        </form>
      )}
    </Modal>
  );
}
