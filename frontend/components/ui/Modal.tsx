"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { CloseIcon } from "@/components/ui/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

// A single shared modal shell (backdrop blur + spring pop-in) so every
// confirm/approve/deny/edit dialog across the owner and admin sites feels
// the same rather than each screen rolling its own popup.
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-scrim/40 backdrop-blur-sm"
            onClick={onClose}
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
                  aria-label="Close"
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
    </AnimatePresence>
  );
}
