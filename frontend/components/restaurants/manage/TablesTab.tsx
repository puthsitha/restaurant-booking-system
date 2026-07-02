"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyPlateIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import { createTable, deleteTable, updateTable } from "@/lib/restaurants/api";
import type { TableStatus } from "@/lib/restaurants/types";

import type { ManageTabProps } from "./types";

export function TablesTab({ restaurant, token, onSaved }: ManageTabProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [zone, setZone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createTable(restaurant.id, { tableNumber, capacity, zone: zone || undefined }, token);
      setTableNumber("");
      setZone("");
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add table");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(tableId: string, status: TableStatus): Promise<void> {
    try {
      await updateTable(restaurant.id, tableId, { status }, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update table");
    }
  }

  async function handleDelete(tableId: string): Promise<void> {
    try {
      await deleteTable(restaurant.id, tableId, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete table");
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#5C5048]">Table number</label>
          <input
            required
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="T1"
            className="w-28 rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#5C5048]">Capacity</label>
          <input
            required
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-24 rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#5C5048]">Zone</label>
          <input
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Garden, VIP…"
            className="w-36 rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          Add table
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {restaurant.tables.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={EmptyPlateIcon}
          title="No tables yet"
          message="Add your first table above so diners have somewhere to sit."
          compact
        />
      ) : (
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {restaurant.tables.map((table) => (
            <div key={table.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-ink">
                  {table.tableNumber} · {table.capacity} seats
                </p>
                {table.zone && <p className="text-sm text-muted">{table.zone}</p>}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, e.target.value as TableStatus)}
                  className="rounded-lg border border-border px-2 py-1.5 text-sm text-ink"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="SEATED">Seated</option>
                  <option value="RESERVED">Reserved</option>
                </select>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
