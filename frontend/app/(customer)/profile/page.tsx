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
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
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
  const { user, token, status, updateProfile } = useCustomerAuth();

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
          title="Sign in to see your profile"
          message="Log in from the header to manage saved restaurants and payment methods."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[900px] px-8 py-12">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <ProfileHeader
          name={user.name}
          avatarUrl={user.avatarUrl}
          contact={user.phone ?? user.email ?? "—"}
          preferredLocale={user.preferredLocale === "en" ? "en" : "km"}
          onChangeLocale={(locale) => updateProfile({ preferredLocale: locale })}
        />
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
  preferredLocale: "km" | "en";
  onChangeLocale: (locale: "km" | "en") => void;
}

function ProfileHeader({ name, avatarUrl, contact, preferredLocale, onChangeLocale }: ProfileHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-4">
        <Avatar name={name} imageUrl={avatarUrl} size="lg" />
        <div>
          <h1 className="disp text-xl font-extrabold text-ink">{name}</h1>
          <p className="mt-0.5 text-sm text-muted">{contact}</p>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-label">Language</p>
        <SegmentedControl
          value={preferredLocale}
          onChange={onChangeLocale}
          options={[
            { value: "km", label: "ខ្មែរ" },
            { value: "en", label: "English" },
          ]}
        />
      </div>
    </div>
  );
}

function SavedRestaurantsSection({ token }: { token: string }) {
  const { savedIds } = useSavedRestaurants();
  const [saved, setSaved] = useState<SavedRestaurant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    listSavedRestaurants(token)
      .then((res) => setSaved(res.savedRestaurants))
      .catch(() => setError("Couldn't load saved restaurants."));
  }, [token]);

  useEffect(load, [load]);
  // Refresh whenever a heart is toggled elsewhere on the site.
  useEffect(load, [savedIds, load]);

  return (
    <section className="mt-8">
      <h2 className="disp text-lg font-extrabold text-ink">Saved restaurants</h2>
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
          title="No saved restaurants yet"
          message="Tap the heart on a restaurant to save it here."
          actionLabel="Browse restaurants"
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
                Remove
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
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    setError(null);
    listPaymentMethods(token)
      .then((res) => setMethods(res.paymentMethods))
      .catch(() => setError("Couldn't load payment methods."));
  }, [token]);

  useEffect(load, [load]);

  async function handleDelete(id: string): Promise<void> {
    try {
      await deletePaymentMethod(id, token);
      setMethods((prev) => prev?.filter((m) => m.id !== id) ?? prev);
    } catch {
      setError("Couldn't remove this payment method.");
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="disp text-lg font-extrabold text-ink">Payment methods</h2>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white"
        >
          + Add
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
          title="No payment methods saved"
          message="Add a mobile payment account to check out faster."
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
                      Default
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
                Remove
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
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a payment method">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Provider" htmlFor="pm-brand">
          <select
            id="pm-brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value as PaymentMethodBrand)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            {BRAND_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </FormField>
        <TextField
          label="Label"
          required
          placeholder="e.g. Personal ABA"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <TextField
          label="Detail (optional)"
          placeholder="Account number or note"
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
          Set as default
        </label>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add payment method"}
        </button>
      </form>
    </Modal>
  );
}
