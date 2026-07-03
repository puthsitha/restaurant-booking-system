"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StatCard } from "@/components/dashboard/StatCard";
import { ListSkeleton } from "@/components/ui/skeletons";
import { CalendarIcon, ChefHatIcon, InboxIcon, UsersIcon } from "@/components/ui/icons";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { listAllReservationsAdmin } from "@/lib/reservations/api";
import { listAllRestaurantRequests } from "@/lib/requests/api";
import { listAllRestaurantsAdmin } from "@/lib/restaurants/api";
import { listUsers } from "@/lib/users/api";

interface DashboardStats {
  activeRestaurants: number;
  totalRestaurants: number;
  totalBookings: number;
  totalUsers: number;
  pendingRequests: number;
}

export default function AdminDashboardPage() {
  const { user, token } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([
      listAllRestaurantsAdmin({ pageSize: 1 }, token),
      listAllRestaurantsAdmin({ status: "ACTIVE", pageSize: 1 }, token),
      listAllReservationsAdmin({ pageSize: 1 }, token),
      listUsers({ pageSize: 1 }, token),
      listAllRestaurantRequests({ status: "PENDING", pageSize: 1 }, token),
    ])
      .then(([all, active, bookings, users, requests]) => {
        if (cancelled) return;
        setStats({
          totalRestaurants: all.total,
          activeRestaurants: active.total,
          totalBookings: bookings.total,
          totalUsers: users.total,
          pendingRequests: requests.total,
        });
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">Welcome back, {user?.name.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-muted">Platform overview across every restaurant.</p>

      {stats === null ? (
        <div className="mt-8">
          <ListSkeleton rows={2} />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ChefHatIcon}
            label="Restaurants"
            value={`${stats.activeRestaurants} / ${stats.totalRestaurants}`}
            hint="Active of total"
          />
          <StatCard icon={CalendarIcon} label="Bookings" value={stats.totalBookings} tone="secondary" />
          <StatCard icon={UsersIcon} label="Diners & owners" value={stats.totalUsers} />
          <StatCard
            icon={InboxIcon}
            label="Pending requests"
            value={stats.pendingRequests}
            hint={stats.pendingRequests > 0 ? "Needs your review" : "All caught up"}
            tone="secondary"
          />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/restaurants"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          All restaurants
        </Link>
        <Link
          href="/admin/requests"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink"
        >
          Review requests
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink"
        >
          Manage users
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
