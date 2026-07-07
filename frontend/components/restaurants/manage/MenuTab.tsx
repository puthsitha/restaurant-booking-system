"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextAreaField, TextField } from "@/components/ui/FormField";
import { ChefHatIcon, UtensilsIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import {
  createMenu,
  createMenuItem,
  deleteMenu,
  deleteMenuItem,
  updateMenu,
  updateMenuItem,
} from "@/lib/restaurants/api";
import type { Menu, MenuItem } from "@/lib/restaurants/types";

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
  const { t } = useLanguage();
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuNameKm, setNewMenuNameKm] = useState("");
  const [newMenuDescription, setNewMenuDescription] = useState("");
  const [newMenuDescriptionKm, setNewMenuDescriptionKm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [menuPendingDelete, setMenuPendingDelete] = useState<string | null>(null);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  async function handleAddMenu(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createMenu(
        restaurant.id,
        {
          name: newMenuName,
          nameKm: newMenuNameKm || undefined,
          description: newMenuDescription || undefined,
          descriptionKm: newMenuDescriptionKm || undefined,
        },
        token,
      );
      setNewMenuName("");
      setNewMenuNameKm("");
      setNewMenuDescription("");
      setNewMenuDescriptionKm("");
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.menu.addMenuError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteMenu(menuId: string): Promise<void> {
    try {
      await deleteMenu(restaurant.id, menuId, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.menu.deleteMenuError"));
    }
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleAddMenu} className="flex flex-wrap items-end gap-3">
        <TextField
          label={t("ownerManage.menu.newMenuName")}
          required
          value={newMenuName}
          onChange={(e) => setNewMenuName(e.target.value)}
          placeholder={t("ownerManage.menu.newMenuPlaceholder")}
          className="w-56"
        />
        <TextField
          label={t("ownerManage.menu.newMenuNameKm")}
          value={newMenuNameKm}
          onChange={(e) => setNewMenuNameKm(e.target.value)}
          placeholder={t("ownerManage.menu.newMenuNameKmPlaceholder")}
          className="km w-56"
        />
        <TextField
          label={t("ownerManage.menu.descriptionOptional")}
          value={newMenuDescription}
          onChange={(e) => setNewMenuDescription(e.target.value)}
          placeholder={t("ownerManage.menu.descriptionPlaceholder")}
          className="min-w-[220px] flex-1"
        />
        <TextField
          label={t("ownerManage.menu.descriptionKmOptional")}
          value={newMenuDescriptionKm}
          onChange={(e) => setNewMenuDescriptionKm(e.target.value)}
          placeholder={t("ownerManage.menu.descriptionKmPlaceholder")}
          className="km min-w-[220px] flex-1"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {t("ownerManage.menu.addMenu")}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-6">
        {restaurant.menus.length === 0 ? (
          <EmptyState
            icon={ChefHatIcon}
            title={t("ownerManage.menu.emptyTitle")}
            message={t("ownerManage.menu.emptyMessage")}
            compact
          />
        ) : (
          restaurant.menus.map((menu) => (
            <div key={menu.id} className="rounded-2xl border border-border bg-surface p-5">
              {editingMenuId === menu.id ? (
                <MenuEditForm
                  restaurantId={restaurant.id}
                  menu={menu}
                  token={token}
                  onSaved={onSaved}
                  onDone={() => setEditingMenuId(null)}
                />
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="disp font-bold text-ink">{menu.name}</h3>
                    {menu.nameKm && <p className="km text-sm text-muted">{menu.nameKm}</p>}
                    {menu.description && (
                      <p className="mt-0.5 text-sm text-muted">{menu.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      onClick={() => setEditingMenuId(menu.id)}
                      className="text-sm font-semibold text-ink"
                    >
                      {t("ownerManage.menu.editMenu")}
                    </button>
                    <button
                      onClick={() => setMenuPendingDelete(menu.id)}
                      className="text-sm font-semibold text-red-600"
                    >
                      {t("ownerManage.menu.deleteMenu")}
                    </button>
                  </div>
                </div>
              )}

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

              <MenuItemForm
                restaurantId={restaurant.id}
                menuId={menu.id}
                token={token}
                onSaved={onSaved}
              />
            </div>
          ))
        )}
      </div>

      <ConfirmDeleteModal
        open={menuPendingDelete !== null}
        title={t("ownerManage.menu.deleteMenuConfirmTitle")}
        body={t("ownerManage.menu.deleteMenuConfirmBody")}
        onClose={() => setMenuPendingDelete(null)}
        onConfirm={() => {
          if (menuPendingDelete) void handleDeleteMenu(menuPendingDelete);
        }}
      />
    </div>
  );
}

function MenuEditForm({
  restaurantId,
  menu,
  token,
  onSaved,
  onDone,
}: {
  restaurantId: string;
  menu: Menu;
  token: string;
  onSaved: () => Promise<void>;
  onDone: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(menu.name);
  const [nameKm, setNameKm] = useState(menu.nameKm ?? "");
  const [description, setDescription] = useState(menu.description ?? "");
  const [descriptionKm, setDescriptionKm] = useState(menu.descriptionKm ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await updateMenu(
        restaurantId,
        menu.id,
        {
          name,
          nameKm: nameKm || undefined,
          description: description || undefined,
          descriptionKm: descriptionKm || undefined,
        },
        token,
      );
      await onSaved();
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.menu.updateMenuError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <TextField
          label={t("ownerManage.menu.newMenuName")}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <TextField
          label={t("ownerManage.menu.newMenuNameKm")}
          value={nameKm}
          onChange={(e) => setNameKm(e.target.value)}
          className="km min-w-[200px] flex-1"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <TextField
          label={t("ownerManage.menu.descriptionOptional")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <TextField
          label={t("ownerManage.menu.descriptionKmOptional")}
          value={descriptionKm}
          onChange={(e) => setDescriptionKm(e.target.value)}
          className="km min-w-[200px] flex-1"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSaving ? t("common.saving") : t("common.save")}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-ink"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
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
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function toggleAvailable(isAvailable: boolean): Promise<void> {
    try {
      await updateMenuItem(restaurantId, menuId, item.id, { isAvailable }, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.menu.updateItemError"));
    }
  }

  async function handleDelete(): Promise<void> {
    try {
      await deleteMenuItem(restaurantId, menuId, item.id, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerManage.menu.deleteItemError"));
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-xl border border-border p-3">
        <MenuItemForm
          restaurantId={restaurantId}
          menuId={menuId}
          token={token}
          onSaved={onSaved}
          editItem={item}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
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
        {item.nameKm && <p className="km mt-1 truncate text-sm text-muted">{item.nameKm}</p>}
        {item.descriptionKm && (
          <p className="km mt-1 line-clamp-2 text-sm text-muted">{item.descriptionKm}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.isVegan && <Badge>{t("ownerManage.menu.vegan")}</Badge>}
          {item.isVegetarian && !item.isVegan && <Badge>{t("ownerManage.menu.vegetarian")}</Badge>}
          {item.isGlutenFree && <Badge>{t("ownerManage.menu.glutenFree")}</Badge>}

          <label className="ml-auto flex items-center gap-1.5 text-xs text-muted">
            <input
              type="checkbox"
              checked={item.isAvailable}
              onChange={(e) => toggleAvailable(e.target.checked)}
            />
            {t("ownerManage.menu.available")}
          </label>
          <button onClick={() => setIsEditing(true)} className="text-xs font-semibold text-ink">
            {t("ownerManage.menu.editItem")}
          </button>
          <button onClick={() => setConfirmingDelete(true)} className="text-xs font-semibold text-red-600">
            {t("common.delete")}
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>

      <ConfirmDeleteModal
        open={confirmingDelete}
        title={t("ownerManage.menu.deleteItemConfirmTitle")}
        body={t("ownerManage.menu.deleteItemConfirmBody")}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

function MenuItemForm({
  restaurantId,
  menuId,
  token,
  onSaved,
  editItem,
  onCancel,
}: {
  restaurantId: string;
  menuId: string;
  token: string;
  onSaved: () => Promise<void>;
  editItem?: MenuItem;
  onCancel?: () => void;
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(Boolean(editItem));
  const [name, setName] = useState(editItem?.name ?? "");
  const [nameKm, setNameKm] = useState(editItem?.nameKm ?? "");
  const [description, setDescription] = useState(editItem?.description ?? "");
  const [descriptionKm, setDescriptionKm] = useState(editItem?.descriptionKm ?? "");
  const [price, setPrice] = useState(editItem ? String(editItem.price) : "");
  const [category, setCategory] = useState(editItem?.category ?? "");
  const [imageUrl, setImageUrl] = useState(editItem?.imageUrl ?? "");
  const [isVegan, setIsVegan] = useState(editItem?.isVegan ?? false);
  const [isVegetarian, setIsVegetarian] = useState(editItem?.isVegetarian ?? false);
  const [isGlutenFree, setIsGlutenFree] = useState(editItem?.isGlutenFree ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function reset(): void {
    setName("");
    setNameKm("");
    setDescription("");
    setDescriptionKm("");
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
    const payload = {
      name,
      nameKm: nameKm || undefined,
      description: description || undefined,
      descriptionKm: descriptionKm || undefined,
      price: Number(price),
      category: category || undefined,
      imageUrl: imageUrl || undefined,
      isVegan,
      isVegetarian,
      isGlutenFree,
    };
    try {
      if (editItem) {
        await updateMenuItem(restaurantId, menuId, editItem.id, payload, token);
        await onSaved();
        onCancel?.();
      } else {
        await createMenuItem(restaurantId, menuId, payload, token);
        reset();
        setExpanded(false);
        await onSaved();
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : t(editItem ? "ownerManage.menu.updateItemError" : "ownerManage.menu.addItemError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={editItem ? "space-y-3" : "mt-4 space-y-3 border-t border-border pt-4"}
    >
      <div className="flex flex-wrap items-end gap-2">
        <TextField
          label={t("ownerManage.menu.itemName")}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("ownerManage.menu.itemNamePlaceholder")}
          className="min-w-[160px] flex-1"
        />
        <TextField
          label={t("ownerManage.menu.priceUsd")}
          required
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={t("ownerManage.menu.pricePlaceholder")}
          className="w-28"
        />
        {!editItem && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-border px-4 py-3 text-xs font-bold text-ink transition hover:bg-bg"
          >
            {expanded ? t("ownerManage.menu.fewerDetails") : t("ownerManage.menu.moreDetails")}
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {isSaving
            ? editItem
              ? t("common.saving")
              : t("common.adding")
            : editItem
              ? t("common.save")
              : t("ownerManage.menu.addItem")}
        </button>
        {editItem && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-3 text-xs font-bold text-ink transition hover:bg-bg"
          >
            {t("common.cancel")}
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-3 rounded-xl bg-bg p-4">
          <TextField
            label={t("ownerManage.menu.itemNameKm")}
            value={nameKm}
            onChange={(e) => setNameKm(e.target.value)}
            placeholder={t("ownerManage.menu.itemNameKmPlaceholder")}
            className="km"
          />
          <TextAreaField
            label={t("ownerManage.menu.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder={t("ownerManage.menu.descriptionItemPlaceholder")}
          />
          <TextAreaField
            label={t("ownerManage.menu.descriptionKmItem")}
            value={descriptionKm}
            onChange={(e) => setDescriptionKm(e.target.value)}
            rows={2}
            placeholder={t("ownerManage.menu.descriptionKmItemPlaceholder")}
            className="km"
          />
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[160px] flex-1">
              <TextField
                label={t("ownerManage.menu.category")}
                list="menu-item-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t("ownerManage.menu.categoryPlaceholder")}
              />
              <datalist id="menu-item-categories">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <TextField
              label={t("ownerManage.menu.imageUrl")}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t("ownerManage.menu.urlPlaceholder")}
              className="min-w-[220px] flex-[2]"
            />
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={isVegan} onChange={(e) => setIsVegan(e.target.checked)} />
              {t("ownerManage.menu.vegan")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={isVegetarian}
                onChange={(e) => setIsVegetarian(e.target.checked)}
              />
              {t("ownerManage.menu.vegetarian")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={isGlutenFree}
                onChange={(e) => setIsGlutenFree(e.target.checked)}
              />
              {t("ownerManage.menu.glutenFree")}
            </label>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
