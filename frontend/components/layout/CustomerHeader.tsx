"use client";

import Link from "next/link";

import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { useAuthModal } from "@/lib/auth/authModal";

export function CustomerHeader() {
  const { user, status, logout, sessionMessage, clearSessionMessage } = useCustomerAuth();
  const { open } = useAuthModal();

  return (
    <header className="border-b border-border bg-surface">
      {sessionMessage && (
        <div className="flex items-center justify-between gap-3 bg-red-50 px-8 py-2.5 text-sm text-red-700">
          <span>{sessionMessage}</span>
          <button
            type="button"
            onClick={clearSessionMessage}
            aria-label="Dismiss"
            className="font-bold text-red-700"
          >
            ×
          </button>
        </div>
      )}
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
        <Link href="/" className="disp text-lg font-extrabold text-ink">
          Table<span className="text-accent">Site</span>
        </Link>

        {status === "authenticated" && user ? (
          <div className="flex items-center gap-4">
            <Link href="/bookings" className="text-sm font-semibold text-ink hover:text-accent">
              My bookings
            </Link>
            <span className="text-sm text-ink">{user.name}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink"
            >
              Log out
            </button>
          </div>
        ) : (
          <button
            onClick={open}
            disabled={status === "loading"}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            Log in
          </button>
        )}
      </div>
    </header>
  );
}
