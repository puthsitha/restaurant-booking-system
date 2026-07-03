"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { TextAreaField } from "@/components/ui/FormField";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { getRestaurant, updateRestaurantStatus } from "@/lib/restaurants/api";
import type { RestaurantManagementDetail, RestaurantStatus } from "@/lib/restaurants/types";
import { theme } from "@/lib/theme";

const STATUS_TONE: Record<RestaurantStatus, StatusTone> = {
  PENDING: "pending",
  ACTIVE: "success",
  DISABLED: "danger",
};

const PRICE_LABEL: Record<string, string> = {
  LOW: "$",
  MEDIUM: "$$",
  HIGH: "$$$",
};

function money(amount: string): string {
  const usd = Number(amount);
  return `$${usd.toFixed(2)} · ៛${Math.round(usd * theme.currency.usdToKhrRate).toLocaleString()}`;
}

// Moderation view: admins can inspect a restaurant and approve/reject/
// suspend/reactivate it (always with a reason), but editing profile/hours/
// menu/etc. stays owner-only by design.
export default function AdminRestaurantDetailPage({ params }: { params: { id: string } }) {
  const { token } = useAdminAuth();
  const [restaurant, setRestaurant] = useState<RestaurantManagementDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<RestaurantStatus | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const res = await getRestaurant(params.id, token);
      setRestaurant(res.restaurant);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load this restaurant.");
    }
  }, [params.id, token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (error) {
    return (
      <main className="p-8">
        <ErrorState message={error} onRetry={reload} />
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="p-8">
        <LoadingSpinner label="Pulling up the file…" size="lg" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[960px] p-8">
      <div
        className="overflow-hidden rounded-2xl border border-border bg-surface"
        style={{
          backgroundImage: restaurant.coverImageUrl ? `url(${restaurant.coverImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-gradient-to-t from-black/70 via-black/20 to-transparent px-6 py-10">
          <StatusBadge tone={STATUS_TONE[restaurant.status]}>{restaurant.status}</StatusBadge>
          <h1 className="disp mt-3 text-3xl font-extrabold text-white">{restaurant.name}</h1>
          <p className="mt-1 text-sm font-semibold text-white/85">
            {restaurant.cuisineType} · {PRICE_LABEL[restaurant.priceRange]} · {restaurant.address},{" "}
            {restaurant.city}
            {restaurant.state ? `, ${restaurant.state}` : ""}, {restaurant.country}
          </p>
        </div>
      </div>

      {restaurant.statusReason && (
        <div className="mt-4 rounded-2xl border border-border bg-bg p-4 text-sm text-ink">
          <span className="font-bold">Latest admin note: </span>
          {restaurant.statusReason}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {restaurant.status === "PENDING" ? (
          <>
            <button
              onClick={() => setStatusAction("ACTIVE")}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white"
            >
              Approve restaurant
            </button>
            <button
              onClick={() => setStatusAction("DISABLED")}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-bg"
            >
              Reject restaurant
            </button>
          </>
        ) : (
          <button
            onClick={() => setStatusAction(restaurant.status === "ACTIVE" ? "DISABLED" : "ACTIVE")}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white"
          >
            {restaurant.status === "ACTIVE" ? "Disable restaurant" : "Reactivate restaurant"}
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">Owner</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Name" value={restaurant.owner.name} />
            <Row label="Email" value={restaurant.owner.email ?? "—"} />
            <Row label="Phone" value={restaurant.owner.phone ?? "—"} />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">Contact & location</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Phone" value={restaurant.phone ?? "—"} />
            <Row label="Email" value={restaurant.email ?? "—"} />
            <Row label="Website" value={restaurant.website ?? "—"} />
            <Row label="Address" value={`${restaurant.address}, ${restaurant.city}`} />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 md:col-span-2">
          <h2 className="disp text-sm font-bold text-ink">Description</h2>
          <p className="mt-2 text-sm text-muted">
            {restaurant.description || "No description provided."}
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">Booking policy</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Min booking notice" value={`${restaurant.minBookingNotice} min`} />
            <Row label="Max booking days ahead" value={`${restaurant.maxBookingDays} days`} />
            <Row label="Cancellation window" value={`${restaurant.cancellationHours} hrs`} />
            <Row
              label="Deposit"
              value={restaurant.depositRequired ? money(restaurant.depositAmount) : "Not required"}
            />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">Capacity & amenities</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Capacity" value={`${restaurant.minCapacity}–${restaurant.maxCapacity} guests`} />
            <Row label="Parking" value={restaurant.parkingAvailable ? "Available" : "Not available"} />
            <Row label="Dress code" value={restaurant.dressCode ?? "—"} />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">Content</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Menus" value={String(restaurant.menus.length)} />
            <Row label="Tables" value={String(restaurant.tables.length)} />
            <Row label="Gallery images" value={String(restaurant.galleryImages.length)} />
            <Row label="Operating hours set" value={String(restaurant.operatingHours.length)} />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {restaurant.tags.length === 0 ? (
              <p className="text-sm text-muted">No tags.</p>
            ) : (
              restaurant.tags.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-bg px-3 py-1 text-xs font-semibold text-ink"
                >
                  {t.name}
                </span>
              ))
            )}
          </div>
        </section>
      </div>

      <StatusModal
        restaurant={restaurant}
        nextStatus={statusAction}
        onClose={() => setStatusAction(null)}
        token={token}
        onUpdated={(updated) => {
          setStatusAction(null);
          setRestaurant({ ...restaurant, status: updated.status, statusReason: updated.statusReason });
        }}
      />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

interface StatusModalProps {
  restaurant: RestaurantManagementDetail;
  nextStatus: RestaurantStatus | null;
  onClose: () => void;
  token: string | null;
  onUpdated: (updated: { status: RestaurantStatus; statusReason: string | null }) => void;
}

function StatusModal({ restaurant, nextStatus, onClose, token, onUpdated }: StatusModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (nextStatus) {
      setReason("");
      setError(null);
    }
  }, [nextStatus]);

  const isPendingReview = restaurant.status === "PENDING";
  const isApprove = nextStatus === "ACTIVE";

  const title = isPendingReview
    ? isApprove
      ? "Approve restaurant"
      : "Reject restaurant"
    : isApprove
      ? "Reactivate restaurant"
      : "Disable restaurant";

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token || !nextStatus) return;
    setError(null);
    setSubmitting(true);
    try {
      const { restaurant: updated } = await updateRestaurantStatus(
        restaurant.id,
        nextStatus,
        reason,
        token,
      );
      onUpdated({ status: updated.status, statusReason: updated.statusReason });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update this restaurant.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={nextStatus !== null} onClose={onClose} title={title}>
      {nextStatus && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-ink">
            {isPendingReview
              ? isApprove
                ? `${restaurant.name} will become active and visible to diners.`
                : `${restaurant.name} will stay hidden from diners until re-submitted and approved.`
              : isApprove
                ? `${restaurant.name} will become active and visible to diners again.`
                : `${restaurant.name} will be hidden from diners immediately.`}
          </p>
          <TextAreaField
            label="Reason"
            required
            rows={3}
            placeholder="Explain the reason for this decision — the owner will see it…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Saving…" : `Confirm ${title.toLowerCase()}`}
          </button>
        </form>
      )}
    </Modal>
  );
}
