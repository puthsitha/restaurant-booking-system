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
import { formatAbsoluteDate } from "@/lib/dateFormat";
import { useLanguage } from "@/lib/i18n/context";
import { createRestaurantRequest, listMyRestaurantRequests } from "@/lib/requests/api";
import type { RequestStatus, RestaurantRequest } from "@/lib/requests/types";

const STATUS_STYLE: Record<RequestStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-secondary/10 text-secondary",
  DENIED: "bg-red-100 text-red-700",
};

export default function OwnerRequestsPage() {
  const { user, token } = useOwnerAuth();
  const { locale, t } = useLanguage();
  const [requests, setRequests] = useState<RestaurantRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listMyRestaurantRequests(token)
      .then((res) => setRequests(res.requests))
      .catch(() => setError(t("ownerRequests.loadError")));
  }, [token, t]);

  useEffect(load, [load]);

  const hasPending = requests?.some((r) => r.status === "PENDING") ?? false;

  return (
    <main className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">{t("ownerRequests.title")}</h1>
          <p className="mt-1 text-sm text-muted">
            {t("ownerRequests.currentlyAllowed", { count: user?.restaurantLimit ?? 0 })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          disabled={hasPending}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {hasPending ? t("ownerRequests.requestPending") : t("ownerRequests.requestMore")}
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
          title={t("ownerRequests.emptyTitle")}
          message={t("ownerRequests.emptyMessage")}
          actionLabel={t("ownerRequests.requestMore")}
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="mt-8 space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-ink">
                    {t("ownerRequests.toArrow", { from: r.currentCount, to: r.requestedCount })}
                  </p>
                  <p className="mt-1 text-sm text-ink">{r.reason}</p>
                  <p className="mt-1 text-xs text-muted">
                    {t("ownerRequests.submitted", { date: formatAbsoluteDate(new Date(r.createdAt), locale, t) })}
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
                  <span className="font-semibold">{t("ownerRequests.adminNotePrefix")}</span>
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
  const { t } = useLanguage();
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
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("ownerRequests.modalTitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label={t("ownerRequests.howMany")}
          type="number"
          min={currentLimit + 1}
          required
          value={requestedCount}
          onChange={(e) => setRequestedCount(Number(e.target.value))}
          hint={t("ownerRequests.currentlyAllowedHint", { count: currentLimit })}
        />
        <TextAreaField
          label={t("ownerRequests.reason")}
          required
          rows={3}
          placeholder={t("ownerRequests.reasonPlaceholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? t("common.submitting") : t("ownerRequests.submitRequest")}
        </button>
      </form>
    </Modal>
  );
}
