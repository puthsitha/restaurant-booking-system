"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { MouseEvent } from "react";

import { HeartIcon } from "@/components/ui/icons";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { useLanguage } from "@/lib/i18n/context";
import { useSavedRestaurants } from "@/lib/savedRestaurants/context";

interface FavoriteButtonProps {
  restaurantId: string;
  size?: "sm" | "md";
  className?: string;
}

const SIZE = {
  sm: { button: "h-8 w-8", icon: "h-4 w-4" },
  md: { button: "h-10 w-10", icon: "h-5 w-5" },
} as const;

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// Heart toggle shared by RestaurantCard and the restaurant detail page —
// pops on click and, when favoriting (not un-favoriting), throws a small
// radiating burst of dots for a satisfying "saved" moment.
export function FavoriteButton({ restaurantId, size = "md", className }: FavoriteButtonProps) {
  const { status } = useCustomerAuth();
  const { t } = useLanguage();
  const { savedIds, toggle } = useSavedRestaurants();
  const [bursting, setBursting] = useState(false);
  const dims = SIZE[size];

  if (status !== "authenticated") return null;

  const isSaved = savedIds.has(restaurantId);

  function handleClick(e: MouseEvent): void {
    e.preventDefault();
    const willBeSaved = !isSaved;
    toggle(restaurantId);
    if (willBeSaved) {
      setBursting(true);
      setTimeout(() => setBursting(false), 600);
    }
  }

  return (
    <button
      type="button"
      aria-label={isSaved ? t("common.removeFromSaved") : t("common.saveRestaurant")}
      aria-pressed={isSaved}
      onClick={handleClick}
      className={`flex items-center justify-center rounded-full bg-white/85 text-accent backdrop-blur transition hover:bg-white ${dims.button} ${className ?? ""}`}
    >
      <AnimatePresence>
        {bursting &&
          BURST_ANGLES.map((angle) => (
            <motion.span
              key={angle}
              className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent"
              style={{ marginLeft: -3, marginTop: -3 }}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{
                opacity: 0,
                x: Math.cos((angle * Math.PI) / 180) * 20,
                y: Math.sin((angle * Math.PI) / 180) * 20,
                scale: 0.3,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          ))}
      </AnimatePresence>
      <motion.span
        key={isSaved ? "saved" : "unsaved"}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 14 }}
        className="flex"
      >
        <HeartIcon className={dims.icon} filled={isSaved} />
      </motion.span>
    </button>
  );
}
