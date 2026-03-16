 "use client";

import { useState } from "react";

type VideoItem = {
  url: string;
  name: string;
};

const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? "";

type SortOrder = "recent" | "old";

function sortVideoItems(items: VideoItem[], order: SortOrder) {
  const sorted = [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
  );
  return order === "recent" ? sorted.reverse() : sorted;
}

export default function VideoRecordsPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    // Do not fetch here; only update state. Fetch is triggered
    // explicitly via the Search button.
  };

  const handleSearch = async () => {
    setError(null);
    setVideos([]);

    if (!selectedDate || !VIDEO_BASE_URL) {
      return;
    }

    // Only fire the request when the date is fully formed as YYYY-MM-DD.
    if (
      selectedDate.length < 10 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)
    ) {
      return;
    }

    const [yearStr, monthStr, dayStr] = selectedDate.split("-");
    if (!yearStr || !monthStr || !dayStr) {
      setError("Invalid date selected.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/video-records?date=${encodeURIComponent(selectedDate)}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch videos for ${selectedDate}.`);
      }

      const { html, listingUrl } = (await response.json()) as {
        html: string;
        listingUrl: string;
      };

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const links = Array.from(doc.querySelectorAll("a"));

      const videoItems: VideoItem[] = links
        .map((link) => {
          const href = link.getAttribute("href") ?? "";
          const text = link.textContent?.trim() ?? "";

          if (!href.toLowerCase().endsWith(".mp4")) {
            return null;
          }

          const videoUrl = href.startsWith("http")
            ? href
            : `${listingUrl}${href}`;

          const name = text || href;

          return {
            url: videoUrl,
            name,
          };
        })
        .filter((item): item is VideoItem => item !== null);

      setVideos(videoItems);
      if (videoItems.length === 0) {
        setError("No videos found for the selected date.");
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
            Select a date to view all recorded videos for that day.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <label
            htmlFor="video-date"
            className="text-xs font-medium text-[var(--color-text-secondary)]"
          >
            Date
          </label>
          <div className="flex items-center gap-2">
            <input
              id="video-date"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent min-w-[180px]"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !selectedDate}
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

      {!isLoading && !error && selectedDate && videos.length === 0 && (
        <div className="text-sm text-[var(--color-text-secondary)]">
          No videos found for the selected date.
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
                  className="w-full h-full"
                />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-[var(--color-text)] truncate">
                  {video.name}
                </p>
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

