"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { theme } from "@/lib/theme";
import type { Locale } from "@/lib/theme";

import { dictionaries, getMessage } from "./translations";
import type { TranslationKey, TranslationParams } from "./translations";

export const LOCALE_STORAGE_KEY = "tablesite-locale";

// Each surface (customer, owner, admin) keeps its own locale so switching
// language on one never affects the others.
export type LanguageScope = "customer" | "owner" | "admin";

function storageKeyFor(scope: LanguageScope): string {
  return scope === "customer" ? LOCALE_STORAGE_KEY : `${LOCALE_STORAGE_KEY}-${scope}`;
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  scope = "customer"
}: {
  children: ReactNode;
  scope?: LanguageScope;
}) {
  const [locale, setLocaleState] = useState<Locale>(theme.defaultLocale);
  const storageKey = storageKeyFor(scope);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored && (theme.locales as readonly string[]).includes(stored)) {
      setLocaleState(stored as Locale);
    }
  }, [storageKey]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      window.localStorage.setItem(storageKey, next);
    },
    [storageKey]
  );

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => getMessage(dictionaries[locale], key, params),
    [locale]
  );

  const value = useMemo<LanguageContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
