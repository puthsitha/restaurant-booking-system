"use client";

import { Modal } from "@/components/ui/Modal";

interface SessionEndedModalProps {
  message: string | null;
  onDismiss: () => void;
}

// Shown whenever the server force-ends a session mid-use (most notably an
// admin suspending the account) — a full popup reads far kinder than a thin
// red bar at the top of the page, and forces acknowledgement before the
// person moves on.
export function SessionEndedModal({ message, onDismiss }: SessionEndedModalProps) {
  return (
    <Modal open={message !== null} onClose={onDismiss} className="text-center">
      {message && (
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            🔒
          </div>
          <h2 className="disp mt-4 text-lg font-bold text-ink">You&apos;ve been logged out</h2>
          <p className="mt-2 text-sm text-ink">{message}</p>
          <p className="mt-2 text-sm text-muted">
            If you think this isn&apos;t right, please kindly contact our customer support team —
            we&apos;re happy to help.
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-6 w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white"
          >
            Okay
          </button>
        </div>
      )}
    </Modal>
  );
}
