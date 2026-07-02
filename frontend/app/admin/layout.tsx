"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AdminAuthProvider, useAdminAuth } from "@/lib/auth/adminAuth";

// The login page lives inside this tree for shared styling but must not be
// gated by the auth check below.
const PUBLIC_PATHS = ["/admin/login"];

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
    <div className="admin-shell min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4">
        <span className="disp text-lg font-extrabold text-ink">
          Table<span className="text-accent">Site</span> Admin
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink">{user.name}</span>
          <button
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink"
          >
            Log out
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
