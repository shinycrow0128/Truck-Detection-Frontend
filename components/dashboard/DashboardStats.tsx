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

const RANGE_OPTIONS = [
  { value: "1d", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

export function DashboardStats() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (selectedRange: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard-stats?range=${selectedRange}`);
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
    fetchStats(range);
  }, [range, fetchStats]);

  return (
    <main className="flex-1 flex flex-col p-6 gap-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Truck detection analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                range === opt.value
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          style={{ background: "var(--color-bg-elevated)" }}>
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
  );
}
