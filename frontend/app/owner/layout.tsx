"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { OwnerAuthProvider, useOwnerAuth } from "@/lib/auth/ownerAuth";

// Login/signup live inside this tree for shared styling but must not be
// gated by the auth check below.
const PUBLIC_PATHS = ["/owner/login", "/owner/signup"];

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
    <div className="owner-shell min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4">
        <span className="disp text-lg font-extrabold text-ink">
          Table<span className="text-accent">Site</span> Owner
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink">{user.name}</span>
          <button
            onClick={() => {
              logout();
              router.replace("/owner/login");
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
