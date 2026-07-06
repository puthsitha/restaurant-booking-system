"use client";

import { motion } from "framer-motion";

import { useLanguage } from "@/lib/i18n/context";

interface BarChartDatum {
  date: string;
  count: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  className?: string;
}

// Small dependency-free SVG bar chart for bookings-over-time — no charting
// library is installed (per CLAUDE.md, no new deps without a clear reason),
// and the reference itself renders its charts as plain CSS/SVG bars.
export function BarChart({ data, className }: BarChartProps) {
  const { t } = useLanguage();
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className={`flex h-40 gap-1.5 ${className ?? ""}`}>
      {data.map((d, i) => (
        <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <motion.div
            // Latest day (today) is the solid accent bar the reference calls
            // out; every earlier day sits at a lighter accent tint.
            className={`w-full rounded-t-md ${i === data.length - 1 ? "bg-accent" : "bg-accent/[.22]"}`}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(d.count > 0 ? 3 : 0, (d.count / max) * 100)}%` }}
            transition={{ duration: 0.4, delay: i * 0.02, ease: "easeOut" }}
            title={t("common.bookingCountTooltip", {
              date: d.date,
              count: d.count,
              plural: d.count === 1 ? "" : "s",
            })}
          />
          <span className="text-[9px] text-muted">
            {new Date(d.date).toLocaleDateString(undefined, { day: "numeric" })}
          </span>
        </div>
      ))}
    </div>
  );
}
