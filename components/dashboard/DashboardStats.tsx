"use client";

import { useCallback, useEffect, useState } from "react";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { DailyTrendChart } from "@/components/dashboard/DailyTrendChart";
import { HourlyChart } from "@/components/dashboard/HourlyChart";
import { BinStatusChart } from "@/components/dashboard/BinStatusChart";
import { TruckStatusChart } from "@/components/dashboard/TruckStatusChart";
import { TruckBreakdownTable } from "@/components/dashboard/TruckBreakdownTable";
import { CameraBreakdownTable } from "@/components/dashboard/CameraBreakdownTable";
import { RecentDetections } from "@/components/dashboard/RecentDetections";

export type DashboardData = {
  kpi: {
    totalDetections: number;
    detectionChange: number;
    uniqueTrucks: number;
    totalTrucks: number;
    activeCameras: number;
    totalCameras: number;
    emptyTrucksOut: number;
    fullTrucksIn: number;
  };
  dailyTrend: Array<{ date: string; total: number; [key: string]: string | number }>;
  hourlyDistribution: Array<{ hour: string; detections: number }>;
  truckBreakdown: Array<{ id: string; name: string; number: string; count: number }>;
  cameraBreakdown: Array<{ id: string; name: string; location: string; count: number }>;
  binStatusDistribution: Array<{ status: string; count: number }>;
  truckStatusDistribution: Array<{ status: string; count: number }>;
  recentDetections: Array<{
    id: string;
    detected_at: string;
    bin_status: string | null;
    truck_status: string | null;
    truck_name: string;
    camera_name: string;
  }>;
  allBinStatuses: string[];
};

export function DashboardStats() {
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ start, end });
      const res = await fetch(`/api/dashboard-stats?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      return;
    }

    fetchStats(startDate, endDate);
  }, [startDate, endDate, fetchStats]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <header className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] px-4 py-4 shadow-sm transition-colors duration-300">
        <div className="w-full flex flex-wrap items-center gap-4 sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-[var(--color-text)]">Dashboard</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Truck detection analytics and insights
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-bg-elevated)]/95 via-[var(--color-bg-elevated)] to-[var(--color-bg-elevated)] px-3 py-2 shadow-sm">
            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-4 h-4"
              >
                <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
                <path d="M8 3v3.5M16 3v3.5" />
                <path d="M3.5 10h17" />
              </svg>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="peer w-[9.5rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/40 hover:border-[var(--color-primary)]/60"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[var(--color-text-secondary)] peer-focus:text-[var(--color-primary)]">
                  ▼
                </span>
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="peer w-[9.5rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/40 hover:border-[var(--color-primary)]/60"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[var(--color-text-secondary)] peer-focus:text-[var(--color-primary)]">
                  ▼
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 gap-6 overflow-auto">
        {/* Error State */}
        {error && (
          <div
            className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
            style={{ background: "var(--color-bg-elevated)" }}
          >
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[var(--color-text-secondary)]">Loading analytics...</p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <div className="flex flex-col gap-6">
            {/* KPI Cards */}
            <KpiCards kpi={data.kpi} loading={loading} />

            {/* Daily Trend Chart - Full Width */}
            <DailyTrendChart
              data={data.dailyTrend}
              binStatuses={data.allBinStatuses}
              loading={loading}
            />

            {/* Hourly Distribution + Status Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <HourlyChart data={data.hourlyDistribution} loading={loading} />
              <BinStatusChart data={data.binStatusDistribution} loading={loading} />
              <TruckStatusChart data={data.truckStatusDistribution} loading={loading} />
            </div>

            {/* Truck & Camera Breakdown Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TruckBreakdownTable data={data.truckBreakdown} loading={loading} />
              <CameraBreakdownTable data={data.cameraBreakdown} loading={loading} />
            </div>

            {/* Recent Detections */}
            <RecentDetections data={data.recentDetections} loading={loading} />
          </div>
        )}
      </main>
    </div>
  );
}
