"use client";

import { useCallback, useEffect, useState } from "react";

import { ClosuresTab } from "@/components/restaurants/manage/ClosuresTab";
import { GalleryTab } from "@/components/restaurants/manage/GalleryTab";
import { HoursTab } from "@/components/restaurants/manage/HoursTab";
import { MenuTab } from "@/components/restaurants/manage/MenuTab";
import { ProfileTab } from "@/components/restaurants/manage/ProfileTab";
import { TablesTab } from "@/components/restaurants/manage/TablesTab";
import { TagsTab } from "@/components/restaurants/manage/TagsTab";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { getRestaurant, updateRestaurantStatus } from "@/lib/restaurants/api";
import type { RestaurantManagementDetail } from "@/lib/restaurants/types";

const OWNER_TABS = [
  { key: "profile", label: "Profile" },
  { key: "hours", label: "Hours" },
  { key: "tables", label: "Tables" },
  { key: "menu", label: "Menu" },
  { key: "gallery", label: "Gallery" },
  { key: "closures", label: "Closures" },
  { key: "tags", label: "Tags" },
] as const;

type TabKey = (typeof OWNER_TABS)[number]["key"];

export default function ManageRestaurantPage({ params }: { params: { id: string } }) {
  const { user, token } = useAuth();
  const [restaurant, setRestaurant] = useState<RestaurantManagementDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("profile");

  const isAdmin = user?.role === "ADMIN";

  const reload = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const res = await getRestaurant(params.id, token);
      setRestaurant(res.restaurant);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load this restaurant.");
    }
  }, [params.id, token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleToggleStatus(): Promise<void> {
    if (!token || !restaurant) return;
    const nextStatus = restaurant.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      await updateRestaurantStatus(restaurant.id, nextStatus, token);
      setRestaurant({ ...restaurant, status: nextStatus });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update status");
    }
  }

  if (error) {
    return (
      <main style={{ padding: 32 }}>
        <ErrorState message={error} onRetry={reload} />
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main style={{ padding: 32 }}>
        <LoadingSpinner label="Setting up the kitchen…" size="lg" />
      </main>
    );
  }

  if (isAdmin) {
    return (
      <main style={{ maxWidth: 720, padding: 32 }}>
        <h1 className="disp text-2xl font-extrabold text-ink">{restaurant.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {restaurant.cuisineType} · {restaurant.address}, {restaurant.city}
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Current status</p>
          <p className="mt-1 text-lg font-bold text-ink">{restaurant.status}</p>
          <button
            onClick={handleToggleStatus}
            className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white"
          >
            {restaurant.status === "ACTIVE" ? "Disable restaurant" : "Enable restaurant"}
          </button>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted">Owner</dt>
            <dd className="text-ink">{restaurant.ownerId}</dd>
          </div>
          <div>
            <dt className="text-muted">Menus</dt>
            <dd className="text-ink">{restaurant.menus.length}</dd>
          </div>
          <div>
            <dt className="text-muted">Tables</dt>
            <dd className="text-ink">{restaurant.tables.length}</dd>
          </div>
          <div>
            <dt className="text-muted">Tags</dt>
            <dd className="text-ink">{restaurant.tags.map((t) => t.name).join(", ") || "—"}</dd>
          </div>
        </dl>
      </main>
    );
  }

  return (
    <main style={{ padding: 32 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-muted">/{restaurant.slug}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            restaurant.status === "ACTIVE"
              ? "bg-secondary/10 text-secondary"
              : "bg-red-100 text-red-700"
          }`}
        >
          {restaurant.status}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {OWNER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold ${
              tab === t.key
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "profile" && (
          <ProfileTab restaurant={restaurant} token={token!} onSaved={reload} />
        )}
        {tab === "hours" && <HoursTab restaurant={restaurant} token={token!} onSaved={reload} />}
        {tab === "tables" && (
          <TablesTab restaurant={restaurant} token={token!} onSaved={reload} />
        )}
        {tab === "menu" && <MenuTab restaurant={restaurant} token={token!} onSaved={reload} />}
        {tab === "gallery" && (
          <GalleryTab restaurant={restaurant} token={token!} onSaved={reload} />
        )}
        {tab === "closures" && (
          <ClosuresTab restaurant={restaurant} token={token!} onSaved={reload} />
        )}
        {tab === "tags" && <TagsTab restaurant={restaurant} token={token!} onSaved={reload} />}
      </div>
    </main>
  );
}
