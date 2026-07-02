import Link from "next/link";
import type { ComponentType } from "react";

import { EmptyPlateIcon } from "@/components/ui/icons";

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

// Encouraging, not a dead end: every empty state gets a next step. Defaults
// to the empty-plate icon with a gentle bounce so it feels inviting rather
// than broken.
export function EmptyState({
  icon: Icon = EmptyPlateIcon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-border bg-surface text-center ${
        compact ? "px-5 py-8" : "px-6 py-16"
      } ${className ?? ""}`}
    >
      <div
        className={`flex items-center justify-center rounded-full bg-accent/10 text-accent motion-safe:animate-ts-bounce-soft ${
          compact ? "h-10 w-10" : "h-16 w-16"
        }`}
      >
        <Icon className={compact ? "h-5 w-5" : "h-8 w-8"} />
      </div>
      <h3 className={`disp font-bold text-ink ${compact ? "text-sm" : "text-lg"}`}>{title}</h3>
      {message && (
        <p className={`max-w-sm text-muted ${compact ? "text-xs" : "text-sm"}`}>{message}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
