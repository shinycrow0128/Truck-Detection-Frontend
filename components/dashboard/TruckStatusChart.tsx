"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "./ChartCard";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#4a3afe", "#94a3b8"];

type TruckStatusChartProps = {
  data: Array<{ status: string; count: number }>;
  loading: boolean;
};

export function TruckStatusChart({ data, loading }: TruckStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ChartCard title="Truck Status" subtitle="Distribution of truck statuses" loading={loading}>
      <div className="h-[220px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-secondary)]">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px var(--color-shadow-lg)",
                  color: "var(--color-text)",
                  fontSize: 13,
                }}
                formatter={(value: number, name: string) => [
                  `${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <Legend
                formatter={(value: string) => (
                  <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
