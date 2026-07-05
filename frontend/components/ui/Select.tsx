"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { CheckIcon, ChevronDownIcon } from "@/components/ui/icons";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// Custom listbox dropdown — a trigger button + animated floating panel —
// replacing the browser's native <select> look, which can't be restyled
// directly. Keeps listbox aria semantics and arrow-key/enter/escape
// navigation since we give up the native picker behavior.
export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  placeholder = "Select…",
  id,
  disabled,
  required,
  className
}: SelectProps<T>) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    function handleClick(e: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, selectedIndex]);

  function commit(index: number): void {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>): void {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(highlighted);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  const trigger = (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={selectId}
        disabled={disabled}
        data-required={required || undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-surface px-4 py-2.5 text-left text-sm font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? "border-accent ring-2 ring-accent/15" : "border-border hover:border-ink/20"
        } ${className ?? ""}`}
      >
        <span className={`truncate ${selected ? "text-ink" : "text-muted"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 max-h-64 w-full min-w-max overflow-auto rounded-2xl border border-border bg-surface p-1.5 shadow-lg"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlighted;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => commit(index)}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    option.disabled
                      ? "cursor-not-allowed opacity-40"
                      : isSelected
                        ? "bg-accent/10 text-accent"
                        : isHighlighted
                          ? "bg-bg text-ink"
                          : "text-ink"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-accent" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );

  if (!label) return trigger;

  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-xs font-bold text-label">
        {label}
      </label>
      {trigger}
    </div>
  );
}
