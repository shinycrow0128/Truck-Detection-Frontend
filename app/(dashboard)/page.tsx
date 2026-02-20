export default function DashboardPage() {
  return (
    <main className="flex-1 flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">View truck detections and camera feeds.</p>
      </div>
      <div className="flex-1 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <p className="text-[var(--color-text-secondary)] text-sm">Coming soon</p>
      </div>
    </main>
  );
}
