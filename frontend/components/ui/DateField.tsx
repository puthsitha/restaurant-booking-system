import { useId } from "react";
import type { InputHTMLAttributes } from "react";

import { CalendarIcon } from "@/components/ui/icons";

interface DateFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// Styled date picker: a native <input type="date"> (keeps the OS/browser's
// real calendar UI, which we don't want to reimplement) dressed up with a
// leading calendar glyph and the app's focus/hover treatment.
export function DateField({ label, id, className, ...rest }: DateFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const field = (
    <div className="relative">
      <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        id={inputId}
        type="date"
        {...rest}
        className={`w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm font-semibold text-ink outline-none transition hover:border-ink/20 focus:border-accent focus:ring-2 focus:ring-accent/15 ${className ?? ""}`}
      />
    </div>
  );

  if (!label) return field;

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-xs font-bold text-label">
        {label}
      </label>
      {field}
    </div>
  );
}
