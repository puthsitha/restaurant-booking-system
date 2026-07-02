"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { SavedToast } from "@/components/ui/SavedToast";
import { UnsavedChangesBar } from "@/components/ui/UnsavedChangesBar";
import { ApiError } from "@/lib/api";
import { listTags, setRestaurantTags } from "@/lib/restaurants/api";
import type { Tag } from "@/lib/restaurants/types";

import type { DirtyTabHandle, ManageTabProps } from "./types";

function sortedIds(ids: Iterable<string>): string[] {
  return Array.from(ids).sort();
}

export const TagsTab = forwardRef<DirtyTabHandle, ManageTabProps>(function TagsTab(
  { restaurant, token, onSaved, onDirtyChange },
  ref,
) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const baseline = useRef(new Set(restaurant.tags.map((t) => t.id)));
  const [selected, setSelected] = useState<Set<string>>(baseline.current);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = JSON.stringify(sortedIds(selected)) !== JSON.stringify(sortedIds(baseline.current));

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

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

  const save = useCallback(async (): Promise<boolean> => {
    setError(null);
    setIsSaving(true);
    try {
      await setRestaurantTags(restaurant.id, Array.from(selected), token);
      await onSaved();
      baseline.current = new Set(selected);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save tags");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [restaurant.id, token, selected, onSaved]);

  useImperativeHandle(ref, () => ({ save }), [save]);

  function discard(): void {
    setSelected(new Set(baseline.current));
    setError(null);
  }

  return (
    <div className="max-w-xl pb-2">
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
                  isSelected ? "border-accent bg-accent text-white" : "border-border text-ink"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}

      <UnsavedChangesBar
        visible={isDirty || isSaving}
        isSaving={isSaving}
        error={error}
        onSave={save}
        onDiscard={discard}
        saveLabel="Save tags"
      />
      <SavedToast visible={justSaved && !isDirty} />
    </div>
  );
});
