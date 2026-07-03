"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}

// Pill-shaped segmented toggle (List/Map, Table/Timeline, Upcoming/Past)
// with the active segment sliding via a shared layoutId — matches the
// reference's segmented-control pattern.
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className
}: SegmentedControlProps<T>) {
  const layoutId = useId();
  return (
    <div
      className={`inline-flex rounded-xl border border-border bg-bg p-1 ${className ?? ""}`}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className="relative rounded-lg px-4 py-1.5 text-sm font-bold transition-colors"
          >
            {active && (
              <motion.span
                layoutId={`segmented-active-${layoutId}`}
                className="absolute inset-0 rounded-lg bg-surface shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <span className={`relative ${active ? "text-ink" : "text-muted"}`}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
