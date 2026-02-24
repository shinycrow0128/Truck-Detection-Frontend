export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] px-4 py-4 shadow-sm transition-colors duration-300">
        <div className="w-full flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-[var(--color-text)]">Settings</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Configure your application preferences.
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col p-6">
        <div className="flex-1 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          <p className="text-[var(--color-text-secondary)] text-sm">Coming soon</p>
        </div>
      </main>
    </div>
  );
}
