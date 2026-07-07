"use client";

import Image from "next/image";
import type { ComponentType, ReactNode } from "react";

import { CashIcon, ChairIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";

type Role = "owner" | "admin";

const ROLE_OVERLAY: Record<Role, string> = {
  owner: "linear-gradient(160deg, rgba(194,65,12,.93), rgba(146,49,9,.93))",
  admin: "linear-gradient(160deg, rgba(31,111,84,.93), rgba(21,80,60,.93))"
};

const ROLE_SUBTITLE: Record<Role, TranslationKey> = {
  owner: "authSplit.welcomeSubtitleOwner",
  admin: "authSplit.welcomeSubtitleAdmin"
};

const ROLE_FOOTER: Record<Role, TranslationKey> = {
  owner: "authSplit.footerOwner",
  admin: "authSplit.footerAdmin"
};

const ROLE_FEATURES: Record<Role, { icon: ComponentType<{ className?: string }>; labelKey: TranslationKey }[]> = {
  owner: [
    { icon: PhoneIcon, labelKey: "authSplit.ownerFeaturePhone" },
    { icon: CashIcon, labelKey: "authSplit.ownerFeatureKhqr" },
    { icon: ChairIcon, labelKey: "authSplit.ownerFeatureTables" }
  ],
  admin: [
    { icon: PhoneIcon, labelKey: "authSplit.adminFeatureRequests" },
    { icon: CashIcon, labelKey: "authSplit.adminFeatureModerate" },
    { icon: ChairIcon, labelKey: "authSplit.adminFeatureSettings" }
  ]
};

interface AuthSplitLayoutProps {
  activeRole: Role;
  children: ReactNode;
}

// Split-screen shell shared by the owner and admin sign-in pages: a brand
// panel on the left, credential form on the right.
export function AuthSplitLayout({ activeRole, children }: AuthSplitLayoutProps) {
  const { t } = useLanguage();

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/hero-restaurant.png" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: ROLE_OVERLAY[activeRole] }} />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <Image
              src="/images/primary_logo.png"
              alt="TableSite"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl"
            />
            <span className="disp text-xl font-extrabold">TableSite</span>
          </div>

          <div>
            <h1 className="km disp text-4xl font-extrabold leading-tight">{t("authSplit.welcomeTitle")}</h1>
            <p className="km mt-4 max-w-md text-white/85">{t(ROLE_SUBTITLE[activeRole])}</p>

            <div className="mt-9 space-y-4">
              {ROLE_FEATURES[activeRole].map(({ icon: Icon, labelKey }) => (
                <div key={labelKey} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="km text-sm text-white/90">{t(labelKey)}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/70">{t(ROLE_FOOTER[activeRole])}</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </main>
  );
}
