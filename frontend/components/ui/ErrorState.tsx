"use client";

import { SpilledBowlIcon } from "@/components/ui/icons";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

// A spilled bowl rather than a generic red triangle — stays on-concept and
// gives the error a little personality (subtle jiggle) without being
// alarming. Announced via role="alert" so screen readers pick it up.
export function ErrorState({
  title = "Something spilled in the kitchen",
  message = "We couldn't load this. Give it another try.",
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center ${className ?? ""}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent motion-safe:animate-ts-jiggle">
        <SpilledBowlIcon className="h-8 w-8" />
      </div>
      <h3 className="disp text-lg font-bold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
