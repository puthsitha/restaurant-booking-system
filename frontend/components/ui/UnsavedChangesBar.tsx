"use client";

import { AnimatePresence, motion } from "framer-motion";

interface UnsavedChangesBarProps {
  visible: boolean;
  isSaving: boolean;
  error?: string | null;
  onSave: () => void;
  onDiscard: () => void;
  saveLabel?: string;
}

// A sticky bar pinned to the bottom of the viewport whenever a draft-style
// form (Profile, Hours, Tags) has unsaved edits — so Save is always in easy
// reach without scrolling, instead of sitting at the bottom of a long form.
export function UnsavedChangesBar({
  visible,
  isSaving,
  error,
  onSave,
  onDiscard,
  saveLabel = "Save changes",
}: UnsavedChangesBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="sticky bottom-4 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-surface px-5 py-3.5 shadow-lg"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent motion-safe:animate-pulse" />
            You have unsaved changes
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDiscard}
              disabled={isSaving}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:bg-bg disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {isSaving ? "Saving…" : saveLabel}
            </button>
          </div>
          {error && <p className="w-full text-xs font-semibold text-red-600">{error}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
