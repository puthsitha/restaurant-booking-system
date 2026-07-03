"use client";

import Link from "next/link";

import { SessionEndedModal } from "@/components/auth/SessionEndedModal";
import { Avatar } from "@/components/ui/Avatar";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { useAuthModal } from "@/lib/auth/authModal";

export function CustomerHeader() {
  const { user, status, logout, sessionMessage, clearSessionMessage } = useCustomerAuth();
  const { open } = useAuthModal();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
      <SessionEndedModal message={sessionMessage} onDismiss={clearSessionMessage} />
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
        <Link href="/" className="disp text-lg font-extrabold text-ink">
          Table<span className="text-accent">Site</span>
        </Link>

        {status === "authenticated" && user ? (
          <div className="flex items-center gap-5">
            <Link href="/bookings" className="text-sm font-semibold text-ink hover:text-accent">
              My bookings
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-accent"
            >
              <Avatar name={user.name} size="sm" />
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface"
            >
              Log out
            </button>
          </div>
        ) : (
          <button
            onClick={open}
            disabled={status === "loading"}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(194,65,12,.28)] disabled:opacity-60"
          >
            Log in
          </button>
        )}
      </div>
    </header>
  );
}
