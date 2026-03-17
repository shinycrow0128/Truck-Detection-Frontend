"use client";

import { useEffect, useMemo, useState } from "react";
import type { TruckDetection } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase/types";

type DetectionListProps = {
  detections: TruckDetection[];
  onDetectionUpdated?: (updated: Pick<TruckDetection, "id" | "bin_status" | "truck_status">) => void;
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
      className="w-full h-full object-contain"
      poster={poster}
      preload="metadata"
      onLoadedMetadata={(e) => {
        const d = e.currentTarget.duration;
        if (Number.isFinite(d)) onDurationLoaded(d);
      }}
      onEnded={(e) => {
        // After finishing, return to the initial poster/preview instead of
        // staying on the last frame.
        const el = e.currentTarget;
        try {
          el.pause();
          el.currentTime = 0;
          el.load();
        } catch {
          // no-op
        }
      }}
    />
  );
}

export function DetectionList({ detections, onDetectionUpdated }: DetectionListProps) {
  if (detections.length === 0) return null;

  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.id) {
          if (!cancelled) setUserRole(null);
          return;
        }

        const { data: profile } = await supabase
          .from("profile")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const role = profile && "role" in profile ? (profile.role as UserRole) : null;
        if (!cancelled) setUserRole(role);
      } catch {
        if (!cancelled) setUserRole(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAdmin = useMemo(() => userRole === "admin", [userRole]);

  return (
    <main className="flex-1 w-full px-2 py-6">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {detections.map((d) => (
          <DetectionCard
            key={d.id}
            detection={d}
            isAdmin={isAdmin}
            onDetectionUpdated={onDetectionUpdated}
          />
        ))}
      </div>
    </main>
  );
}

type TruckStatus = "incoming" | "outgoing";
type BinStatus = "full" | "empty";

function normalizeTruckStatus(value: string | null): TruckStatus | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "incoming") return "incoming";
  if (v === "outgoing") return "outgoing";
  return null;
}

function normalizeBinStatus(value: string | null): BinStatus | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "full") return "full";
  if (v === "empty") return "empty";
  return null;
}

function titleCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function DetectionCard({
  detection: d,
  isAdmin,
  onDetectionUpdated,
}: {
  detection: TruckDetection;
  isAdmin: boolean;
  onDetectionUpdated?: (updated: Pick<TruckDetection, "id" | "bin_status" | "truck_status">) => void;
}) {
  const [duration, setDuration] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTruckStatus, setDraftTruckStatus] = useState<TruckStatus>(
    normalizeTruckStatus(d.truck_status) ?? "incoming",
  );
  const [draftBinStatus, setDraftBinStatus] = useState<BinStatus>(
    normalizeBinStatus(d.bin_status) ?? "empty",
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openEditor = () => {
    setSaveError(null);
    setDraftTruckStatus(normalizeTruckStatus(d.truck_status) ?? "incoming");
    setDraftBinStatus(normalizeBinStatus(d.bin_status) ?? "empty");
    setIsEditing(true);
  };

  const closeEditor = () => {
    setSaveError(null);
    setIsEditing(false);
  };

  const save = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/truck-detections/${d.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          truck_status: draftTruckStatus,
          bin_status: draftBinStatus,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { data?: { id: number; truck_status: string | null; bin_status: string | null }; error?: string }
        | null;

      if (!res.ok) {
        throw new Error(json?.error || "Failed to update detection");
      }

      const next = json?.data;
      if (!next) throw new Error("Update succeeded but returned no data");

      onDetectionUpdated?.({
        id: next.id,
        truck_status: next.truck_status,
        bin_status: next.bin_status,
      });
      closeEditor();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

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
            className="w-full h-full object-contain"
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
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-[var(--color-text)] truncate min-w-0">
            {d.truck?.truck_name ?? d.truck?.truck_number ?? "Truck"}
          </p>

          {isAdmin && !isEditing ? (
            <button
              type="button"
              onClick={openEditor}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
              aria-label="Edit incoming/outgoing and bin status"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M21.73 2.27a2.625 2.625 0 0 0-3.712 0l-1.5 1.5 3.712 3.712 1.5-1.5a2.625 2.625 0 0 0 0-3.712Z" />
                <path d="M19.8 8.7 16.1 5l-9.6 9.6a.75.75 0 0 0-.2.34l-.9 3.6a.75.75 0 0 0 .91.91l3.6-.9a.75.75 0 0 0 .34-.2l9.55-9.55Z" />
                <path d="M4.5 20.25a.75.75 0 0 1-.75-.75v-11a.75.75 0 0 1 1.5 0v11h11a.75.75 0 0 1 0 1.5h-11Z" />
              </svg>
              <span>Edit</span>
            </button>
          ) : null}
        </div>

        <p className="text-xs text-[var(--color-text-secondary)] truncate">
          Camera:{" "}
          {d.camera?.camera_name ?? d.camera?.camera_location ?? d.camera_id.slice(0, 8)}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {d.truck_status ? (
            <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-2 py-0.5 text-[11px] text-[var(--color-text-secondary)]">
              Truck: {titleCase(d.truck_status)}
            </span>
          ) : null}
          {d.bin_status ? (
            <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-2 py-0.5 text-[11px] text-[var(--color-text-secondary)]">
              Bin: {titleCase(d.bin_status)}
            </span>
          ) : null}
        </div>

        {isAdmin && isEditing ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5">
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                  Truck
                </span>
                <select
                  value={draftTruckStatus}
                  onChange={(e) =>
                    setDraftTruckStatus(e.target.value as TruckStatus)
                  }
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                  disabled={saving}
                >
                  <option value="incoming">Incoming</option>
                  <option value="outgoing">Outgoing</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                  Bin
                </span>
                <select
                  value={draftBinStatus}
                  onChange={(e) => setDraftBinStatus(e.target.value as BinStatus)}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                  disabled={saving}
                >
                  <option value="full">Full</option>
                  <option value="empty">Empty</option>
                </select>
              </label>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-md bg-[var(--color-primary)] px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            {saveError ? (
              <p className="mt-2 text-[11px] text-red-600">{saveError}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
