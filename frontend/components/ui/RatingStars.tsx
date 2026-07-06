"use client";

import { useLanguage } from "@/lib/i18n/context";

interface RatingStarsProps {
  rating: number; // 0..5, fractional allowed for averages
  size?: "sm" | "md";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<RatingStarsProps["size"]>, string> = {
  sm: "text-xs gap-0.5",
  md: "text-base gap-1"
};

// Five-star rating display (gold filled vs. muted outline), rounded to the
// nearest half star. Read-only — used for review summaries and cards.
export function RatingStars({ rating, size = "sm", className }: RatingStarsProps) {
  const { t } = useLanguage();
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span
      className={`inline-flex items-center ${SIZE_CLASS[size]} ${className ?? ""}`}
      role="img"
      aria-label={t("common.outOfFiveStars", { rating: rating.toFixed(1) })}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i + 1 <= rounded;
        const half = !filled && i + 0.5 === rounded;
        return (
          <span key={i} style={{ color: filled || half ? "#E8B04B" : "#D8CCBF" }}>
            {half ? "◑" : "★"}
          </span>
        );
      })}
    </span>
  );
}
