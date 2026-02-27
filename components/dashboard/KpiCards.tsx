"use client";

type KpiData = {
  totalDetections: number;
  detectionChange: number;
  uniqueTrucks: number;
  totalTrucks: number;
  activeCameras: number;
  totalCameras: number;
   emptyTrucksOut: number;
   fullTrucksIn: number;
};

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  change,
  accentColor,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  change?: number;
  accentColor: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 transition-all duration-200 hover:shadow-lg hover:border-[var(--color-primary)]"
      style={{ boxShadow: `0 1px 3px var(--color-shadow)` }}>
      <div
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
        style={{ background: accentColor }}
      />
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
            {title}
          </span>
          <span className="text-2xl font-bold text-[var(--color-text)]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          {subtitle && (
            <span className="text-xs text-[var(--color-text-secondary)]">{subtitle}</span>
          )}
          {change !== undefined && (
            <span
              className={`text-xs font-medium ${
                change >= 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change}% vs previous period
            </span>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function KpiCards({ kpi, loading }: { kpi: KpiData; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[120px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      <KpiCard
        title="Total Detections"
        value={kpi.totalDetections}
        change={kpi.detectionChange}
        accentColor="#4a3afe"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
          </svg>
        }
      />
      <KpiCard
        title="Unique Trucks"
        value={kpi.uniqueTrucks}
        subtitle={`of ${kpi.totalTrucks} registered`}
        accentColor="#0ea5e9"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h1.5a.75.75 0 0 0 .75-.75V15Z" />
            <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.5-1.849V13.5a.75.75 0 0 0-.75-.75h-2.25V9a2.25 2.25 0 0 0-2.25-2.25H15.75Z" />
            <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
          </svg>
        }
      />
      <KpiCard
        title="Active Cameras"
        value={kpi.activeCameras}
        subtitle={`of ${kpi.totalCameras} installed`}
        accentColor="#10b981"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        }
      />
      <KpiCard
        title="Avg. Daily"
        value={
          kpi.totalDetections > 0
            ? Math.round(kpi.totalDetections / Math.max(1, 7))
            : 0
        }
        subtitle="detections per day"
        accentColor="#f59e0b"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
          </svg>
        }
      />
      <KpiCard
        title="Empty Trucks Out"
        value={kpi.emptyTrucksOut}
        subtitle="Empty Truck Bin, Outgoing"
        accentColor="#6366f1"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M4.5 5.25A2.25 2.25 0 0 1 6.75 3h6a2.25 2.25 0 0 1 2.25 2.25V7.5h2.25a2.25 2.25 0 0 1 2.12 1.56l1.27 3.81a2.25 2.25 0 0 1-2.13 2.97H18v1.38A2.38 2.38 0 0 1 15.62 19.5H6.88A2.38 2.38 0 0 1 4.5 17.12V5.25Zm2.25-.75a.75.75 0 0 0-.75.75V7.5h7.5V5.25a.75.75 0 0 0-.75-.75h-6Z" />
            <path d="M7.5 20.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15 20.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          </svg>
        }
      />
      <KpiCard
        title="Full Trucks On"
        value={kpi.fullTrucksIn}
        subtitle="Full Truck Bin, Incoming"
        accentColor="#22c55e"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M4.5 5.25A2.25 2.25 0 0 1 6.75 3h6a2.25 2.25 0 0 1 2.25 2.25V7.5h2.25a2.25 2.25 0 0 1 2.12 1.56l1.27 3.81a2.25 2.25 0 0 1-2.13 2.97H18v1.38A2.38 2.38 0 0 1 15.62 19.5H6.88A2.38 2.38 0 0 1 4.5 17.12V5.25Zm2.25 3a.75.75 0 0 0 0 1.5h5.25a.75.75 0 0 0 0-1.5H6.75Z" />
            <path d="M7.5 20.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15 20.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          </svg>
        }
      />
    </div>
  );
}
