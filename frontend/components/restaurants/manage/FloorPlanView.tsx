"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import { updateTable } from "@/lib/restaurants/api";
import type { RestaurantTable, TableStatus } from "@/lib/restaurants/types";

const GRID_COLS = 10;
const GRID_ROWS = 6;

const STATUS_TILE: Record<TableStatus, string> = {
  AVAILABLE: "bg-secondary/15 border-secondary text-secondary",
  SEATED: "bg-accent/15 border-accent text-accent",
  RESERVED: "bg-amber-100 border-amber-500 text-amber-700",
};

interface FloorPlanViewProps {
  restaurantId: string;
  tables: RestaurantTable[];
  token: string;
  onSaved: () => Promise<void>;
}

// Click-to-place floor plan: pick an unplaced table, then click an empty
// grid cell to seat it there. Simpler than pixel drag-and-drop but gives the
// same "see your floor at a glance" outcome the reference design shows.
export function FloorPlanView({ restaurantId, tables, token, onSaved }: FloorPlanViewProps) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unplaced = tables.filter((table) => table.positionX === null || table.positionY === null);
  const placedByCell = new Map(
    tables
      .filter((table) => table.positionX !== null && table.positionY !== null)
      .map((table) => [`${table.positionX},${table.positionY}`, table]),
  );

  async function placeAt(x: number, y: number): Promise<void> {
    if (!selectedId) return;
    setError(null);
    try {
      await updateTable(restaurantId, selectedId, { positionX: x, positionY: y }, token);
      setSelectedId(null);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.floorPlan.placeError"));
    }
  }

  async function unplace(tableId: string): Promise<void> {
    setError(null);
    try {
      await updateTable(restaurantId, tableId, { positionX: null, positionY: null }, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.floorPlan.updateError"));
    }
  }

  return (
    <div>
      {unplaced.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold text-label">
            {selectedId
              ? t("ownerManage.floorPlan.instruction")
              : t("ownerManage.floorPlan.unplacedTables")}
          </p>
          <div className="flex flex-wrap gap-2">
            {unplaced.map((table) => (
              <button
                key={table.id}
                type="button"
                onClick={() => setSelectedId(table.id === selectedId ? null : table.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  selectedId === table.id
                    ? "border-accent bg-accent text-white"
                    : "border-border text-ink hover:bg-bg"
                }`}
              >
                {t("ownerManage.floorPlan.seatsSuffix", { number: table.tableNumber, capacity: table.capacity })}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div
        className="grid gap-1.5 rounded-2xl border border-border bg-bg p-3"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0,1fr))` }}
      >
        {Array.from({ length: GRID_ROWS }, (_, y) =>
          Array.from({ length: GRID_COLS }, (_, x) => {
            const table = placedByCell.get(`${x},${y}`);
            if (table) {
              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  onClick={() => unplace(table.id)}
                  title={t("ownerManage.floorPlan.seatsUnplaceTitle", {
                    number: table.tableNumber,
                    capacity: table.capacity
                  })}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-[10px] font-bold ${STATUS_TILE[table.status]}`}
                >
                  {table.tableNumber}
                </button>
              );
            }
            return (
              <button
                key={`${x}-${y}`}
                type="button"
                disabled={!selectedId}
                onClick={() => placeAt(x, y)}
                className="aspect-square rounded-lg border border-dashed border-border/70 transition enabled:hover:border-accent enabled:hover:bg-accent/5"
              />
            );
          }),
        )}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-secondary bg-secondary/15" />{" "}
          {t("ownerManage.floorPlan.available")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-accent bg-accent/15" /> {t("ownerManage.floorPlan.seated")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-amber-500 bg-amber-100" />{" "}
          {t("ownerManage.floorPlan.reserved")}
        </span>
      </div>
    </div>
  );
}
