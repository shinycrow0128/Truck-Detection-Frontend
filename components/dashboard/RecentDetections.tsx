"use client";

import { ChartCard } from "./ChartCard";

type RecentDetectionsProps = {
  data: Array<{
    id: string;
    detected_at: string;
    bin_status: string | null;
    truck_status: string | null;
    truck_name: string;
    camera_name: string;
  }>;
  loading: boolean;
};

function StatusBadge({ status, type }: { status: string | null; type: "bin" | "truck" }) {
  const label = status || "unknown";
  const colorMap: Record<string, string> = {
    loaded: "bg-indigo-100 text-indigo-800",
    empty: "bg-sky-100 text-sky-800",
    full: "bg-emerald-100 text-emerald-800",
    partial: "bg-amber-100 text-amber-800",
    active: "bg-emerald-100 text-emerald-800",
    inactive: "bg-gray-100 text-gray-800",
    unknown: "bg-gray-100 text-gray-600",
  };

  const darkColorMap: Record<string, string> = {
    loaded: "bg-indigo-950/50 text-indigo-300",
    empty: "bg-sky-950/50 text-sky-300",
    full: "bg-emerald-950/50 text-emerald-300",
    partial: "bg-amber-950/50 text-amber-300",
    active: "bg-emerald-950/50 text-emerald-300",
    inactive: "bg-gray-800/50 text-gray-400",
    unknown: "bg-gray-800/50 text-gray-400",
  };

  // We'll use light colors by default, as the theme detection requires JavaScript runtime
  const lightClass = colorMap[label.toLowerCase()] || colorMap.unknown;
  const darkClass = darkColorMap[label.toLowerCase()] || darkColorMap.unknown;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${lightClass}`}
      data-dark-class={darkClass}>
      {type === "bin" ? "Bin: " : "Truck: "}
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

export function RecentDetections({ data, loading }: RecentDetectionsProps) {
  const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ChartCard title="Recent Detections" subtitle="Latest 10 truck detections" loading={loading}>
      <div className="overflow-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-[var(--color-text-secondary)]">
            No recent detections
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Time
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Truck
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Camera
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Bin Status
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Truck Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr
                  key={d.id}
                  className={`transition-colors hover:bg-[var(--color-bg-hover)] ${
                    i < data.length - 1 ? "border-b border-[var(--color-border)]" : ""
                  }`}
                >
                  <td className="py-2.5 px-3 text-sm text-[var(--color-text-secondary)] whitespace-nowrap tabular-nums">
                    {formatDateTime(d.detected_at)}
                  </td>
                  <td className="py-2.5 px-3 text-sm font-medium text-[var(--color-text)]">
                    {d.truck_name}
                  </td>
                  <td className="py-2.5 px-3 text-sm text-[var(--color-text-secondary)]">
                    {d.camera_name}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={d.bin_status} type="bin" />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={d.truck_status} type="truck" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ChartCard>
  );
}
