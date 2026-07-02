"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StatCard } from "@/components/dashboard/StatCard";
import { ListSkeleton } from "@/components/ui/skeletons";
import { CalendarIcon, ChefHatIcon, InboxIcon } from "@/components/ui/icons";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { listOwnerReservations } from "@/lib/reservations/api";
import { listMyRestaurantRequests } from "@/lib/requests/api";
import { listMyRestaurants } from "@/lib/restaurants/api";

interface DashboardStats {
  restaurantCount: number;
  restaurantLimit: number;
  pendingBookings: number;
  totalBookings: number;
  hasPendingRequest: boolean;
}

export default function OwnerDashboardPage() {
  const { user, token } = useOwnerAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([
      listMyRestaurants(token),
      listOwnerReservations({ status: "PENDING", pageSize: 1 }, token),
      listOwnerReservations({ pageSize: 1 }, token),
      listMyRestaurantRequests(token),
    ])
      .then(([restaurants, pending, total, requests]) => {
        if (cancelled) return;
        setStats({
          restaurantCount: restaurants.restaurants.length,
          restaurantLimit: user?.restaurantLimit ?? 0,
          pendingBookings: pending.total,
          totalBookings: total.total,
          hasPendingRequest: requests.requests.some((r) => r.status === "PENDING"),
        });
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });

    return () => {
      cancelled = true;
    };
  }, [token, user?.restaurantLimit]);

  return (
    <main style={{ padding: 32 }}>
      <h1 className="disp text-2xl font-extrabold text-ink">
        Welcome back, {user?.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-muted">Here&apos;s how your restaurants are doing.</p>

      {stats === null ? (
        <div className="mt-8">
          <ListSkeleton rows={2} />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ChefHatIcon}
            label="Restaurants"
            value={`${stats.restaurantCount} / ${stats.restaurantLimit}`}
            hint={stats.restaurantCount >= stats.restaurantLimit ? "At your limit" : "Slots available"}
          />
          <StatCard
            icon={CalendarIcon}
            label="Pending bookings"
            value={stats.pendingBookings}
            hint="Awaiting confirmation"
            tone="secondary"
          />
          <StatCard icon={CalendarIcon} label="Total bookings" value={stats.totalBookings} />
          <StatCard
            icon={InboxIcon}
            label="Limit requests"
            value={stats.hasPendingRequest ? "Pending" : "None"}
            hint={stats.hasPendingRequest ? "Awaiting admin review" : "All caught up"}
            tone="secondary"
          />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/owner/restaurants"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          Manage restaurants
        </Link>
        <Link
          href="/owner/bookings"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink"
        >
          View bookings
        </Link>
        {stats && stats.restaurantCount >= stats.restaurantLimit && !stats.hasPendingRequest && (
          <Link
            href="/owner/requests"
            className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink"
          >
            Request more restaurants
          </Link>
        )}
      </div>
    </main>
  );
}
