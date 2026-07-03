"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { MonitorIcon, MoonIcon, SunIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useTheme } from "@/lib/theme/context";
import type { ThemeMode } from "@/lib/theme/context";

const MODES: { mode: ThemeMode; icon: typeof SunIcon; labelKey: TranslationKey }[] = [
  { mode: "light", icon: SunIcon, labelKey: "common.themeLight" },
  { mode: "dark", icon: MoonIcon, labelKey: "common.themeDark" },
  { mode: "system", icon: MonitorIcon, labelKey: "common.themeSystem" }
];

interface ThemeToggleProps {
  // "light" for surfaces on the customer bg/surface tokens, "dark" for the
  // always-dark owner/admin sidebar chrome.
  variant?: "light" | "dark";
}

// Icon button + dropdown for picking light/dark/system, mirroring the
// NotificationBell interaction pattern so it feels native to both the
// customer header and the owner/admin sidebar.
export function ThemeToggle({ variant = "light" }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const ActiveIcon = MODES.find((m) => m.mode === mode)?.icon ?? SunIcon;
  const buttonClass =
    variant === "dark"
      ? "text-sidebarText hover:bg-white/5"
      : "text-ink hover:bg-bg";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("common.theme")}
        className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition ${buttonClass}`}
      >
        <ActiveIcon className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
          >
            {MODES.map(({ mode: optionMode, icon: Icon, labelKey }) => (
              <button
                key={optionMode}
                type="button"
                onClick={() => {
                  setMode(optionMode);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-bg"
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{t(labelKey)}</span>
                {mode === optionMode && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
