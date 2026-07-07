"use client";

import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/context";

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
  onConfirm: () => void;
}

// Shared confirm-before-delete dialog — used anywhere a one-way delete
// action (menu, menu item, ...) shouldn't fire on a single accidental click.
export function ConfirmDeleteModal({ open, title, body, onClose, onConfirm }: ConfirmDeleteModalProps) {
  const { t } = useLanguage();
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-ink">{body}</p>
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-ink"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white"
        >
          {t("common.delete")}
        </button>
      </div>
    </Modal>
  );
}
