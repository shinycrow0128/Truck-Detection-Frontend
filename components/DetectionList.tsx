"use client";

import { useState } from "react";
import type { TruckDetection } from "@/lib/supabase/types";

type DetectionListProps = {
  detections: TruckDetection[];
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function VideoWithDuration({
  src,
  poster,
  onDurationLoaded,
}: {
  src: string;
  poster?: string;
  onDurationLoaded: (duration: number) => void;
}) {
  return (
    <video
      src={src}
      controls
      className="w-full h-full object-cover"
      poster={poster}
      onLoadedMetadata={(e) => {
        const d = e.currentTarget.duration;
        if (Number.isFinite(d)) onDurationLoaded(d);
      }}
    />
  );
}

export function DetectionList({ detections }: DetectionListProps) {
  if (detections.length === 0) return null;

  return (
    <main className="flex-1 w-full px-2 py-6">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {detections.map((d) => (
          <DetectionCard key={d.id} detection={d} />
        ))}
      </div>
    </main>
  );
}

function DetectionCard({ detection: d }: { detection: TruckDetection }) {
  const [duration, setDuration] = useState<number | null>(null);

  return (
    <article
      className="bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-[var(--color-shadow)] hover:shadow-[var(--color-shadow-lg)] transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="aspect-video bg-[var(--color-bg-hover)] relative">
        {d.video_url ? (
          <VideoWithDuration
            src={d.video_url}
            poster={d.image_url ?? undefined}
            onDurationLoaded={setDuration}
          />
        ) : d.image_url ? (
          <img
            src={d.image_url}
            alt={`Detection ${d.id}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted-light)] text-sm">
            No media
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center gap-2 text-xs text-white/90">
          <span>{formatDate(d.detected_at)}</span>
          <div className="flex items-center gap-2">
            {duration !== null && (
              <span className="bg-black/40 px-2 py-0.5 rounded">
                {formatDuration(duration)}
              </span>
            )}
            {d.truck_status && (
              <span className="bg-black/40 px-2 py-0.5 rounded">
                {d.truck_status}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {d.truck?.truck_name ?? d.truck?.truck_number ?? "Truck"}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Camera: {d.camera?.camera_name ?? d.camera?.camera_location ?? d.camera_id.slice(0, 8)}
        </p>
        {d.bin_status && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Bin: {d.bin_status}
          </p>
        )}
      </div>
    </article>
  );
}
