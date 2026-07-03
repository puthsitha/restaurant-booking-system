import type { ReactNode } from "react";

interface DashboardHeaderBarProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

// Full-bleed top header bar for a dashboard page — bleeds out to the edges
// of the surrounding `<main className="p-8">` via negative margins, matching
// the reference's white 68px header (title/subtitle left, primary action
// right) without needing a shared-layout change for a single page.
export function DashboardHeaderBar({ title, subtitle, actions }: DashboardHeaderBarProps) {
  return (
    <div className="-mx-8 -mt-8 mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-dashboardBorder bg-surface px-8 py-5">
      <div>
        <h1 className="disp text-xl font-extrabold text-ink">{title}</h1>
        <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
