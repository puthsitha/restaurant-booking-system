"use client";

import { motion } from "framer-motion";

import { HeroReveal } from "@/components/home/HeroReveal";
import { SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { fadeUp, staggerContainer } from "@/lib/motion";

const FLOATING_CARDS: { emoji: string; labelKey: TranslationKey; top: string; left: string; duration: number }[] = [
  { emoji: "🍜", labelKey: "cuisines.khmer", top: "6%", left: "58%", duration: 5 },
  { emoji: "🦐", labelKey: "cuisines.seafood", top: "46%", left: "84%", duration: 6.5 },
  { emoji: "☕", labelKey: "cuisines.cafe", top: "70%", left: "56%", duration: 5.5 },
  { emoji: "🔥", labelKey: "cuisines.bbqGrill", top: "18%", left: "88%", duration: 7 },
];

// Hero section for the customer homepage — a client component so it can
// carry framer-motion (staggered entrance, drifting gradient blobs, floating
// cuisine cards, cursor-follow scene reveal) while the page itself stays a
// server component for data fetching. No image asset pipeline exists yet, so
// the visual interest comes entirely from animated gradients/shapes/SVG
// scenes rather than a photo.
export function HomeHero() {
  const { t } = useLanguage();
  const STATS = [
    { value: "150+", label: t("home.statRestaurants") },
    { value: "12", label: t("home.statProvinces") },
    { value: "KHQR", label: t("home.statReady") },
  ];

  return (
    <HeroReveal className="relative overflow-hidden px-8 py-24 text-white sm:py-32">
      {/* Slow-drifting glow blobs give the hero a sense of life without a
          photo — kept subtle (blurred, low opacity) so text stays legible. */}
      <motion.div
        className="absolute -top-32 left-1/4 -z-10 h-80 w-80 rounded-full bg-accent/40 blur-[100px]"
        animate={{ x: [0, 50, -20, 0], y: [0, 30, 60, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 right-0 -z-10 h-96 w-96 rounded-full bg-secondary/30 blur-[120px]"
        animate={{ x: [0, -40, 20, 0], y: [0, -30, -60, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating cuisine cards — desktop only, purely decorative. */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {FLOATING_CARDS.map((card, i) => (
          <motion.div
            key={card.labelKey}
            className="absolute rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center shadow-[0_12px_30px_rgba(0,0,0,.25)] backdrop-blur"
            style={{ top: card.top, left: card.left }}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: [0, -14, 0], scale: 1 }}
            transition={{
              opacity: { duration: 0.5, delay: 0.5 + i * 0.15 },
              scale: { duration: 0.5, delay: 0.5 + i * 0.15 },
              y: { duration: card.duration, repeat: Infinity, ease: "easeInOut", delay: 0.5 + i * 0.15 },
            }}
          >
            <span className="text-2xl">{card.emoji}</span>
            <p className="mt-1 whitespace-nowrap text-[11px] font-bold">{t(card.labelKey)}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative mx-auto max-w-[1280px]"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.span
          variants={fadeUp}
          className="km inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur"
        >
          {t("home.heroTagline")}
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="disp mt-4 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl"
        >
          {t("home.heroTitlePrefix")}{" "}
          <span
            className="bg-gradient-to-r from-[#F4A261] to-[#FFD9B8] bg-clip-text text-transparent"
          >
            {t("home.heroTitleHighlight")}
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
          {t("home.heroSubtitle")}
        </motion.p>

        <motion.form
          variants={fadeUp}
          action="/search"
          className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_22px_50px_rgba(0,0,0,.28)] transition-shadow focus-within:shadow-[0_22px_60px_rgba(194,65,12,.35)] sm:flex-row"
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="search"
              placeholder={t("home.searchPlaceholder")}
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-ink outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(194,65,12,.28)] transition hover:brightness-110"
          >
            {t("home.search")}
          </button>
        </motion.form>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="disp text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </HeroReveal>
  );
}
