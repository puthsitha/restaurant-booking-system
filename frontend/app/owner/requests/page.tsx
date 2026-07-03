"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TextAreaField, TextField } from "@/components/ui/FormField";
import { InboxIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { createRestaurantRequest, listMyRestaurantRequests } from "@/lib/requests/api";
import type { RequestStatus, RestaurantRequest } from "@/lib/requests/types";

const STATUS_STYLE: Record<RequestStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-secondary/10 text-secondary",
  DENIED: "bg-red-100 text-red-700",
};

export default function OwnerRequestsPage() {
  const { user, token } = useOwnerAuth();
  const [requests, setRequests] = useState<RestaurantRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listMyRestaurantRequests(token)
      .then((res) => setRequests(res.requests))
      .catch(() => setError("Couldn't load your requests."));
  }, [token]);

  useEffect(load, [load]);

  const hasPending = requests?.some((r) => r.status === "PENDING") ?? false;

  return (
    <main className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">Restaurant limit requests</h1>
          <p className="mt-1 text-sm text-muted">
            Currently allowed: {user?.restaurantLimit ?? 0} restaurant
            {(user?.restaurantLimit ?? 0) === 1 ? "" : "s"}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          disabled={hasPending}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {hasPending ? "Request pending review" : "+ Request more restaurants"}
        </button>
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : requests === null ? (
        <div className="mt-8">
          <ListSkeleton rows={2} />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={InboxIcon}
          title="No requests yet"
          message="Need more than your current limit? Ask an admin to raise it."
          actionLabel="+ Request more restaurants"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="mt-8 space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-ink">
                    {r.currentCount} → {r.requestedCount} restaurants
                  </p>
                  <p className="mt-1 text-sm text-ink">{r.reason}</p>
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
                  <span className="font-semibold">Admin note: </span>
                  {r.reviewNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <NewRequestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        currentLimit={user?.restaurantLimit ?? 0}
        token={token}
        onCreated={() => {
          setShowModal(false);
          load();
        }}
      />
    </main>
  );
}

interface NewRequestModalProps {
  open: boolean;
  onClose: () => void;
  currentLimit: number;
  token: string | null;
  onCreated: () => void;
}

function NewRequestModal({ open, onClose, currentLimit, token, onCreated }: NewRequestModalProps) {
  const [requestedCount, setRequestedCount] = useState(currentLimit + 1);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setRequestedCount(currentLimit + 1);
  }, [open, currentLimit]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      await createRestaurantRequest({ requestedCount, reason }, token);
      setReason("");
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Request more restaurants">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="How many restaurants total?"
          type="number"
          min={currentLimit + 1}
          required
          value={requestedCount}
          onChange={(e) => setRequestedCount(Number(e.target.value))}
          hint={`You're currently allowed ${currentLimit}.`}
        />
        <TextAreaField
          label="Reason"
          required
          rows={3}
          placeholder="Tell the admin why you need more restaurants…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </form>
    </Modal>
  );
}
