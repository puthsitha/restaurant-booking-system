"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { TextField } from "@/components/ui/FormField";
import { EmptyPlateIcon } from "@/components/ui/icons";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import { createTable, deleteTable, updateTable } from "@/lib/restaurants/api";
import type { TableStatus } from "@/lib/restaurants/types";

import { FloorPlanView } from "./FloorPlanView";
import type { ManageTabProps } from "./types";

export function TablesTab({ restaurant, token, onSaved }: ManageTabProps) {
  const { t } = useLanguage();
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
      setError(err instanceof ApiError ? err.message : t("ownerManage.tables.addError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(tableId: string, status: TableStatus): Promise<void> {
    try {
      await updateTable(restaurant.id, tableId, { status }, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.tables.updateError"));
    }
  }

  async function handleDelete(tableId: string): Promise<void> {
    try {
      await deleteTable(restaurant.id, tableId, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.tables.deleteError"));
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAdd} className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            label={t("ownerManage.tables.tableNumber")}
            required
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder={t("ownerManage.tables.tableNumberPlaceholder")}
            className="w-28"
          />
          <TextField
            label={t("ownerManage.tables.capacity")}
            required
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-24"
          />
          <TextField
            label={t("ownerManage.tables.floor")}
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder={t("ownerManage.tables.floorPlaceholder")}
            className="w-32"
          />
          <TextField
            label={t("ownerManage.tables.zone")}
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder={t("ownerManage.tables.zonePlaceholder")}
            className="w-36"
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            label={t("ownerManage.tables.descriptionOptional")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("ownerManage.tables.descriptionPlaceholder")}
            className="min-w-[240px] flex-1"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {t("ownerManage.tables.addTable")}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {restaurant.tables.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={EmptyPlateIcon}
          title={t("ownerManage.tables.emptyTitle")}
          message={t("ownerManage.tables.emptyMessage")}
          compact
        />
      ) : (
        <>
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: t("ownerManage.tables.viewList") },
              { value: "floorplan", label: t("ownerManage.tables.viewFloorPlan") },
            ]}
            className="mt-6"
          />

          {view === "list" ? (
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
              {restaurant.tables.map((table) => (
                <div key={table.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold text-ink">
                      {t("ownerManage.floorPlan.seatsSuffix", {
                        number: table.tableNumber,
                        capacity: table.capacity
                      })}
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
                        { value: "AVAILABLE", label: t("ownerManage.tables.statusAvailable") },
                        { value: "SEATED", label: t("ownerManage.tables.statusSeated") },
                        { value: "RESERVED", label: t("ownerManage.tables.statusReserved") }
                      ]}
                      className="min-w-[130px] py-1.5 text-xs"
                    />
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="text-sm font-semibold text-red-600"
                    >
                      {t("common.delete")}
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
