import type { InputHTMLAttributes } from "react";

import { SearchIcon } from "@/components/ui/icons";

// Text search box with a leading magnifier glyph, matching the visual
// treatment of Select/DateField so filter bars read as one cohesive set.
export function SearchField({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        {...rest}
        className={`w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition hover:border-ink/20 focus:border-accent focus:ring-2 focus:ring-accent/15 ${className ?? ""}`}
      />
    </div>
  );
}
