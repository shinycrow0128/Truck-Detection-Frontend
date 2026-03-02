export function AccendLoader({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-8 py-6 shadow-xl">
        <div className="relative h-12 w-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
          <img
            src="https://www.accend.earth/hubfs/Web/Icons/Leaf-earth-icon.svg"
            alt="Accend"
            className="relative h-6 w-6"
          />
        </div>
        <div className="text-sm font-semibold text-[var(--color-text)]">
          Truck Monitor
        </div>
        <div className="text-xs text-[var(--color-text-secondary)]">
          {label ?? "Please wait…"}
        </div>
      </div>
    </div>
  );
}

