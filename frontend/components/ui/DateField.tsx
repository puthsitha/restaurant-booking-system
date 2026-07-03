"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

import { CalendarIcon, ChevronDownIcon } from "@/components/ui/icons";

interface DateFieldProps {
  label?: string;
  value: string; // ISO yyyy-mm-dd, or "" for unset
  onChange: (e: { target: { value: string } }) => void;
  min?: string;
  max?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseIso(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Styled date picker: a button that opens an animated calendar popover
// (rather than the native OS date picker, which looks and behaves
// differently across browsers) with the app's own focus/hover treatment.
// `required` is accepted for API parity with the native-input callers but is
// a no-op here — there's no native form-validation hook on a button trigger,
// and every current caller already keeps `value` non-empty by default.
export function DateField({ label, value, onChange, min, max, id, className }: DateFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = parseIso(value);
  const minDate = min ? parseIso(min) : null;
  const maxDate = max ? parseIso(max) : null;

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selected ?? minDate ?? new Date());

  useEffect(() => {
    if (open) setViewDate(selected ?? minDate ?? new Date());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function isDisabled(day: Date): boolean {
    if (minDate && day < minDate) return true;
    if (maxDate && day > maxDate) return true;
    return false;
  }

  function selectDay(day: Date): void {
    if (isDisabled(day)) return;
    onChange({ target: { value: formatIso(day) } });
    setOpen(false);
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const leadingBlanks = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  const today = startOfDay(new Date());

  const field = (
    <div ref={rootRef} className="relative">
      <button
        id={fieldId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2 rounded-xl border border-border bg-surface py-2.5 pl-3.5 pr-3 text-left text-sm font-semibold outline-none transition hover:border-ink/20 focus:border-accent focus:ring-2 focus:ring-accent/15 ${selected ? "text-ink" : "text-muted"} ${className ?? ""}`}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted" />
        <span className="flex-1 truncate">{selected ? formatDisplay(selected) : "Select date"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-border bg-surface p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="rounded-lg p-1.5 text-muted transition hover:bg-bg hover:text-ink"
              >
                <ChevronDownIcon className="h-4 w-4 rotate-90" />
              </button>
              <p className="text-sm font-bold text-ink">
                {MONTH_LABELS[month]} {year}
              </p>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="rounded-lg p-1.5 text-muted transition hover:bg-bg hover:text-ink"
              >
                <ChevronDownIcon className="h-4 w-4 -rotate-90" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted">
              {WEEKDAY_LABELS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <span key={i} />;
                const disabled = isDisabled(day);
                const isSelected = selected ? isSameDay(day, selected) : false;
                const isToday = isSameDay(day, today);
                return (
                  <motion.button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDay(day)}
                    whileHover={disabled ? undefined : { scale: 1.12 }}
                    whileTap={disabled ? undefined : { scale: 0.9 }}
                    className={`aspect-square rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? "bg-accent text-white"
                        : isToday
                          ? "border border-accent/50 text-ink"
                          : disabled
                            ? "text-border"
                            : "text-ink hover:bg-bg"
                    }`}
                  >
                    {day.getDate()}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (!label) return field;

  return (
    <div>
      <label htmlFor={fieldId} className="mb-2 block text-xs font-bold text-label">
        {label}
      </label>
      {field}
    </div>
  );
}
