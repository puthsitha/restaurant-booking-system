"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardNotifications } from "@/components/dashboard/DashboardShell";
import { CalendarIcon, ChefHatIcon, DashboardIcon, InboxIcon } from "@/components/ui/icons";
import { OwnerAuthProvider, useOwnerAuth } from "@/lib/auth/ownerAuth";
import { listOwnerReservations } from "@/lib/reservations/api";

// Login lives inside this tree for shared styling but must not be gated by
// the auth check below. There's no owner signup — an admin provisions owner
// accounts from User Management instead.
const PUBLIC_PATHS = ["/owner/login"];

// How often to re-check for new pending bookings while the owner has a page
// open — no push/websocket channel exists yet, so this is a simple poll.
const POLL_MS = 45_000;

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OwnerAuthProvider>
      <OwnerShell>{children}</OwnerShell>
    </OwnerAuthProvider>
  );
}

function OwnerShell({ children }: { children: React.ReactNode }) {
  const { user, token, status, logout } = useOwnerAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const [pending, setPending] = useState<DashboardNotifications | null>(null);

  useEffect(() => {
    if (isPublicPath || status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/owner/login");
    }
  }, [isPublicPath, status, router]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    function load(): void {
      if (!token) return;
      listOwnerReservations({ status: "PENDING", page: 1, pageSize: 5 }, token)
        .then((res) => {
          if (cancelled) return;
          setPending({
            count: res.total,
            items: res.items.map((r) => ({
              id: r.id,
              title: `${r.user.name} · ${r.partySize} guests`,
              subtitle: `${r.restaurant.name} · ${r.date.slice(0, 10)} at ${r.time}`,
              href: "/owner/bookings",
            })),
            emptyLabel: "No pending bookings.",
            viewAllHref: "/owner/bookings",
            viewAllLabel: "View all bookings",
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
    { href: "/owner", label: "Dashboard", icon: DashboardIcon },
    { href: "/owner/restaurants", label: "Restaurants", icon: ChefHatIcon },
    {
      href: "/owner/bookings",
      label: "Bookings",
      icon: CalendarIcon,
      badge: pending?.count,
    },
    { href: "/owner/requests", label: "Requests", icon: InboxIcon },
  ];

  if (isPublicPath) {
    return <div className="owner-shell">{children}</div>;
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Checking your session…
      </div>
    );
  }

  return (
    <div className="owner-shell">
      <DashboardShell
        brand="Owner"
        variant="owner"
        navItems={navItems}
        userName={user.name}
        userAvatarUrl={user.avatarUrl}
        notifications={pending ?? undefined}
        onLogout={() => {
          logout();
          router.replace("/owner/login");
        }}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
