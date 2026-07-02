"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TextAreaField } from "@/components/ui/FormField";
import { InboxIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { listAllRestaurantRequests, reviewRestaurantRequest } from "@/lib/requests/api";
import type { RequestStatus, RestaurantRequest } from "@/lib/requests/types";

const STATUS_STYLE: Record<RequestStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-secondary/10 text-secondary",
  DENIED: "bg-red-100 text-red-700",
};

export default function AdminRequestsPage() {
  const { token } = useAdminAuth();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "">("PENDING");
  const [requests, setRequests] = useState<RestaurantRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<RestaurantRequest | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listAllRestaurantRequests({ status: statusFilter || undefined, pageSize: 50 }, token)
      .then((res) => setRequests(res.items))
      .catch(() => setError("Couldn't load requests."));
  }, [token, statusFilter]);

  useEffect(load, [load]);

  return (
    <main style={{ padding: 32 }}>
      <h1 className="disp text-2xl font-extrabold text-ink">Restaurant limit requests</h1>
      <p className="mt-1 text-sm text-muted">Approve or deny an owner&apos;s request for more restaurants.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "")}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="DENIED">Denied</option>
        </select>
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : requests === null ? (
        <div className="mt-8">
          <ListSkeleton rows={3} />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState className="mt-8" icon={InboxIcon} title="No requests match those filters" />
      ) : (
        <div className="mt-8 space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-ink">{r.owner.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {r.currentCount} → {r.requestedCount} restaurants
                  </p>
                  <p className="mt-2 text-sm text-ink">{r.reason}</p>
                  <p className="mt-1 text-xs text-muted">
                    Submitted {new Date(r.createdAt).toLocaleDateString()}
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
                  <span className="font-semibold">Your note: </span>
                  {r.reviewNote}
                </div>
              )}
              {r.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => setReviewing(r)}
                  className="mt-3 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white"
                >
                  Review
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
        onReviewed={() => {
          setReviewing(null);
          load();
        }}
      />
    </main>
  );
}

interface ReviewModalProps {
  request: RestaurantRequest | null;
  onClose: () => void;
  token: string | null;
  onReviewed: () => void;
}

function ReviewModal({ request, onClose, token, onReviewed }: ReviewModalProps) {
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
      await reviewRestaurantRequest(request.id, { status: decision, reviewNote }, token);
      onReviewed();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={request !== null} onClose={onClose} title="Review request">
      {request && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-ink">
            {request.owner.name} wants to go from {request.currentCount} to {request.requestedCount}{" "}
            restaurants.
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
              Approve
            </button>
            <button
              type="button"
              onClick={() => setDecision("DENIED")}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${
                decision === "DENIED" ? "border-red-400 bg-red-50 text-red-700" : "border-border text-ink"
              }`}
            >
              Deny
            </button>
          </div>
          <TextAreaField
            label="Reason"
            required
            rows={3}
            placeholder="Explain your decision to the owner…"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Submitting…" : `Confirm ${decision === "APPROVED" ? "approval" : "denial"}`}
          </button>
        </form>
      )}
    </Modal>
  );
}
