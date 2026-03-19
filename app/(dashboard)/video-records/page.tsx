 "use client";

import { useEffect, useState } from "react";

type VideoItem = {
  url: string;
  name: string;
  date: string; // YYYY-MM-DD
};

type SortOrder = "recent" | "old";

function sortVideoItems(items: VideoItem[], order: SortOrder) {
  const sorted = [...items].sort((a, b) => {
    // date ascending, then name ascending
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  });
  return order === "recent" ? sorted.reverse() : sorted;
}

const toISODate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function VideoRecordsPage() {
  const [mounted, setMounted] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) {
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      setStartDate(toISODate(start));
      setEndDate(toISODate(end));
      setMounted(true);
    }
  }, [mounted]);

  const handleSearch = async () => {
    setError(null);
    setVideos([]);

    if (!startDate || !endDate) {
      return;
    }

    // Only fire the request when the dates are fully formed as YYYY-MM-DD.
    if (
      startDate.length < 10 ||
      endDate.length < 10 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      return;
    }

    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      setError("Invalid date range selected.");
      return;
    }

    try {
      setIsLoading(true);
      const params = new URLSearchParams({ start: startDate, end: endDate });
      const response = await fetch(`/api/video-records?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch videos for ${startDate} → ${endDate}.`);
      }

      const { items } = (await response.json()) as {
        items: VideoItem[];
      };

      setVideos(items);
      if (items.length === 0) {
        setError("No videos found for the selected period.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load videos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            Video Records
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Select a date range to view recorded videos in that period.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-bg-elevated)]/95 via-[var(--color-bg-elevated)] to-[var(--color-bg-elevated)] px-3 py-2 shadow-sm">
          <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-4 h-4"
            >
              <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
              <path d="M8 3v3.5M16 3v3.5" />
              <path d="M3.5 10h17" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="peer w-[9.5rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/40 hover:border-[var(--color-primary)]/60"
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[var(--color-text-secondary)] peer-focus:text-[var(--color-primary)]">
                ▼
              </span>
            </div>

            <div className="relative">
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="peer w-[9.5rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/40 hover:border-[var(--color-primary)]/60"
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[var(--color-text-secondary)] peer-focus:text-[var(--color-primary)]">
                ▼
              </span>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading || !startDate || !endDate}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-[var(--color-text-secondary)]">
          Loading videos…
        </div>
      )}

      {error && !isLoading && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {!isLoading && !error && startDate && endDate && videos.length === 0 && (
        <div className="text-sm text-[var(--color-text-secondary)]">
          No videos found for the selected period.
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--color-text-secondary)]">
              Showing {videos.length} video{videos.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <label
                htmlFor="video-sort"
                className="text-xs font-medium text-[var(--color-text-secondary)]"
              >
                Sort
              </label>
              <select
                id="video-sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="old">Start of Day</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sortVideoItems(videos, sortOrder).map((video) => (
            <div
              key={video.url}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden flex flex-col"
            >
              <div className="aspect-video bg-[var(--color-bg)]">
                <video
                  src={video.url}
                  controls
                  preload="metadata"
                  className="w-full h-full"
                  onEnded={(e) => {
                    // Reset to the initial state (first frame / before-play view)
                    // instead of staying on the last frame.
                    const el = e.currentTarget;
                    try {
                      el.pause();
                      el.currentTime = 0;
                      // Reload to ensure the UI returns to the pre-play poster/first-frame view
                      // consistently across browsers.
                      el.load();
                    } catch {
                      // no-op
                    }
                  }}
                />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--color-text)] truncate">
                    {video.name}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    {video.date}
                  </p>
                </div>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-[var(--color-primary)] hover:underline shrink-0"
                >
                  Open
                </a>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}

