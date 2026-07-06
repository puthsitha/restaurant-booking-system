"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

import { CloseIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  // False for alerts the person must acknowledge (e.g. the account-suspended
  // notice) — backdrop click and Escape no longer close it, only an explicit
  // in-dialog action can.
  dismissible?: boolean;
}

// A single shared modal shell (backdrop blur + spring pop-in) so every
// confirm/approve/deny/edit dialog across the owner and admin sites feels
// the same rather than each screen rolling its own popup.
export function Modal({ open, onClose, title, children, className, dismissible = true }: ModalProps) {
  const { t } = useLanguage();
  // Portal straight into <body> so the overlay always paints above every
  // other element on the page — without this, content elsewhere that forces
  // its own compositing layer (e.g. a CSS transform or gradient background,
  // like the dashboard's Donut chart or the Switch toggle knob) can render
  // on top of the backdrop instead of being dimmed/blurred underneath it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape" && dismissible) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, dismissible]);

  // Block background scrolling/interaction behind the dialog while it's open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={dismissible ? onClose : undefined}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl ${className ?? ""}`}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
          >
            {title && (
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="disp text-lg font-bold text-ink">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("common.close")}
                  className="rounded-full p-1.5 text-muted transition hover:bg-bg hover:text-ink"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
