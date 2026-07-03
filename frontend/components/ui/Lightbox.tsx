"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { CloseIcon } from "@/components/ui/icons";
import { pop } from "@/lib/motion";

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Fullscreen overlay for viewing a single piece of media up close (a photo,
// a QR code) — deliberately not built on top of Modal, which always carries
// padded card chrome (border/rounded/bg-surface) that a fullscreen viewer
// doesn't want.
export function Lightbox({ open, onClose, children }: LightboxProps) {
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
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/90"
            onClick={onClose}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <motion.div
            className="relative flex max-h-full max-w-full items-center justify-center"
            variants={pop}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
