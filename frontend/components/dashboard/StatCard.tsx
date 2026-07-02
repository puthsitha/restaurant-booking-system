"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  hint?: string;
  tone?: "accent" | "secondary";
}

export function StatCard({ label, value, icon: Icon, hint, tone = "accent" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          tone === "accent" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="disp mt-4 text-2xl font-extrabold text-ink">{value}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </motion.div>
  );
}
