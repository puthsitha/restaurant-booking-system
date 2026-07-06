"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormField, TextAreaField, TextField } from "@/components/ui/FormField";
import { SearchOffIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import { ListSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { useLanguage } from "@/lib/i18n/context";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { createOwner, updateRestaurantLimit, updateUserStatus, listUsers } from "@/lib/users/api";
import type { ManageableRole, ManagedUser, UserAccountStatus } from "@/lib/users/types";

export default function AdminUsersPage() {
  const { token } = useAdminAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [role, setRole] = useState<ManageableRole | "">("");
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<ManagedUser | null>(null);
  const [limitTarget, setLimitTarget] = useState<ManagedUser | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listUsers({ search: debouncedSearch || undefined, role: role || undefined, pageSize: 50 }, token)
      .then((res) => setUsers(res.items))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t("adminUsers.loadError"));
      });
  }, [token, debouncedSearch, role, t]);

  useEffect(load, [load]);

  return (
    <main className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">{t("adminUsers.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("adminUsers.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          {t("adminUsers.newOwner")}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("adminUsers.searchPlaceholder")}
          className="min-w-[240px] rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        <Select
          value={role}
          onChange={setRole}
          options={[
            { value: "", label: t("adminUsers.allRoles") },
            { value: "DINER", label: t("adminUsers.roleCustomer") },
            { value: "OWNER", label: t("adminUsers.roleOwner") }
          ]}
        />
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : users === null ? (
        <div className="mt-8">
          <ListSkeleton rows={4} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={SearchOffIcon}
          title={t("adminUsers.emptyTitle")}
          actionLabel={t("common.clearFilters")}
          onAction={() => {
            setSearch("");
            setRole("");
          }}
        />
      ) : (
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={u.name} imageUrl={u.avatarUrl} />
                <div>
                  <p className="font-bold text-ink">{u.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {u.role === "OWNER" ? t("adminUsers.roleOwner") : t("adminUsers.roleCustomer")} ·{" "}
                    {u.phone ?? u.email ?? "—"}
                    {u.role === "OWNER" &&
                      ` · ${t("adminUsers.restaurantLimitSuffix", { count: u.restaurantLimit })}`}
                  </p>
                  {u.statusReason && (
                    <p className="mt-1 text-xs text-muted">
                      <span className="font-semibold">{t("adminUsers.reasonPrefix")}</span>
                      {u.statusReason}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge tone={u.status === "ACTIVE" ? "success" : "danger"}>
                  {u.status === "ACTIVE" ? t("adminUsers.statusActive") : t("adminUsers.statusSuspended")}
                </StatusBadge>
                {u.role === "OWNER" && (
                  <button
                    type="button"
                    onClick={() => setLimitTarget(u)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-bg"
                  >
                    {t("adminUsers.editLimit")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStatusTarget(u)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-bg disabled:opacity-50"
                >
                  {u.status === "ACTIVE" ? t("adminUsers.suspend") : t("adminUsers.reactivate")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateOwnerModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        token={token}
        onCreated={() => {
          setShowCreateModal(false);
          load();
        }}
      />

      <StatusModal
        user={statusTarget}
        onClose={() => setStatusTarget(null)}
        token={token}
        onUpdated={(updated) => {
          setStatusTarget(null);
          setUsers((prev) => prev?.map((u) => (u.id === updated.id ? updated : u)) ?? prev);
        }}
      />

      <LimitModal
        user={limitTarget}
        onClose={() => setLimitTarget(null)}
        token={token}
        onUpdated={(updated) => {
          setLimitTarget(null);
          setUsers((prev) => prev?.map((u) => (u.id === updated.id ? updated : u)) ?? prev);
        }}
      />
    </main>
  );
}

interface LimitModalProps {
  user: ManagedUser | null;
  onClose: () => void;
  token: string | null;
  onUpdated: (updated: ManagedUser) => void;
}

function LimitModal({ user, onClose, token, onUpdated }: LimitModalProps) {
  const { t } = useLanguage();
  const [limit, setLimit] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setLimit(user.restaurantLimit);
      setError(null);
    }
  }, [user]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token || !user) return;
    setError(null);
    setSubmitting(true);
    try {
      const { user: updated } = await updateRestaurantLimit(user.id, limit, token);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("adminUsers.limitUpdateError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={user !== null} onClose={onClose} title={t("adminUsers.limitModalTitle")}>
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-ink">
            {t("adminUsers.limitModalBody", { name: user.name })}
          </p>
          <TextField
            label={t("adminUsers.restaurantLimit")}
            type="number"
            min={1}
            max={100}
            required
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? t("common.saving") : t("adminUsers.saveLimit")}
          </button>
        </form>
      )}
    </Modal>
  );
}

interface StatusModalProps {
  user: ManagedUser | null;
  onClose: () => void;
  token: string | null;
  onUpdated: (updated: ManagedUser) => void;
}

function StatusModal({ user, onClose, token, onUpdated }: StatusModalProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setReason("");
      setError(null);
    }
  }, [user]);

  const nextStatus: UserAccountStatus = user?.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  const isSuspending = nextStatus === "SUSPENDED";

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token || !user) return;
    setError(null);
    setSubmitting(true);
    try {
      const { user: updated } = await updateUserStatus(user.id, nextStatus, reason, token);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("adminUsers.statusUpdateError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={user !== null}
      onClose={onClose}
      title={isSuspending ? t("adminUsers.suspendModalTitle") : t("adminUsers.reactivateModalTitle")}
    >
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-ink">
            {isSuspending
              ? t("adminUsers.suspendBody", { name: user.name })
              : t("adminUsers.reactivateBody", { name: user.name })}
          </p>
          <TextAreaField
            label={t("adminUsers.reason")}
            required
            rows={3}
            placeholder={
              isSuspending
                ? t("adminUsers.suspendReasonPlaceholder")
                : t("adminUsers.reactivateReasonPlaceholder")
            }
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
              : isSuspending
                ? t("adminUsers.confirmSuspension")
                : t("adminUsers.confirmReactivation")}
          </button>
        </form>
      )}
    </Modal>
  );
}

interface CreateOwnerModalProps {
  open: boolean;
  onClose: () => void;
  token: string | null;
  onCreated: () => void;
}

function CreateOwnerModal({ open, onClose, token, onCreated }: CreateOwnerModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantLimit, setRestaurantLimit] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setRestaurantLimit(3);
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      await createOwner({ name, email, password, restaurantLimit }, token);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("adminUsers.createModalTitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label={t("adminUsers.fullName")}
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label={t("adminUsers.email")}
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label={t("adminUsers.password")}
          htmlFor="new-owner-password"
          hint={t("adminUsers.passwordHint")}
        >
          <PasswordInput
            id="new-owner-password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
          />
        </FormField>
        <TextField
          label={t("adminUsers.restaurantLimit")}
          type="number"
          min={1}
          required
          value={restaurantLimit}
          onChange={(e) => setRestaurantLimit(Number(e.target.value))}
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? t("common.creating") : t("adminUsers.createOwnerAccount")}
        </button>
      </form>
    </Modal>
  );
}
