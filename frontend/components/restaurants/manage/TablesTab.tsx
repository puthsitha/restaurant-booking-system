"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { TextField } from "@/components/ui/FormField";
import { EmptyPlateIcon } from "@/components/ui/icons";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { ApiError } from "@/lib/api";
import { createTable, deleteTable, updateTable } from "@/lib/restaurants/api";
import type { TableStatus } from "@/lib/restaurants/types";

import { FloorPlanView } from "./FloorPlanView";
import type { ManageTabProps } from "./types";

export function TablesTab({ restaurant, token, onSaved }: ManageTabProps) {
  const [view, setView] = useState<"list" | "floorplan">("list");
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [floor, setFloor] = useState("");
  const [zone, setZone] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createTable(
        restaurant.id,
        {
          tableNumber,
          capacity,
          floor: floor || undefined,
          zone: zone || undefined,
          description: description || undefined,
        },
        token,
      );
      setTableNumber("");
      setFloor("");
      setZone("");
      setDescription("");
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
      <form onSubmit={handleAdd} className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            label="Table number"
            required
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="T1"
            className="w-28"
          />
          <TextField
            label="Capacity"
            required
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-24"
          />
          <TextField
            label="Floor"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder="Ground"
            className="w-32"
          />
          <TextField
            label="Zone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Garden, VIP…"
            className="w-36"
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Intimate table in garden area"
            className="min-w-[240px] flex-1"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            Add table
          </button>
        </div>
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
        <>
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: "List" },
              { value: "floorplan", label: "Floor plan" },
            ]}
            className="mt-6"
          />

          {view === "list" ? (
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
              {restaurant.tables.map((table) => (
                <div key={table.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold text-ink">
                      {table.tableNumber} · {table.capacity} seats
                    </p>
                    <p className="text-sm text-muted">
                      {[table.floor, table.zone].filter(Boolean).join(" · ")}
                    </p>
                    {table.description && (
                      <p className="mt-0.5 text-sm text-muted">{table.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={table.status}
                      onChange={(status) => handleStatusChange(table.id, status)}
                      options={[
                        { value: "AVAILABLE", label: "Available" },
                        { value: "SEATED", label: "Seated" },
                        { value: "RESERVED", label: "Reserved" }
                      ]}
                      className="min-w-[130px] py-1.5 text-xs"
                    />
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
          ) : (
            <div className="mt-4">
              <FloorPlanView
                restaurantId={restaurant.id}
                tables={restaurant.tables}
                token={token}
                onSaved={onSaved}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
