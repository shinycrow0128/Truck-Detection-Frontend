export function EmptyState() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="relative max-w-md w-full text-center">
        {/* Decorative background elements */}
        <div
          className="absolute -left-20 -top-10 w-40 h-40 rounded-full opacity-30 blur-xl animate-pulse"
          style={{ background: "var(--color-decorative)" }}
          aria-hidden
        />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 opacity-20 blur-lg animate-pulse"
          style={{ background: "var(--color-decorative)" }}
          aria-hidden
        />
        <div
          className="absolute -right-16 top-1/3 w-32 h-32 rounded-full opacity-25 blur-2xl animate-pulse"
          style={{ background: "var(--color-decorative)" }}
          aria-hidden
        />

        <div className="relative z-10 bg-[color-mix(in_lab,var(--color-background)_80%,white_20%)] dark:bg-[color-mix(in_lab,var(--color-background)_85%,black_15%)] border border-white/10 shadow-xl rounded-2xl px-8 py-10 flex flex-col items-center gap-4 backdrop-blur-sm">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--color-decorative)]/15 border border-[var(--color-decorative)]/30 shadow-md animate-bounce">
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,var(--color-decorative)_0%,transparent_55%)] opacity-70" />
            <svg
              className="relative w-9 h-9 text-[var(--color-decorative)] drop-shadow"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <rect
                x="3"
                y="5"
                width="14"
                height="12"
                rx="2"
                className="fill-current"
                opacity="0.12"
              />
              <path
                d="M9.5 9.5L13 12l-3.5 2.5v-5z"
                className="fill-current"
              />
              <rect
                x="15"
                y="9"
                width="5"
                height="6"
                rx="1"
                className="fill-current"
                opacity="0.25"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              No videos yet
            </h1>
            <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto">
              When you upload or select a video, you&apos;ll see your truck detections and analytics appear here in real time.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
