"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";

import { MenuIcon } from "@/components/ui/icons";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface DashboardShellProps {
  brand: string;
  navItems: DashboardNavItem[];
  userName: string;
  onLogout: () => void;
  children: ReactNode;
}

// Shared sidebar shell for the owner and admin sites: a fixed nav on
// desktop, a slide-in drawer on mobile, driven by a small nav-item list so
// each surface only wires up the sections it actually has.
export function DashboardShell({ brand, navItems, userName, onLogout, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string): boolean {
    if (pathname === href) return true;
    return href !== "/owner" && href !== "/admin" && pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <SidebarContent
          brand={brand}
          navItems={navItems}
          isActive={isActive}
          userName={userName}
          onLogout={onLogout}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              className="absolute left-0 top-0 flex h-full w-64 flex-col bg-surface"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <SidebarContent
                brand={brand}
                navItems={navItems}
                isActive={isActive}
                userName={userName}
                onLogout={onLogout}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-surface px-5 py-3.5 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-ink hover:bg-bg"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <span className="disp text-base font-extrabold text-ink">
            Table<span className="text-accent">Site</span> <span className="text-muted">{brand}</span>
          </span>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  brand: string;
  navItems: DashboardNavItem[];
  isActive: (href: string) => boolean;
  userName: string;
  onLogout: () => void;
  onNavigate?: () => void;
}

function SidebarContent({
  brand,
  navItems,
  isActive,
  userName,
  onLogout,
  onNavigate,
}: SidebarContentProps) {
  return (
    <>
      <div className="px-6 py-6">
        <span className="disp text-lg font-extrabold text-ink">
          Table<span className="text-accent">Site</span>
        </span>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-muted">{brand}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-accent/10 text-accent" : "text-ink hover:bg-bg"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border px-4 py-4">
        <p className="truncate px-1 text-sm font-semibold text-ink">{userName}</p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink transition hover:bg-bg"
        >
          Log out
        </button>
      </div>
    </>
  );
}
