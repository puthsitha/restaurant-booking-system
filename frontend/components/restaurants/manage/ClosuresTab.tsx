"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyPlateIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import { createSpecialClosure, deleteSpecialClosure } from "@/lib/restaurants/api";

import type { ManageTabProps } from "./types";

export function ClosuresTab({ restaurant, token, onSaved }: ManageTabProps) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createSpecialClosure(restaurant.id, { date, reason: reason || undefined }, token);
      setDate("");
      setReason("");
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add closure");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(closureId: string): Promise<void> {
    try {
      await deleteSpecialClosure(restaurant.id, closureId, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete closure");
    }
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#5C5048]">Date</label>
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-bold text-[#5C5048]">Reason</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Public holiday, private event…"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {restaurant.specialClosures.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={EmptyPlateIcon}
          title="No closures on the books"
          message="You're open as usual. Add a date above for holidays or private events."
          compact
        />
      ) : (
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {restaurant.specialClosures.map((closure) => (
            <div key={closure.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-ink">
                  {new Date(closure.date).toLocaleDateString()}
                </p>
                {closure.reason && <p className="text-sm text-muted">{closure.reason}</p>}
              </div>
              <button
                onClick={() => handleDelete(closure.id)}
                className="text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
