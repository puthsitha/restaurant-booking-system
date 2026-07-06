"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SessionEndedModal } from "@/components/auth/SessionEndedModal";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmLogoutModal } from "@/components/ui/ConfirmLogoutModal";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { useAuthModal } from "@/lib/auth/authModal";
import { useLanguage } from "@/lib/i18n/context";

export function CustomerHeader() {
  const { user, status, logout, sessionMessage, clearSessionMessage } = useCustomerAuth();
  const { open } = useAuthModal();
  const { t } = useLanguage();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  return (
    <>
      {/* Rendered outside the header: its backdrop-blur creates a containing
          block for fixed-position descendants, which would center the modal
          inside the (short) header bar instead of the full viewport. */}
      <SessionEndedModal message={sessionMessage} onDismiss={clearSessionMessage} />
      <ConfirmLogoutModal
        open={confirmingLogout}
        onClose={() => setConfirmingLogout(false)}
        onConfirm={() => {
          setConfirmingLogout(false);
          logout();
        }}
      />
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
          <Link href="/" aria-label="TableSite" className="flex items-center">
            <Image src="/images/symbol_mark.png" alt="TableSite" width={36} height={36} className="h-9 w-9" priority />
          </Link>

          <div className="flex items-center gap-2">
            <LanguageToggle />

            {status === "authenticated" && user ? (
              <div className="ml-3 flex items-center gap-5">
                <Link href="/bookings" className="text-sm font-semibold text-ink hover:text-accent">
                  {t("customerHeader.myBookings")}
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-accent"
                >
                  <Avatar name={user.name} imageUrl={user.avatarUrl} size="sm" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button
                  onClick={() => setConfirmingLogout(true)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface"
                >
                  {t("common.logOut")}
                </button>
              </div>
            ) : (
              <button
                onClick={open}
                disabled={status === "loading"}
                className="ml-3 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(194,65,12,.28)] disabled:opacity-60"
              >
                {t("customerHeader.logIn")}
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
