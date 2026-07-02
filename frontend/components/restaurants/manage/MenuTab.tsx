"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ChefHatIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import {
  createMenu,
  createMenuItem,
  deleteMenu,
  deleteMenuItem,
  updateMenuItem,
} from "@/lib/restaurants/api";

import type { ManageTabProps } from "./types";

export function MenuTab({ restaurant, token, onSaved }: ManageTabProps) {
  const [newMenuName, setNewMenuName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleAddMenu(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createMenu(restaurant.id, { name: newMenuName }, token);
      setNewMenuName("");
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add menu");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteMenu(menuId: string): Promise<void> {
    try {
      await deleteMenu(restaurant.id, menuId, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete menu");
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAddMenu} className="flex items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#5C5048]">New menu name</label>
          <input
            required
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            placeholder="Lunch Menu"
            className="w-56 rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          Add menu
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-6">
        {restaurant.menus.length === 0 ? (
          <EmptyState
            icon={ChefHatIcon}
            title="No menus yet"
            message="Add a menu above, then start listing dishes diners will love."
            compact
          />
        ) : (
          restaurant.menus.map((menu) => (
            <div key={menu.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink">{menu.name}</h3>
                <button
                  onClick={() => handleDeleteMenu(menu.id)}
                  className="text-sm font-semibold text-red-600"
                >
                  Delete menu
                </button>
              </div>

              <div className="mt-3 divide-y divide-border">
                {menu.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.name}</p>
                      <p className="text-sm text-muted">${Number(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-muted">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={async (e) => {
                            try {
                              await updateMenuItem(
                                restaurant.id,
                                menu.id,
                                item.id,
                                { isAvailable: e.target.checked },
                                token,
                              );
                              await onSaved();
                            } catch (err) {
                              setError(
                                err instanceof ApiError ? err.message : "Couldn't update item",
                              );
                            }
                          }}
                        />
                        Available
                      </label>
                      <button
                        onClick={async () => {
                          try {
                            await deleteMenuItem(restaurant.id, menu.id, item.id, token);
                            await onSaved();
                          } catch (err) {
                            setError(
                              err instanceof ApiError ? err.message : "Couldn't delete item",
                            );
                          }
                        }}
                        className="text-sm font-semibold text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <AddItemForm
                restaurantId={restaurant.id}
                menuId={menu.id}
                token={token}
                onSaved={onSaved}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AddItemForm({
  restaurantId,
  menuId,
  token,
  onSaved,
}: {
  restaurantId: string;
  menuId: string;
  token: string;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createMenuItem(restaurantId, menuId, { name, price: Number(price) }, token);
      setName("");
      setPrice("");
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add item");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2 border-t border-border pt-3">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name"
        className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none"
      />
      <input
        required
        type="number"
        min={0}
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        className="w-24 rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
      >
        Add item
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
