"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BellIcon } from "@/components/ui/icons";

export interface NotificationItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

interface NotificationBellProps {
  // Total pending count, shown on the badge — may exceed items.length since
  // items is just a capped preview.
  count: number;
  items: NotificationItem[];
  emptyLabel: string;
  viewAllHref: string;
  viewAllLabel: string;
  accent: string;
}

// Bell button + dropdown shared by the owner/admin sidebars: shows a live
// count of pending items (bookings for owners, restaurants for admins) and a
// preview list linking straight to the record.
export function NotificationBell({
  count,
  items,
  emptyLabel,
  viewAllHref,
  viewAllLabel,
  accent,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-sidebarText transition hover:bg-white/5"
      >
        <BellIcon className="h-5 w-5" />
        {count > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ background: accent }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-bold text-ink">Pending approval</p>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted">{emptyLabel}</p>
            ) : (
              <ul className="max-h-72 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 text-left transition hover:bg-bg"
                    >
                      <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                      {item.subtitle && (
                        <p className="truncate text-xs text-muted">{item.subtitle}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={viewAllHref}
              onClick={() => setOpen(false)}
              className="block border-t border-border px-4 py-2.5 text-center text-xs font-bold"
              style={{ color: accent }}
            >
              {viewAllLabel}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
