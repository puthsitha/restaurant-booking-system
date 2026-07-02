"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { listTags, setRestaurantTags } from "@/lib/restaurants/api";
import type { Tag } from "@/lib/restaurants/types";

import type { ManageTabProps } from "./types";

export function TagsTab({ restaurant, token, onSaved }: ManageTabProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(restaurant.tags.map((t) => t.id)),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    listTags()
      .then((res) => setAllTags(res.tags))
      .catch(() => setAllTags([]));
  }, []);

  function toggle(tagId: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }

  async function handleSave(): Promise<void> {
    setError(null);
    setIsSaving(true);
    try {
      await setRestaurantTags(restaurant.id, Array.from(selected), token);
      await onSaved();
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save tags");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      {allTags.length === 0 ? (
        <p className="text-sm text-muted">No tags exist yet — an admin needs to create some.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isSelected = selected.has(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag.id)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                  isSelected
                    ? "border-accent bg-accent text-white"
                    : "border-border text-ink"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {savedAt && !error && <p className="mt-3 text-sm text-secondary">Saved.</p>}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-5 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save tags"}
      </button>
    </div>
  );
}
