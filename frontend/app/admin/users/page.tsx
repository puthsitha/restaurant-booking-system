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
import { ListSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { createOwner, updateRestaurantLimit, updateUserStatus, listUsers } from "@/lib/users/api";
import type { ManageableRole, ManagedUser, UserAccountStatus } from "@/lib/users/types";

export default function AdminUsersPage() {
  const { token } = useAdminAuth();
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
        setError(err instanceof ApiError ? err.message : "Couldn't load users.");
      });
  }, [token, debouncedSearch, role]);

  useEffect(load, [load]);

  return (
    <main className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">Users</h1>
          <p className="mt-1 text-sm text-muted">Diners and restaurant owners on the platform.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          + New owner
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone"
          className="min-w-[240px] rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as ManageableRole | "")}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none"
        >
          <option value="">All roles</option>
          <option value="DINER">Customer</option>
          <option value="OWNER">Owner</option>
        </select>
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
          title="No users match those filters"
          actionLabel="Clear filters"
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
                    {u.role === "OWNER" ? "Owner" : "Customer"} · {u.phone ?? u.email ?? "—"}
                    {u.role === "OWNER" && ` · ${u.restaurantLimit} restaurant limit`}
                  </p>
                  {u.statusReason && (
                    <p className="mt-1 text-xs text-muted">
                      <span className="font-semibold">Reason: </span>
                      {u.statusReason}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge tone={u.status === "ACTIVE" ? "success" : "danger"}>
                  {u.status}
                </StatusBadge>
                {u.role === "OWNER" && (
                  <button
                    type="button"
                    onClick={() => setLimitTarget(u)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-bg"
                  >
                    Edit limit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStatusTarget(u)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-bg disabled:opacity-50"
                >
                  {u.status === "ACTIVE" ? "Suspend" : "Reactivate"}
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
      setError(err instanceof ApiError ? err.message : "Couldn't update the restaurant limit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={user !== null} onClose={onClose} title="Edit restaurant limit">
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-ink">
            How many restaurants can {user.name} create and manage?
          </p>
          <TextField
            label="Restaurant limit"
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
            {submitting ? "Saving…" : "Save limit"}
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
      setError(err instanceof ApiError ? err.message : "Couldn't update this account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={user !== null} onClose={onClose} title={isSuspending ? "Suspend account" : "Reactivate account"}>
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-ink">
            {isSuspending
              ? `${user.name} will be signed out immediately and won't be able to sign back in until reactivated.`
              : `${user.name} will be able to sign in again.`}
          </p>
          <TextAreaField
            label="Reason"
            required
            rows={3}
            placeholder={
              isSuspending
                ? "Explain why this account is being suspended…"
                : "Explain why this account is being reactivated…"
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
            {submitting ? "Saving…" : isSuspending ? "Confirm suspension" : "Confirm reactivation"}
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
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a restaurant owner">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Full name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Email"
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField label="Password" htmlFor="new-owner-password" hint="Share this with the owner directly.">
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
          label="Restaurant limit"
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
          {submitting ? "Creating…" : "Create owner account"}
        </button>
      </form>
    </Modal>
  );
}
