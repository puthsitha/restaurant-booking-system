"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Image from "next/image";
import type {
  ComponentType,
  CSSProperties,
  PointerEvent,
  ReactNode,
} from "react";

import { CashIcon, ChairIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";

type Role = "owner" | "admin";

const ROLE_OVERLAY: Record<Role, string> = {
  owner: "linear-gradient(160deg, rgba(194,65,12,.93), rgba(146,49,9,.50))",
  admin: "linear-gradient(160deg, rgba(31,111,84,.93), rgba(21,80,60,.50))",
};

const ROLE_SUBTITLE: Record<Role, TranslationKey> = {
  owner: "authSplit.welcomeSubtitleOwner",
  admin: "authSplit.welcomeSubtitleAdmin",
};

const ROLE_FOOTER: Record<Role, TranslationKey> = {
  owner: "authSplit.footerOwner",
  admin: "authSplit.footerAdmin",
};

const ROLE_FEATURES: Record<
  Role,
  { icon: ComponentType<{ className?: string }>; labelKey: TranslationKey }[]
> = {
  owner: [
    { icon: PhoneIcon, labelKey: "authSplit.ownerFeatureAlerts" },
    { icon: CashIcon, labelKey: "authSplit.ownerFeatureKhqr" },
    { icon: ChairIcon, labelKey: "authSplit.ownerFeatureTables" },
  ],
  admin: [
    { icon: PhoneIcon, labelKey: "authSplit.adminFeatureRequests" },
    { icon: CashIcon, labelKey: "authSplit.adminFeatureModerate" },
    { icon: ChairIcon, labelKey: "authSplit.adminFeatureSettings" },
  ],
};

interface AuthSplitLayoutProps {
  activeRole: Role;
  children: ReactNode;
}

// Split-screen shell shared by the owner and admin sign-in pages: a brand
// panel on the left, credential form on the right.
export function AuthSplitLayout({
  activeRole,
  children,
}: AuthSplitLayoutProps) {
  const { t } = useLanguage();

  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const smoothX = useSpring(mx, { stiffness: 140, damping: 20, mass: 0.4 });
  const smoothY = useSpring(my, { stiffness: 140, damping: 20, mass: 0.4 });

  const radiusTarget = useMotionValue(0);
  const radius = useSpring(radiusTarget, { stiffness: 90, damping: 18 });

  // Same cursor-follow reveal as the customer homepage hero: the color
  // overlay is masked out in a circle around the pointer, uncovering the
  // photo underneath, and collapses back to nothing on pointer leave.
  const maskImage = useMotionTemplate`radial-gradient(circle ${radius}px at ${smoothX}% ${smoothY}%, transparent 0%, black 100%)`;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>): void {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden overflow-hidden lg:block"
        onPointerMove={handlePointerMove}
        onPointerEnter={() => radiusTarget.set(220)}
        onPointerLeave={() => radiusTarget.set(0)}
      >
        <Image
          src="/images/hero-restaurant.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <motion.div
          className="absolute inset-0"
          style={
            {
              background: ROLE_OVERLAY[activeRole],
              WebkitMaskImage: maskImage,
              maskImage,
            } as unknown as CSSProperties
          }
        />
        <div className="relative z-10 flex h-full flex-col p-12 text-white">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Image
              src="/images/primary_logo.png"
              alt="TableSite"
              width={128}
              height={128}
              className="h-24 w-24 rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,.35)] sm:h-28 sm:w-28"
            />
            <h1 className="km disp mt-8 max-w-md text-4xl font-extrabold leading-tight">
              {t("authSplit.welcomeTitle")}
            </h1>
            <p className="km mt-4 max-w-md text-white/85">
              {t(ROLE_SUBTITLE[activeRole])}
            </p>

            <div className="mt-9 w-full max-w-sm space-y-4 text-left">
              {ROLE_FEATURES[activeRole].map(({ icon: Icon, labelKey }) => (
                <div key={labelKey} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="km text-sm text-white/90">
                    {t(labelKey)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-white/70">
            {t(ROLE_FOOTER[activeRole])}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </main>
  );
}
