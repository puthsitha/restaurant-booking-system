"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyPlateIcon } from "@/components/ui/icons";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { useLanguage } from "@/lib/i18n/context";
import { createTag, deleteTag, listTags } from "@/lib/restaurants/api";
import type { Tag } from "@/lib/restaurants/types";

export default function AdminTagsPage() {
  const { token } = useAdminAuth();
  const { t } = useLanguage();
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [name, setName] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function reload(): void {
    setLoadError(null);
    listTags()
      .then((res) => setTags(res.tags))
      .catch(() => setLoadError(t("adminTags.loadError")));
  }

  useEffect(reload, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setIsSaving(true);
    try {
      await createTag(name, token);
      setName("");
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("adminTags.createError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!token) return;
    setFormError(null);
    try {
      await deleteTag(id, token);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("adminTags.deleteError"));
    }
  }

  return (
    <main className="p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">{t("adminTags.title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("adminTags.subtitle")}</p>

      <form onSubmit={handleAdd} className="mt-6 flex max-w-[560px] items-end gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-bold text-label">
            {t("adminTags.newTagLabel")}
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("adminTags.newTagPlaceholder")}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-ink outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {t("adminTags.addTag")}
        </button>
      </form>

      {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

      {loadError ? (
        <ErrorState className="mt-8" message={loadError} onRetry={reload} />
      ) : tags === null ? (
        <div className="mt-8">
          <ListSkeleton rows={3} />
        </div>
      ) : tags.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={EmptyPlateIcon}
          title={t("adminTags.emptyTitle")}
          message={t("adminTags.emptyMessage")}
          compact
        />
      ) : (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm text-ink"
            >
              {tag.name}
              <button
                onClick={() => handleDelete(tag.id)}
                className="font-bold text-red-600"
                aria-label={t("adminTags.deleteAria", { name: tag.name })}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </main>
  );
}
