"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { CashIcon, ChairIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";

type Role = "diner" | "owner" | "admin";

const ROLE_HREF: Record<Role, string> = {
  diner: "/",
  owner: "/owner/login",
  admin: "/admin/login"
};

const ROLES: { key: Role; icon: string; labelKey: TranslationKey }[] = [
  { key: "diner", icon: "🍴", labelKey: "authSplit.roleDiner" },
  { key: "owner", icon: "🧑‍🍳", labelKey: "authSplit.roleOwner" },
  { key: "admin", icon: "🛡️", labelKey: "authSplit.roleAdmin" }
];

const FEATURES: { icon: ComponentType<{ className?: string }>; labelKey: TranslationKey }[] = [
  { icon: PhoneIcon, labelKey: "authSplit.featurePhone" },
  { icon: CashIcon, labelKey: "authSplit.featureKhqr" },
  { icon: ChairIcon, labelKey: "authSplit.featureTables" }
];

interface AuthSplitLayoutProps {
  activeRole: Role;
  children: ReactNode;
}

// Split-screen shell shared by the owner and admin sign-in pages: a brand
// panel on the left, role tabs + credential form on the right.
export function AuthSplitLayout({ activeRole, children }: AuthSplitLayoutProps) {
  const { t } = useLanguage();

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/hero-restaurant.png" alt="" fill priority sizes="50vw" className="object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(31,111,84,.93), rgba(21,80,60,.93))" }}
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" aria-label="TableSite" className="flex items-center gap-3">
            <Image
              src="/images/symbol_mark.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl"
            />
            <span className="disp text-xl font-extrabold">TableSite</span>
          </Link>

          <div>
            <h1 className="km disp text-4xl font-extrabold leading-tight">{t("authSplit.welcomeTitle")}</h1>
            <p className="km mt-4 max-w-md text-white/85">{t("authSplit.welcomeSubtitle")}</p>

            <div className="mt-9 space-y-4">
              {FEATURES.map(({ icon: Icon, labelKey }) => (
                <div key={labelKey} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="km text-sm text-white/90">{t(labelKey)}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/70">🇰🇭 KHQR · ABA · Wing · Bakong · ACLEDA</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-[420px]">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink"
          >
            <span aria-hidden="true">←</span>
            <span className="km">{t("authSplit.backToHome")}</span>
          </Link>

          <div className="mb-7 grid grid-cols-3 gap-2">
            {ROLES.map((role) => {
              const isActive = role.key === activeRole;
              return (
                <Link
                  key={role.key}
                  href={ROLE_HREF[role.key]}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-ink/25 hover:text-ink"
                  }`}
                >
                  <span aria-hidden="true">{role.icon}</span>
                  <span className="km">{t(role.labelKey)}</span>
                </Link>
              );
            })}
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}
