"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormField, TextField } from "@/components/ui/FormField";
import { ChefHatIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { useLanguage } from "@/lib/i18n/context";
import { fadeUp } from "@/lib/motion";
import type { CreatePaymentMethodInput } from "@/lib/paymentMethods/api";
import { createPaymentMethod, deletePaymentMethod, listPaymentMethods } from "@/lib/paymentMethods/api";
import type { PaymentMethod, PaymentMethodBrand } from "@/lib/paymentMethods/types";
import { unsaveRestaurant } from "@/lib/savedRestaurants/api";
import { useSavedRestaurants } from "@/lib/savedRestaurants/context";
import { listSavedRestaurants } from "@/lib/savedRestaurants/api";
import type { SavedRestaurant } from "@/lib/savedRestaurants/types";

const PRICE_LABEL: Record<string, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" };

export default function ProfilePage() {
  const { user, token, status } = useCustomerAuth();
  const { t } = useLanguage();

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-[900px] px-8 py-12">
        <ListSkeleton rows={4} />
      </main>
    );
  }

  if (status !== "authenticated" || !user || !token) {
    return (
      <main className="mx-auto max-w-[900px] px-8 py-12">
        <EmptyState
          icon={ChefHatIcon}
          title={t("profilePage.signInTitle")}
          message={t("profilePage.signInMessage")}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[900px] px-8 py-12">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <ProfileHeader name={user.name} avatarUrl={user.avatarUrl} contact={user.phone ?? user.email ?? "—"} />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
        <SavedRestaurantsSection token={token} />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
        <PaymentMethodsSection token={token} />
      </motion.div>
    </main>
  );
}

interface ProfileHeaderProps {
  name: string;
  avatarUrl: string | null;
  contact: string;
}

function ProfileHeader({ name, avatarUrl, contact }: ProfileHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-4">
        <Avatar name={name} imageUrl={avatarUrl} size="lg" />
        <div>
          <h1 className="disp text-xl font-extrabold text-ink">{name}</h1>
          <p className="mt-0.5 text-sm text-muted">{contact}</p>
        </div>
      </div>
    </div>
  );
}

function SavedRestaurantsSection({ token }: { token: string }) {
  const { t } = useLanguage();
  const { savedIds } = useSavedRestaurants();
  const [saved, setSaved] = useState<SavedRestaurant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    listSavedRestaurants(token)
      .then((res) => setSaved(res.savedRestaurants))
      .catch(() => setError(t("profilePage.loadSavedError")));
  }, [token, t]);

  useEffect(load, [load]);
  // Refresh whenever a heart is toggled elsewhere on the site.
  useEffect(load, [savedIds, load]);

  return (
    <section className="mt-8">
      <h2 className="disp text-lg font-extrabold text-ink">{t("profilePage.savedRestaurants")}</h2>
      {error ? (
        <ErrorState className="mt-4" message={error} onRetry={load} />
      ) : saved === null ? (
        <div className="mt-4">
          <ListSkeleton rows={2} />
        </div>
      ) : saved.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={ChefHatIcon}
          title={t("profilePage.emptySavedTitle")}
          message={t("profilePage.emptySavedMessage")}
          actionLabel={t("profilePage.browseRestaurants")}
          actionHref="/search"
        />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {saved.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <Link href={`/restaurants/${s.restaurant.slug}`} className="min-w-0">
                <p className="truncate font-bold text-ink">{s.restaurant.name}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {s.restaurant.cuisineType} · {s.restaurant.city} ·{" "}
                  {PRICE_LABEL[s.restaurant.priceRange]}
                </p>
              </Link>
              <button
                type="button"
                onClick={() =>
                  unsaveRestaurant(s.restaurant.id, token).then(() =>
                    setSaved((prev) => prev?.filter((x) => x.id !== s.id) ?? prev),
                  )
                }
                className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-bg"
              >
                {t("profilePage.remove")}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const BRAND_OPTIONS: PaymentMethodBrand[] = ["ABA", "WING", "BAKONG", "ACLEDA"];

function PaymentMethodsSection({ token }: { token: string }) {
  const { t } = useLanguage();
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    setError(null);
    listPaymentMethods(token)
      .then((res) => setMethods(res.paymentMethods))
      .catch(() => setError(t("profilePage.loadPaymentError")));
  }, [token, t]);

  useEffect(load, [load]);

  async function handleDelete(id: string): Promise<void> {
    try {
      await deletePaymentMethod(id, token);
      setMethods((prev) => prev?.filter((m) => m.id !== id) ?? prev);
    } catch {
      setError(t("profilePage.removePaymentError"));
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="disp text-lg font-extrabold text-ink">{t("profilePage.paymentMethods")}</h2>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white"
        >
          {t("profilePage.addShort")}
        </button>
      </div>
      {error ? (
        <ErrorState className="mt-4" message={error} onRetry={load} />
      ) : methods === null ? (
        <div className="mt-4">
          <ListSkeleton rows={2} />
        </div>
      ) : methods.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={ChefHatIcon}
          title={t("profilePage.emptyPaymentTitle")}
          message={t("profilePage.emptyPaymentMessage")}
        />
      ) : (
        <div className="mt-4 space-y-3">
          {methods.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <div>
                <p className="font-bold text-ink">
                  {m.brand} · {m.label}
                  {m.isDefault && (
                    <span className="ml-2 rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-bold text-secondary">
                      {t("profilePage.default")}
                    </span>
                  )}
                </p>
                {m.detail && <p className="mt-0.5 text-sm text-muted">{m.detail}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-bg"
              >
                {t("profilePage.remove")}
              </button>
            </div>
          ))}
        </div>
      )}

      <AddPaymentMethodModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        token={token}
        onCreated={(method) => {
          setShowAdd(false);
          setMethods((prev) => (prev ? [method, ...prev] : [method]));
        }}
      />
    </section>
  );
}

interface AddPaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
  onCreated: (method: PaymentMethod) => void;
}

function AddPaymentMethodModal({ open, onClose, token, onCreated }: AddPaymentMethodModalProps) {
  const { t } = useLanguage();
  const [brand, setBrand] = useState<PaymentMethodBrand>("ABA");
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setBrand("ABA");
      setLabel("");
      setDetail("");
      setIsDefault(false);
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const input: CreatePaymentMethodInput = { brand, label, detail: detail || undefined, isDefault };
      const { paymentMethod } = await createPaymentMethod(input, token);
      onCreated(paymentMethod);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("profilePage.addPaymentMethod")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label={t("profilePage.provider")} htmlFor="pm-brand">
          <Select
            id="pm-brand"
            value={brand}
            onChange={setBrand}
            options={BRAND_OPTIONS.map((b) => ({ value: b, label: b }))}
          />
        </FormField>
        <TextField
          label={t("profilePage.label")}
          required
          placeholder={t("profilePage.labelPlaceholder")}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <TextField
          label={t("profilePage.detailOptional")}
          placeholder={t("profilePage.detailPlaceholder")}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          {t("profilePage.setAsDefault")}
        </label>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? t("profilePage.adding") : t("profilePage.addPaymentMethodButton")}
        </button>
      </form>
    </Modal>
  );
}
