"use client";

import { ChartCard } from "./ChartCard";

type CameraBreakdownProps = {
  data: Array<{ id: string; name: string; location: string; count: number }>;
  loading: boolean;
};

export function CameraBreakdownTable({ data, loading }: CameraBreakdownProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <ChartCard title="Detections by Camera" subtitle="Top cameras by detection count" loading={loading}>
      <div className="max-h-[300px] overflow-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-[var(--color-text-secondary)]">
            No data available
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Camera
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Location
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Detections
                </th>
                <th className="py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] w-32">
                  <span className="sr-only">Volume bar</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((camera, i) => (
                <tr
                  key={camera.id}
                  className={`transition-colors hover:bg-[var(--color-bg-hover)] ${
                    i < data.length - 1 ? "border-b border-[var(--color-border)]" : ""
                  }`}
                >
                  <td className="py-2.5 px-3 text-sm font-medium text-[var(--color-text)]">
                    {camera.name}
                  </td>
                  <td className="py-2.5 px-3 text-sm text-[var(--color-text-secondary)]">
                    {camera.location || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-sm font-semibold text-[var(--color-text)] text-right tabular-nums">
                    {camera.count.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="w-full h-2 rounded-full bg-[var(--color-bg-hover)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(camera.count / maxCount) * 100}%`,
                          background: "#10b981",
                        }}
                      />
                    </div>
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
