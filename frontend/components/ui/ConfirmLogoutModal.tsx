"use client";

import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/context";

interface ConfirmLogoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Shared confirm-before-logout dialog for the customer header and the
// owner/admin dashboard sidebar — logging out is easy to hit by accident on
// a shared/kiosk device, so it gets a confirmation like other one-way
// actions (cancel booking, delete review) instead of firing immediately.
export function ConfirmLogoutModal({ open, onClose, onConfirm }: ConfirmLogoutModalProps) {
  const { t } = useLanguage();
  return (
    <Modal open={open} onClose={onClose} title={t("common.logOutConfirmTitle")}>
      <p className="text-sm text-ink">{t("common.logOutConfirmBody")}</p>
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
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white"
        >
          {t("common.logOut")}
        </button>
      </div>
    </Modal>
  );
}
