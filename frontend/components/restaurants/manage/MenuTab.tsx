"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { TextAreaField, TextField } from "@/components/ui/FormField";
import { ChefHatIcon, UtensilsIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import {
  createMenu,
  createMenuItem,
  deleteMenu,
  deleteMenuItem,
  updateMenuItem,
} from "@/lib/restaurants/api";
import type { MenuItem } from "@/lib/restaurants/types";

import type { ManageTabProps } from "./types";

const CATEGORY_SUGGESTIONS = ["Appetizer", "Soup", "Main", "Dessert", "Drink"];

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[11px] font-bold text-secondary">
      {children}
    </span>
  );
}

export function MenuTab({ restaurant, token, onSaved }: ManageTabProps) {
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuDescription, setNewMenuDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleAddMenu(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createMenu(
        restaurant.id,
        { name: newMenuName, description: newMenuDescription || undefined },
        token,
      );
      setNewMenuName("");
      setNewMenuDescription("");
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
    <div className="max-w-3xl">
      <form onSubmit={handleAddMenu} className="flex flex-wrap items-end gap-3">
        <TextField
          label="New menu name"
          required
          value={newMenuName}
          onChange={(e) => setNewMenuName(e.target.value)}
          placeholder="Lunch Menu"
          className="w-56"
        />
        <TextField
          label="Description (optional)"
          value={newMenuDescription}
          onChange={(e) => setNewMenuDescription(e.target.value)}
          placeholder="Served 11:00 AM – 3:00 PM"
          className="min-w-[220px] flex-1"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
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
            <div key={menu.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="disp font-bold text-ink">{menu.name}</h3>
                  {menu.description && (
                    <p className="mt-0.5 text-sm text-muted">{menu.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteMenu(menu.id)}
                  className="shrink-0 text-sm font-semibold text-red-600"
                >
                  Delete menu
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {menu.items.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    restaurantId={restaurant.id}
                    menuId={menu.id}
                    item={item}
                    token={token}
                    onSaved={onSaved}
                  />
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

function MenuItemRow({
  restaurantId,
  menuId,
  item,
  token,
  onSaved,
}: {
  restaurantId: string;
  menuId: string;
  item: MenuItem;
  token: string;
  onSaved: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);

  async function toggleAvailable(isAvailable: boolean): Promise<void> {
    try {
      await updateMenuItem(restaurantId, menuId, item.id, { isAvailable }, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update item");
    }
  }

  async function handleDelete(): Promise<void> {
    try {
      await deleteMenuItem(restaurantId, menuId, item.id, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete item");
    }
  }

  return (
    <div className="flex gap-3 rounded-xl border border-border p-3">
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-bg text-muted">
          <UtensilsIcon className="h-6 w-6" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{item.name}</p>
            {item.category && <p className="text-xs font-medium text-muted">{item.category}</p>}
          </div>
          <span className="shrink-0 font-semibold text-ink">${Number(item.price).toFixed(2)}</span>
        </div>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.isVegan && <Badge>Vegan</Badge>}
          {item.isVegetarian && !item.isVegan && <Badge>Vegetarian</Badge>}
          {item.isGlutenFree && <Badge>Gluten-free</Badge>}

          <label className="ml-auto flex items-center gap-1.5 text-xs text-muted">
            <input
              type="checkbox"
              checked={item.isAvailable}
              onChange={(e) => toggleAvailable(e.target.checked)}
            />
            Available
          </label>
          <button onClick={handleDelete} className="text-xs font-semibold text-red-600">
            Delete
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
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
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isVegan, setIsVegan] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function reset(): void {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImageUrl("");
    setIsVegan(false);
    setIsVegetarian(false);
    setIsGlutenFree(false);
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createMenuItem(
        restaurantId,
        menuId,
        {
          name,
          description: description || undefined,
          price: Number(price),
          category: category || undefined,
          imageUrl: imageUrl || undefined,
          isVegan,
          isVegetarian,
          isGlutenFree,
        },
        token,
      );
      reset();
      setExpanded(false);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add item");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-3 border-t border-border pt-4"
    >
      <div className="flex flex-wrap items-end gap-2">
        <TextField
          label="Item name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Fish Amok"
          className="min-w-[160px] flex-1"
        />
        <TextField
          label="Price (USD)"
          required
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="9.99"
          className="w-28"
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-lg border border-border px-4 py-3 text-xs font-bold text-ink transition hover:bg-bg"
        >
          {expanded ? "Fewer details" : "More details"}
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {isSaving ? "Adding…" : "Add item"}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 rounded-xl bg-bg p-4">
          <TextAreaField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Steamed fish in coconut cream curry with kaffir lime leaves"
          />
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[160px] flex-1">
              <TextField
                label="Category"
                list="menu-item-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Main"
              />
              <datalist id="menu-item-categories">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <TextField
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="min-w-[220px] flex-[2]"
            />
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={isVegan} onChange={(e) => setIsVegan(e.target.checked)} />
              Vegan
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={isVegetarian}
                onChange={(e) => setIsVegetarian(e.target.checked)}
              />
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={isGlutenFree}
                onChange={(e) => setIsGlutenFree(e.target.checked)}
              />
              Gluten-free
            </label>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
