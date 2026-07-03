"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<StarRatingInputProps["size"]>, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
};

const POP_KEYFRAME = [1, 1.4, 1];

// Interactive 1-5 star picker (for leaving/editing a review) — each star
// pops on the click that sets it, and gently scales on hover, distinct from
// the read-only `RatingStars` display component.
export function StarRatingInput({ value, onChange, size = "md", className }: StarRatingInputProps) {
  const [poppedStar, setPoppedStar] = useState<number | null>(null);

  function handleClick(n: number): void {
    onChange(n);
    setPoppedStar(n);
    setTimeout(() => setPoppedStar((current) => (current === n ? null : current)), 300);
  }

  return (
    <div className={`flex gap-1 ${className ?? ""}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return (
          <motion.button
            key={n}
            type="button"
            onClick={() => handleClick(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={SIZE_CLASS[size]}
            animate={{
              scale: poppedStar === n ? POP_KEYFRAME : 1,
              color: filled ? "#E8B04B" : "#D8CCBF",
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            ★
          </motion.button>
        );
      })}
    </div>
  );
}
