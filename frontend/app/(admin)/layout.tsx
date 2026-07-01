"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth/AuthContext";

// Login/signup pages live inside this same route group (for shared styling)
// but must not be gated by the auth check below.
const PUBLIC_PATHS = ["/login", "/signup"];

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, status, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublicPath || status === "loading") return;
    if (status === "unauthenticated" || user?.role === "DINER") {
      router.replace("/login");
    }
  }, [isPublicPath, status, user, router]);

  if (isPublicPath) {
    return <div className="admin-shell">{children}</div>;
  }

  if (status !== "authenticated" || !user || user.role === "DINER") {
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
          <span className="text-sm text-ink">
            {user.name} <span className="text-muted">· {user.role}</span>
          </span>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
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
