"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardNotifications } from "@/components/dashboard/DashboardShell";
import {
  CalendarIcon,
  ChefHatIcon,
  DashboardIcon,
  InboxIcon,
  SettingsIcon,
  TagIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { AdminAuthProvider, useAdminAuth } from "@/lib/auth/adminAuth";
import { listAllRestaurantsAdmin } from "@/lib/restaurants/api";

// The login page lives inside this tree for shared styling but must not be
// gated by the auth check below.
const PUBLIC_PATHS = ["/admin/login"];

// How often to re-check for newly-submitted restaurants while the admin has
// a page open — no push/websocket channel exists yet, so this is a simple poll.
const POLL_MS = 45_000;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, token, status, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const [pending, setPending] = useState<DashboardNotifications | null>(null);

  useEffect(() => {
    if (isPublicPath || status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [isPublicPath, status, router]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    function load(): void {
      if (!token) return;
      listAllRestaurantsAdmin({ status: "PENDING", page: 1, pageSize: 5 }, token)
        .then((res) => {
          if (cancelled) return;
          setPending({
            count: res.total,
            items: res.items.map((r) => ({
              id: r.id,
              title: r.name,
              subtitle: `${r.cuisineType} · ${r.city}`,
              href: `/admin/restaurants/${r.id}`,
            })),
            emptyLabel: "No restaurants awaiting review.",
            viewAllHref: "/admin/restaurants",
            viewAllLabel: "View all restaurants",
          });
        })
        .catch(() => undefined);
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: DashboardIcon },
    {
      href: "/admin/restaurants",
      label: "Restaurants",
      icon: ChefHatIcon,
      badge: pending?.count,
    },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarIcon },
    { href: "/admin/users", label: "Users", icon: UsersIcon },
    { href: "/admin/requests", label: "Requests", icon: InboxIcon },
    { href: "/admin/tags", label: "Tags", icon: TagIcon },
    { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  ];

  if (isPublicPath) {
    return <div className="admin-shell">{children}</div>;
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Checking your session…
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <DashboardShell
        brand="Admin"
        variant="admin"
        navItems={navItems}
        userName={user.name}
        notifications={pending ?? undefined}
        onLogout={() => {
          logout();
          router.replace("/admin/login");
        }}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
