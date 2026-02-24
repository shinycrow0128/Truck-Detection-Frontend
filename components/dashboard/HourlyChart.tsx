"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "./ChartCard";

type HourlyChartProps = {
  data: Array<{ hour: string; detections: number }>;
  loading: boolean;
};

export function HourlyChart({ data, loading }: HourlyChartProps) {
  return (
    <ChartCard title="Hourly Activity" subtitle="Detection volume by hour of day" loading={loading}>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a3afe" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4a3afe" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis
              dataKey="hour"
              tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
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
            />
            <Area
              type="monotone"
              dataKey="detections"
              stroke="#4a3afe"
              strokeWidth={2}
              fill="url(#hourlyGradient)"
              name="Detections"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
