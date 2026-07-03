"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  CalendarIcon,
  ChefHatIcon,
  DashboardIcon,
  InboxIcon,
  TagIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { AdminAuthProvider, useAdminAuth } from "@/lib/auth/adminAuth";

// The login page lives inside this tree for shared styling but must not be
// gated by the auth check below.
const PUBLIC_PATHS = ["/admin/login"];

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/restaurants", label: "Restaurants", icon: ChefHatIcon },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/requests", label: "Requests", icon: InboxIcon },
  { href: "/admin/tags", label: "Tags", icon: TagIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, status, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublicPath || status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [isPublicPath, status, router]);

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
        navItems={NAV_ITEMS}
        userName={user.name}
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
