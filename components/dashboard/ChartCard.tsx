"use client";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  loading?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export function ChartCard({ title, subtitle, loading, children, actions }: ChartCardProps) {
  return (
    <div
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ boxShadow: `0 1px 3px var(--color-shadow)` }}
    >
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions}
      </div>
      <div className="px-5 pb-5">
        {loading ? (
          <div className="h-[220px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
