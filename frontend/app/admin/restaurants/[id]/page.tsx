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
import { useLanguage } from "@/lib/i18n/context";
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
  const { t } = useLanguage();
  const [restaurant, setRestaurant] = useState<RestaurantManagementDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<RestaurantStatus | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const res = await getRestaurant(params.id, token);
      setRestaurant(res.restaurant);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("adminRestaurantDetail.loadError"));
    }
  }, [params.id, token, t]);

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
        <LoadingSpinner label={t("adminRestaurantDetail.loadingLabel")} size="lg" />
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
          <span className="font-bold">{t("adminRestaurantDetail.latestAdminNotePrefix")}</span>
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
              {t("adminRestaurantDetail.approveRestaurant")}
            </button>
            <button
              onClick={() => setStatusAction("DISABLED")}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-bg"
            >
              {t("adminRestaurantDetail.rejectRestaurant")}
            </button>
          </>
        ) : (
          <button
            onClick={() => setStatusAction(restaurant.status === "ACTIVE" ? "DISABLED" : "ACTIVE")}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white"
          >
            {restaurant.status === "ACTIVE"
              ? t("adminRestaurantDetail.disableRestaurant")
              : t("adminRestaurantDetail.reactivateRestaurant")}
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">{t("adminRestaurantDetail.ownerSection")}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label={t("adminRestaurantDetail.name")} value={restaurant.owner.name} />
            <Row label={t("adminRestaurantDetail.email")} value={restaurant.owner.email ?? "—"} />
            <Row label={t("adminRestaurantDetail.phone")} value={restaurant.owner.phone ?? "—"} />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">
            {t("adminRestaurantDetail.contactLocation")}
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label={t("adminRestaurantDetail.phone")} value={restaurant.phone ?? "—"} />
            <Row label={t("adminRestaurantDetail.email")} value={restaurant.email ?? "—"} />
            <Row label={t("adminRestaurantDetail.website")} value={restaurant.website ?? "—"} />
            <Row
              label={t("adminRestaurantDetail.address")}
              value={`${restaurant.address}, ${restaurant.city}`}
            />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 md:col-span-2">
          <h2 className="disp text-sm font-bold text-ink">{t("adminRestaurantDetail.description")}</h2>
          <p className="mt-2 text-sm text-muted">
            {restaurant.description || t("adminRestaurantDetail.noDescription")}
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">{t("adminRestaurantDetail.bookingPolicy")}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row
              label={t("adminRestaurantDetail.minBookingNotice")}
              value={`${restaurant.minBookingNotice} min`}
            />
            <Row
              label={t("adminRestaurantDetail.maxBookingDays")}
              value={`${restaurant.maxBookingDays} days`}
            />
            <Row
              label={t("adminRestaurantDetail.cancellationWindow")}
              value={`${restaurant.cancellationHours} hrs`}
            />
            <Row
              label={t("adminRestaurantDetail.depositLabel")}
              value={
                restaurant.depositRequired
                  ? money(restaurant.depositAmount)
                  : t("adminRestaurantDetail.notRequired")
              }
            />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">
            {t("adminRestaurantDetail.capacityAmenities")}
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row
              label={t("adminRestaurantDetail.capacity")}
              value={`${restaurant.minCapacity}–${restaurant.maxCapacity} guests`}
            />
            <Row
              label={t("adminRestaurantDetail.parking")}
              value={
                restaurant.parkingAvailable
                  ? t("adminRestaurantDetail.available")
                  : t("adminRestaurantDetail.notAvailable")
              }
            />
            <Row label={t("adminRestaurantDetail.dressCode")} value={restaurant.dressCode ?? "—"} />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">{t("adminRestaurantDetail.contentSection")}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label={t("adminRestaurantDetail.menus")} value={String(restaurant.menus.length)} />
            <Row label={t("adminRestaurantDetail.tables")} value={String(restaurant.tables.length)} />
            <Row
              label={t("adminRestaurantDetail.galleryImages")}
              value={String(restaurant.galleryImages.length)}
            />
            <Row
              label={t("adminRestaurantDetail.hoursSet")}
              value={String(restaurant.operatingHours.length)}
            />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">{t("adminRestaurantDetail.tagsSection")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {restaurant.tags.length === 0 ? (
              <p className="text-sm text-muted">{t("adminRestaurantDetail.noTags")}</p>
            ) : (
              restaurant.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-bg px-3 py-1 text-xs font-semibold text-ink"
                >
                  {tag.name}
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
  const { t } = useLanguage();
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
      ? t("adminRestaurantDetail.approveRestaurant")
      : t("adminRestaurantDetail.rejectRestaurant")
    : isApprove
      ? t("adminRestaurantDetail.reactivateRestaurant")
      : t("adminRestaurantDetail.disableRestaurant");

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
      setError(err instanceof ApiError ? err.message : t("adminRestaurantDetail.updateError"));
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
                ? t("adminRestaurantDetail.becomeActive", { name: restaurant.name })
                : t("adminRestaurantDetail.stayHidden", { name: restaurant.name })
              : isApprove
                ? t("adminRestaurantDetail.becomeActiveAgain", { name: restaurant.name })
                : t("adminRestaurantDetail.hiddenImmediately", { name: restaurant.name })}
          </p>
          <TextAreaField
            label={t("adminRestaurantDetail.reason")}
            required
            rows={3}
            placeholder={t("adminRestaurantDetail.reasonPlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting
              ? t("common.saving")
              : t("adminRestaurantDetail.confirmAction", { action: title.toLowerCase() })}
          </button>
        </form>
      )}
    </Modal>
  );
}
