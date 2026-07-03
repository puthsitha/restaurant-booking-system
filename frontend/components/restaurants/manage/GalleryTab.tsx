"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyPlateIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import { createGalleryImage, deleteGalleryImage } from "@/lib/restaurants/api";

import type { ManageTabProps } from "./types";

export function GalleryTab({ restaurant, token, onSaved }: ManageTabProps) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createGalleryImage(restaurant.id, { url, caption: caption || undefined }, token);
      setUrl("");
      setCaption("");
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add image");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(imageId: string): Promise<void> {
    try {
      await deleteGalleryImage(restaurant.id, imageId, token);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete image");
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-bold text-label">Image URL</label>
          <input
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-label">Caption</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-40 rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none"
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

      {restaurant.galleryImages.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={EmptyPlateIcon}
          title="No photos yet"
          message="A great photo is often the reason a diner picks your restaurant — add your first one above."
          compact
        />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {restaurant.galleryImages.map((image) => (
            <div key={image.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.caption ?? ""}
                className="h-28 w-full rounded-xl object-cover"
              />
              <button
                onClick={() => handleDelete(image.id)}
                className="absolute right-1.5 top-1.5 rounded-full bg-ink/70 px-2 py-0.5 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
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
