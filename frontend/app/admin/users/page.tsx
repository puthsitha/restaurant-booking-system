"use client";

import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchOffIcon } from "@/components/ui/icons";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { updateUserStatus, listUsers } from "@/lib/users/api";
import type { ManageableRole, ManagedUser } from "@/lib/users/types";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary",
  SUSPENDED: "bg-red-100 text-red-700",
};

export default function AdminUsersPage() {
  const { token } = useAdminAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [role, setRole] = useState<ManageableRole | "">("");
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  async function toggleStatus(user: ManagedUser): Promise<void> {
    if (!token) return;
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUpdatingId(user.id);
    try {
      await updateUserStatus(user.id, nextStatus, token);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update this account.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main style={{ padding: 32 }}>
      <h1 className="disp text-2xl font-extrabold text-ink">Users</h1>
      <p className="mt-1 text-sm text-muted">Diners and restaurant owners on the platform.</p>

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
              <div>
                <p className="font-bold text-ink">{u.name}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {u.role === "OWNER" ? "Owner" : "Customer"} · {u.phone ?? u.email ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[u.status]}`}
                >
                  {u.status}
                </span>
                <button
                  type="button"
                  onClick={() => toggleStatus(u)}
                  disabled={updatingId === u.id}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-bg disabled:opacity-50"
                >
                  {u.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
