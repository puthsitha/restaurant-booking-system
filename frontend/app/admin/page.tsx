"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BarChart } from "@/components/dashboard/BarChart";
import { DashboardHeaderBar } from "@/components/dashboard/DashboardHeaderBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { ListSkeleton } from "@/components/ui/skeletons";
import { CalendarIcon, ChefHatIcon, InboxIcon, UsersIcon } from "@/components/ui/icons";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { getAdminBookingStats } from "@/lib/reservations/api";
import type { DailyBookingCount } from "@/lib/reservations/api";
import { listAllRestaurantRequests } from "@/lib/requests/api";
import { listAllRestaurantsAdmin } from "@/lib/restaurants/api";
import { listUsers } from "@/lib/users/api";

interface DashboardStats {
  totalUsers: number;
  totalOwners: number;
  activeRestaurants: number;
  totalRestaurants: number;
  pendingRequests: number;
}

export default function AdminDashboardPage() {
  const { user, token } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<DailyBookingCount[] | null>(null);

  useEffect(() => {
    if (!token) return;
    getAdminBookingStats(14, token)
      .then((res) => setChartData(res.days))
      .catch(() => setChartData(null));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([
      listUsers({ pageSize: 1 }, token),
      listUsers({ role: "OWNER", pageSize: 1 }, token),
      listAllRestaurantsAdmin({ pageSize: 1 }, token),
      listAllRestaurantsAdmin({ status: "ACTIVE", pageSize: 1 }, token),
      listAllRestaurantRequests({ status: "PENDING", pageSize: 1 }, token)
    ])
      .then(([users, owners, all, active, requests]) => {
        if (cancelled) return;
        setStats({
          totalUsers: users.total,
          totalOwners: owners.total,
          totalRestaurants: all.total,
          activeRestaurants: active.total,
          pendingRequests: requests.total
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
      <DashboardHeaderBar
        title={`Welcome back, ${user?.name.split(" ")[0] ?? ""}`}
        subtitle="Platform health at a glance."
        actions={
          <Link
            href="/admin/users"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(194,65,12,.28)]"
          >
            + Create owner
          </Link>
        }
      />

      {stats === null ? (
        <ListSkeleton rows={2} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={UsersIcon}
            label="Total users"
            value={stats.totalUsers}
            trend={{ label: `${stats.totalOwners} owners`, tone: "neutral" }}
          />
          <StatCard
            icon={ChefHatIcon}
            label="Owners"
            value={stats.totalOwners}
            tone="secondary"
          />
          <StatCard
            icon={CalendarIcon}
            label="Restaurants"
            value={`${stats.activeRestaurants} / ${stats.totalRestaurants}`}
            trend={{ label: "active", tone: "neutral" }}
          />
          <StatCard
            icon={InboxIcon}
            label="Pending requests"
            value={stats.pendingRequests}
            trend={
              stats.pendingRequests > 0
                ? { label: "needs review", tone: "positive" }
                : { label: "all clear", tone: "neutral" }
            }
            tone="secondary"
          />
        </div>
      )}

      {chartData && chartData.some((d) => d.count > 0) && (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
          <h2 className="disp text-sm font-bold text-ink">Platform bookings</h2>
          <p className="text-xs text-muted">Last 14 days</p>
          <BarChart data={chartData} className="mt-4" />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/restaurants"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink transition hover:bg-bg"
        >
          All restaurants
        </Link>
        <Link
          href="/admin/requests"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink transition hover:bg-bg"
        >
          Review requests
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink transition hover:bg-bg"
        >
          Manage users
        </Link>
        <Link
          href="/admin/tags"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink transition hover:bg-bg"
        >
          Manage tags
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink transition hover:bg-bg"
        >
          Platform settings
        </Link>
      </div>
    </main>
  );
}
