export function EmptyState() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="relative max-w-md w-full text-center">
        {/* Decorative background elements */}
        <div
          className="absolute -left-20 -top-10 w-40 h-40 rounded-full opacity-30"
          style={{ background: "var(--color-decorative)" }}
          aria-hidden
        />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 opacity-20"
          style={{ background: "var(--color-decorative)" }}
          aria-hidden
        />
        <div
          className="absolute -right-16 top-1/3 w-32 h-32 rounded-full opacity-25"
          style={{ background: "var(--color-decorative)" }}
          aria-hidden
        />

        <h1 className="text-2xl font-bold text-gray-800 mb-3 relative">
          No Videos Yet.
        </h1>
        <p className="text-[var(--color-muted)] text-sm mb-6 relative">
          You have not set up an Advanced Data Protection code. It is recommended
          to upgrade.{" "}
          <a
            href="#"
            className="text-[var(--color-primary)] hover:underline focus:outline-none focus:underline"
          >
            Learn More
          </a>
        </p>
        <div className="flex flex-col gap-3 relative">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-white font-medium transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            Turn On Data Protection &gt;
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-medium border-2 transition-colors"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            How to Upload Videos to Your Cloud Library &gt;
          </a>
          <a
            href="#"
            className="text-[var(--color-primary)] text-sm hover:underline focus:outline-none focus:underline"
          >
            Shop Reolink Cameras
          </a>
        </div>
      </div>
    </main>
  );
}
