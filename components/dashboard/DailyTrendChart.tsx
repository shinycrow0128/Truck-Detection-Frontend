"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "./ChartCard";

const STATUS_COLORS: Record<string, string> = {
  loaded: "#4a3afe",
  empty: "#0ea5e9",
  full: "#10b981",
  partial: "#f59e0b",
  unknown: "#94a3b8",
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS.unknown;
}

type DailyTrendProps = {
  data: Array<{ date: string; total: number; [key: string]: string | number }>;
  binStatuses: string[];
  loading: boolean;
};

export function DailyTrendChart({ data, binStatuses, loading }: DailyTrendProps) {
  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <ChartCard title="Daily Detection Trend" subtitle="Number of truck detections per day" loading={loading}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px var(--color-shadow-lg)",
                color: "var(--color-text)",
                fontSize: 13,
              }}
              labelFormatter={formatDate}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            />
            {binStatuses.length > 0 ? (
              binStatuses.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="stack"
                  fill={getStatusColor(status)}
                  radius={[0, 0, 0, 0]}
                  name={status.charAt(0).toUpperCase() + status.slice(1)}
                />
              ))
            ) : (
              <Bar
                dataKey="total"
                fill="#4a3afe"
                radius={[4, 4, 0, 0]}
                name="Detections"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
