"use client";

import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main style={{ padding: 32 }}>
      <h1 className="disp text-2xl font-extrabold text-ink">Platform admin</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Moderate restaurants and manage the platform-wide tag list.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/restaurants"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          All restaurants
        </Link>
        <Link
          href="/admin/tags"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink"
        >
          Manage tags
        </Link>
      </div>
    </main>
  );
}
