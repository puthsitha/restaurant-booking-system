"use client";

import Link from "next/link";

import { FacebookIcon, InstagramIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";

const SOCIAL_LINKS = [
  { label: "Facebook", icon: FacebookIcon },
  { label: "Instagram", icon: InstagramIcon },
  { label: "Phone", icon: PhoneIcon },
];

// Mirrors design/TableSite.reference.html's footer() renderer: dark ink
// background, brand blurb + socials, link columns, and a bottom bar with
// copyright + payment rails.
export function CustomerFooter() {
  const { t } = useLanguage();

  const footerColumns: { headingKey: TranslationKey; links: { label: string; href: string }[] }[] = [
    {
      headingKey: "customerFooter.discover",
      links: [
        { label: "Phnom Penh", href: "/search?city=Phnom%20Penh" },
        { label: "Siem Reap", href: "/search?city=Siem%20Reap" },
        { label: "Kampot", href: "/search?city=Kampot" },
        { label: t("customerFooter.fineDining"), href: "/search" },
      ],
    },
    {
      headingKey: "customerFooter.account",
      links: [{ label: t("customerHeader.myBookings"), href: "/bookings" }],
    },
  ];

  return (
    <footer className="mt-16 bg-scrim text-[#C9BCB0]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-8 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Link href="/" className="disp flex items-center gap-2.5 text-lg font-extrabold text-white">
            Table<span className="text-accent">Site</span>
          </Link>
          <p className="km mt-3.5 max-w-[280px] text-sm leading-relaxed text-[#9C8E82]">
            {t("customerFooter.blurb")}
          </p>
          <div className="mt-[18px] flex gap-2.5">
            {SOCIAL_LINKS.map((social) => (
              <span
                key={social.label}
                aria-label={social.label}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#332925] text-[#C9BCB0]"
              >
                <social.icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        {footerColumns.map((col) => (
          <div key={col.headingKey}>
            <div className="km mb-3.5 text-xs font-bold uppercase tracking-wider text-white">
              {t(col.headingKey)}
            </div>
            {col.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="km mb-2.5 block text-sm text-[#9C8E82] transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-[#332925]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-8 py-[18px] text-xs text-[#7E7064] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 TableSite Cambodia · កម្ពុជា</span>
          <span className="flex items-center gap-2">
            {t("customerFooter.poweredBy")} <strong className="text-[#C9BCB0]">KHQR</strong> · ABA ·
            Wing · Bakong · ACLEDA
          </span>
        </div>
      </div>
    </footer>
  );
}
