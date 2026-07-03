"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CalendarIcon, ChefHatIcon, DashboardIcon, InboxIcon } from "@/components/ui/icons";
import { OwnerAuthProvider, useOwnerAuth } from "@/lib/auth/ownerAuth";

// Login lives inside this tree for shared styling but must not be gated by
// the auth check below. There's no owner signup — an admin provisions owner
// accounts from User Management instead.
const PUBLIC_PATHS = ["/owner/login"];

const NAV_ITEMS = [
  { href: "/owner", label: "Dashboard", icon: DashboardIcon },
  { href: "/owner/restaurants", label: "Restaurants", icon: ChefHatIcon },
  { href: "/owner/bookings", label: "Bookings", icon: CalendarIcon },
  { href: "/owner/requests", label: "Requests", icon: InboxIcon },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OwnerAuthProvider>
      <OwnerShell>{children}</OwnerShell>
    </OwnerAuthProvider>
  );
}

function OwnerShell({ children }: { children: React.ReactNode }) {
  const { user, status, logout } = useOwnerAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublicPath || status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/owner/login");
    }
  }, [isPublicPath, status, router]);

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
        navItems={NAV_ITEMS}
        userName={user.name}
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
