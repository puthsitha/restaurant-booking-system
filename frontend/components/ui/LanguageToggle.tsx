"use client";

import { GlobeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";

interface LanguageToggleProps {
  // "light" for surfaces on the customer bg/surface tokens, "dark" for the
  // always-dark owner/admin sidebar chrome.
  variant?: "light" | "dark";
}

// Only two locales exist (km/en), so a single click-to-switch button reads
// better than a dropdown — it shows the language you'd switch *to*.
export function LanguageToggle({ variant = "light" }: LanguageToggleProps) {
  const { locale, setLocale, t } = useLanguage();
  const next = locale === "km" ? "en" : "km";
  const buttonClass =
    variant === "dark"
      ? "text-sidebarText hover:bg-white/5"
      : "text-ink hover:bg-bg";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={t("common.language")}
      title={t("common.language")}
      className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold transition ${buttonClass}`}
    >
      <GlobeIcon className="h-5 w-5" />
      <span className="km">{next === "km" ? "ខ្មែរ" : "EN"}</span>
    </button>
  );
}
