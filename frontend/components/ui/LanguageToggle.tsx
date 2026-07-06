"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ChevronDownIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import type { Locale } from "@/lib/theme";

interface LanguageToggleProps {
  // "light" for surfaces on the customer bg/surface tokens, "dark" for the
  // always-dark owner/admin sidebar chrome.
  variant?: "light" | "dark";
}

const LANGUAGE_OPTIONS: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "/images/en_flag.png" },
  { value: "km", label: "ខ្មែរ", flag: "/images/km_flag.png" }
];

// Dropdown select for the two supported locales: shows the active flag +
// label on the trigger, and lets the user pick either option from a list.
export function LanguageToggle({ variant = "light" }: LanguageToggleProps) {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const current = LANGUAGE_OPTIONS.find((option) => option.value === locale) ?? LANGUAGE_OPTIONS[0];
  const buttonClass =
    variant === "dark"
      ? "text-sidebarText hover:bg-white/5"
      : "text-ink hover:bg-bg";
  const menuClass =
    variant === "dark"
      ? "border-sidebarBorder bg-ownerSidebar text-sidebarText"
      : "border-border bg-surface text-ink";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.language")}
        title={t("common.language")}
        className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold transition ${buttonClass}`}
      >
        <Image src={current.flag} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
        <span className="km">{current.value === "km" ? "ខ្មែរ" : "EN"}</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("common.language")}
          className={`absolute right-0 top-full z-40 mt-1.5 w-36 overflow-hidden rounded-lg border shadow-lg ${menuClass}`}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === locale}
                onClick={() => {
                  setLocale(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold transition hover:bg-black/5 ${
                  option.value === locale ? "opacity-100" : "opacity-80"
                }`}
              >
                <Image
                  src={option.flag}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full object-cover"
                />
                <span className="km">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
