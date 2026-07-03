"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { BarChart } from "@/components/dashboard/BarChart";
import { DashboardHeaderBar } from "@/components/dashboard/DashboardHeaderBar";
import { Donut } from "@/components/dashboard/Donut";
import { StatCard } from "@/components/dashboard/StatCard";
import { ListSkeleton } from "@/components/ui/skeletons";
import { CalendarIcon, CashIcon, ChairIcon, UsersIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { trendFrom } from "@/lib/dashboardTrend";
import { getOwnerBookingStats, listOwnerReservations } from "@/lib/reservations/api";
import type { DailyBookingCount } from "@/lib/reservations/api";
import type { Reservation, ReservationStatus } from "@/lib/reservations/types";
import { listMyRestaurants, listTables } from "@/lib/restaurants/api";
import { theme } from "@/lib/theme";

const STATUS_TONE: Record<ReservationStatus, StatusTone> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SEATED: "seated",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "noShow"
};

interface TodaySnapshot {
  bookings: number;
  covers: number;
  pending: number;
  depositRevenue: number;
  seatedTables: number;
  totalTables: number;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function summarize(reservations: Reservation[]): { bookings: number; covers: number; pending: number; deposit: number } {
  return {
    bookings: reservations.length,
    covers: reservations.reduce((sum, r) => sum + r.partySize, 0),
    pending: reservations.filter((r) => r.status === "PENDING").length,
    deposit: reservations
      .filter((r) => r.depositPaid)
      .reduce((sum, r) => sum + Number(r.depositAmount), 0)
  };
}

export default function OwnerDashboardPage() {
  const { user, token } = useOwnerAuth();
  const [today, setToday] = useState<TodaySnapshot | null>(null);
  const [bookingsTrend, setBookingsTrend] = useState<ReturnType<typeof trendFrom>>(undefined);
  const [coversTrend, setCoversTrend] = useState<ReturnType<typeof trendFrom>>(undefined);
  const [recent, setRecent] = useState<Reservation[] | null>(null);
  const [chartData, setChartData] = useState<DailyBookingCount[] | null>(null);

  useEffect(() => {
    if (!token) return;
    getOwnerBookingStats(14, token)
      .then((res) => setChartData(res.days))
      .catch(() => setChartData(null));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const todayIso = toIsoDate(new Date());
    const yesterdayIso = toIsoDate(new Date(Date.now() - 86_400_000));

    Promise.all([
      listMyRestaurants({ pageSize: 50 }, token),
      listOwnerReservations({ date: todayIso, pageSize: 50 }, token),
      listOwnerReservations({ date: yesterdayIso, pageSize: 50 }, token),
      listOwnerReservations({ pageSize: 5 }, token)
    ])
      .then(async ([restaurants, todayRes, yesterdayRes, recentRes]) => {
        if (cancelled) return;

        const tableLists = await Promise.all(
          restaurants.items.map((r) => listTables(r.id, token)),
        );
        const allTables = tableLists.flatMap((t) => t.tables);

        const todaySummary = summarize(todayRes.items);
        const yesterdaySummary = summarize(yesterdayRes.items);

        setToday({
          bookings: todaySummary.bookings,
          covers: todaySummary.covers,
          pending: todaySummary.pending,
          depositRevenue: todaySummary.deposit,
          seatedTables: allTables.filter((t) => t.status === "SEATED").length,
          totalTables: allTables.length
        });
        setBookingsTrend(trendFrom(todaySummary.bookings, yesterdaySummary.bookings));
        setCoversTrend(trendFrom(todaySummary.covers, yesterdaySummary.covers));
        setRecent(recentRes.items);
      })
      .catch(() => {
        if (!cancelled) {
          setToday(null);
          setRecent(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const occupancyPct = today && today.totalTables > 0 ? Math.round((today.seatedTables / today.totalTables) * 100) : 0;

  return (
    <main className="p-8">
      <DashboardHeaderBar
        title={`Welcome back, ${user?.name.split(" ")[0] ?? ""}`}
        subtitle="Here's how today looks across your restaurants."
        actions={
          <Link
            href="/owner/bookings"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(194,65,12,.28)]"
          >
            + New reservation
          </Link>
        }
      />

      {today === null ? (
        <ListSkeleton rows={2} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CalendarIcon}
            label="Today's bookings"
            value={today.bookings}
            trend={bookingsTrend}
          />
          <StatCard icon={UsersIcon} label="Covers" value={today.covers} trend={coversTrend} tone="secondary" />
          <StatCard
            icon={ChairIcon}
            label="Occupancy"
            value={`${occupancyPct}%`}
            trend={
              today.totalTables > 0
                ? { label: `${today.seatedTables}/${today.totalTables} seated`, tone: "neutral" }
                : undefined
            }
          />
          <StatCard
            icon={CashIcon}
            label="Deposit revenue"
            value={`$${today.depositRevenue.toFixed(2)}`}
            trend={{
              label: `៛${Math.round(today.depositRevenue * theme.currency.usdToKhrRate).toLocaleString()}`,
              tone: "neutral"
            }}
            tone="secondary"
          />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        {chartData && chartData.some((d) => d.count > 0) && (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="disp text-sm font-bold text-ink">Bookings over time</h2>
            <p className="text-xs text-muted">Last 14 days</p>
            <BarChart data={chartData} className="mt-4" />
          </div>
        )}

        {today && (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="disp text-sm font-bold text-ink">Today at a glance</h2>
            <div className="mt-4 flex items-center gap-5">
              <Donut percent={occupancyPct} sublabel="occupied" />
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Tables seated</span>
                  <span className="font-bold text-ink">
                    {today.seatedTables} / {today.totalTables}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Total covers</span>
                  <span className="font-bold text-ink">{today.covers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Pending</span>
                  <span className="font-bold text-accent">{today.pending}</span>
                </div>
              </div>
            </div>
            <Link
              href="/owner/bookings"
              className="mt-4 block rounded-xl border border-border py-2.5 text-center text-sm font-bold text-ink transition hover:bg-bg"
            >
              View all reservations →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="disp text-sm font-bold text-ink">Recent reservations</h2>
          <Link href="/owner/bookings" className="text-xs font-bold text-accent">
            See all
          </Link>
        </div>

        {recent === null ? (
          <div className="mt-4">
            <ListSkeleton rows={3} />
          </div>
        ) : recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No reservations yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {recent.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={r.user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{r.user.name}</p>
                    <p className="text-xs text-muted">
                      {r.partySize} guests · {r.date.slice(0, 10)} at {r.time}
                      {r.table && ` · ${r.table.tableNumber}`}
                    </p>
                  </div>
                </div>
                <StatusBadge tone={STATUS_TONE[r.status]}>{r.status}</StatusBadge>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
