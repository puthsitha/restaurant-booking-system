"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";

import { MenuIcon } from "@/components/ui/icons";

import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import type { NotificationItem } from "@/components/dashboard/NotificationBell";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

// Owner gets the warm orange brand accent; admin gets the distinct purple
// "platform" accent — both on a dark sidebar, matching the reference.
export type DashboardVariant = "owner" | "admin";

const VARIANT_STYLE: Record<
  DashboardVariant,
  { sidebarBg: string; accent: string; accentTint: string }
> = {
  owner: { sidebarBg: "bg-ownerSidebar", accent: "#C2410C", accentTint: "rgba(194,65,12,.16)" },
  admin: { sidebarBg: "bg-adminSidebar", accent: "#6D28D9", accentTint: "rgba(109,40,217,.18)" }
};

export interface DashboardNotifications {
  count: number;
  items: NotificationItem[];
  emptyLabel: string;
  viewAllHref: string;
  viewAllLabel: string;
}

interface DashboardShellProps {
  brand: string;
  variant: DashboardVariant;
  navItems: DashboardNavItem[];
  userName: string;
  onLogout: () => void;
  children: ReactNode;
  notifications?: DashboardNotifications;
}

// Shared sidebar shell for the owner and admin sites: a fixed dark nav on
// desktop, a slide-in drawer on mobile, driven by a small nav-item list so
// each surface only wires up the sections it actually has.
export function DashboardShell({
  brand,
  variant,
  navItems,
  userName,
  onLogout,
  children,
  notifications
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const style = VARIANT_STYLE[variant];

  function isActive(href: string): boolean {
    if (pathname === href) return true;
    return href !== "/owner" && href !== "/admin" && pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex min-h-screen bg-dashboardBg">
      <aside className={`sticky top-0 hidden h-screen w-64 shrink-0 flex-col ${style.sidebarBg} lg:flex`}>
        <SidebarContent
          brand={brand}
          style={style}
          navItems={navItems}
          isActive={isActive}
          userName={userName}
          onLogout={onLogout}
          notifications={notifications}
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
              className={`absolute left-0 top-0 flex h-full w-64 flex-col ${style.sidebarBg}`}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <SidebarContent
                brand={brand}
                style={style}
                navItems={navItems}
                isActive={isActive}
                userName={userName}
                onLogout={onLogout}
                notifications={notifications}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-dashboardBorder bg-surface px-5 py-3.5 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-ink hover:bg-bg"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <span className="disp text-base font-extrabold text-ink">
            Table<span style={{ color: style.accent }}>Site</span>{" "}
            <span className="text-muted">{brand}</span>
          </span>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  brand: string;
  style: (typeof VARIANT_STYLE)[DashboardVariant];
  navItems: DashboardNavItem[];
  isActive: (href: string) => boolean;
  userName: string;
  onLogout: () => void;
  notifications?: DashboardNotifications;
  onNavigate?: () => void;
}

function SidebarContent({
  brand,
  style,
  navItems,
  isActive,
  userName,
  onLogout,
  notifications,
  onNavigate
}: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold text-white"
          style={{ background: style.accent }}
        >
          T
        </div>
        <div className="min-w-0 flex-1">
          <span className="disp text-base font-extrabold text-white">TableSite</span>
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-sidebarMuted">
            {brand} panel
          </p>
        </div>
        {notifications && (
          <NotificationBell
            count={notifications.count}
            items={notifications.items}
            emptyLabel={notifications.emptyLabel}
            viewAllHref={notifications.viewAllHref}
            viewAllLabel={notifications.viewAllLabel}
            accent={style.accent}
          />
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sidebarText transition hover:bg-white/5"
              style={active ? { background: style.accentTint, color: "#fff" } : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {typeof item.badge === "number" && item.badge > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                  style={{ background: style.accent }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebarBorder px-4 py-4">
        <div className="flex items-center gap-2.5 px-1">
          <Avatar name={userName} size="sm" />
          <p className="truncate text-sm font-semibold text-white">{userName}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 w-full rounded-lg border border-sidebarBorder px-3 py-2 text-sm font-semibold text-sidebarText transition hover:bg-white/5"
        >
          Log out
        </button>
      </div>
    </>
  );
}
