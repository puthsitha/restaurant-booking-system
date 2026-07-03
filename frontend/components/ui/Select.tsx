import { useId } from "react";
import type { SelectHTMLAttributes } from "react";

import { ChevronDownIcon } from "@/components/ui/icons";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

// Styled dropdown: a native <select> (for accessibility/mobile-native
// pickers) dressed up with a custom chevron and the app's focus/hover
// treatment, since the browser default look can't be restyled directly.
export function Select({ label, id, className, children, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const select = (
    <div className="relative">
      <select
        id={selectId}
        {...rest}
        className={`w-full appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-10 text-sm font-semibold text-ink outline-none transition hover:border-ink/20 focus:border-accent focus:ring-2 focus:ring-accent/15 ${className ?? ""}`}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );

  if (!label) return select;

  return (
    <div>
      <label htmlFor={selectId} className="mb-2 block text-xs font-bold text-label">
        {label}
      </label>
      {select}
    </div>
  );
}
