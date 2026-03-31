"use client";

import { useEffect, useMemo, useState } from "react";
import type { TruckDetection } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase/types";

type DetectionListProps = {
  detections: TruckDetection[];
  onDetectionUpdated?: (updated: Pick<TruckDetection, "id" | "bin_status" | "truck_status">) => void;
  onDetectionDeleted?: (deletedId: TruckDetection["id"]) => void;
};

function getDateKeyFromISO(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, "0");
    // Use UTC to avoid browser timezone shifting the calendar day.
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  } catch {
    return iso;
  }
}

function formatDate(iso: string) {
  try {
    // Render in UTC so the timestamp matches the media filename time.
    return new Date(iso).toLocaleString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
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

export function DetectionList({ detections, onDetectionUpdated, onDetectionDeleted }: DetectionListProps) {
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

  const groupedDetections = useMemo(() => {
    const groups: Array<{ date: string; items: TruckDetection[] }> = [];
    const indexByDate = new Map<string, number>();

    for (const d of detections) {
      const dateKey = getDateKeyFromISO(d.detected_at);
      const idx = indexByDate.get(dateKey);
      if (idx === undefined) {
        indexByDate.set(dateKey, groups.length);
        groups.push({ date: dateKey, items: [d] });
      } else {
        groups[idx].items.push(d);
      }
    }

    return groups;
  }, [detections]);

  return (
    <main className="flex-1 w-full px-3 sm:px-4 py-6">
      <div className="space-y-6">
        {groupedDetections.map((group) => (
          <section key={group.date} className="space-y-3">
            <div className="flex items-center justify-between gap-3 px-1">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">{group.date}</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {group.items.length} record{group.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {group.items.map((d) => (
                <DetectionCard
                  key={d.id}
                  detection={d}
                  isAdmin={isAdmin}
                  onDetectionUpdated={onDetectionUpdated}
                  onDetectionDeleted={onDetectionDeleted}
                />
              ))}
            </div>
          </section>
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

function statusChipClasses(kind: "truck" | "bin", value: string) {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none";
  if (kind === "truck") {
    if (value === "incoming") {
      return `${base} border-emerald-200/60 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200`;
    }
    if (value === "outgoing") {
      return `${base} border-blue-200/60 bg-blue-50/70 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200`;
    }
  }
  if (kind === "bin") {
    if (value === "full") {
      return `${base} border-amber-200/60 bg-amber-50/70 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200`;
    }
    if (value === "empty") {
      return `${base} border-slate-200/70 bg-slate-50/70 text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200`;
    }
  }
  return `${base} border-[var(--color-border)] bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]`;
}

function DetectionCard({
  detection: d,
  isAdmin,
  onDetectionUpdated,
  onDetectionDeleted,
}: {
  detection: TruckDetection;
  isAdmin: boolean;
  onDetectionUpdated?: (updated: Pick<TruckDetection, "id" | "bin_status" | "truck_status">) => void;
  onDetectionDeleted?: (deletedId: TruckDetection["id"]) => void;
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
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const remove = async () => {
    const confirmed = window.confirm("Delete this video clip record? This action cannot be undone.");
    if (!confirmed) return;

    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/truck-detections/${d.id}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;

      if (!res.ok) {
        throw new Error(json?.error || "Failed to delete detection");
      }

      onDetectionDeleted?.(d.id);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article
      className="group bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--color-shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--color-shadow-lg)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/25"
    >
      <div className="aspect-video bg-[var(--color-bg-hover)] relative">
        {d.video?.video_url ? (
          <VideoWithDuration
            src={d.video.video_url}
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-white/95 truncate">
              {formatDate(d.detected_at)}
            </div>
            <div className="text-[11px] text-white/80 truncate">
              {d.camera?.camera_name ?? d.camera?.camera_location ?? d.camera_id.slice(0, 8)}
            </div>
          </div>
          {duration !== null ? (
            <span className="shrink-0 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur">
              {formatDuration(duration)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">
              {d.truck?.truck_name ?? d.truck?.truck_number ?? "Truck"}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] truncate">
              Detection ID: <span className="font-mono">{String(d.id).slice(0, 8)}</span>
            </p>
          </div>

          {isAdmin && !isEditing ? (
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={openEditor}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:border-red-800 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/40"
                aria-label="Delete video clip record"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.75A2.25 2.25 0 0 1 11.25 1.5h1.5A2.25 2.25 0 0 1 15 3.75V4.5h4.125a.75.75 0 0 1 0 1.5H18.4l-.62 12.174A2.25 2.25 0 0 1 15.533 20.4H8.467a2.25 2.25 0 0 1-2.247-2.226L5.6 6H4.875a.75.75 0 0 1 0-1.5H9v-.75Zm1.5.75h3v-.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v.75Zm-1.563 4.125a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75Zm6.126 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 1 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75Zm-3.063 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 1 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{deleting ? "Deleting…" : "Delete"}</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {d.truck_status ? (
            <span className={statusChipClasses("truck", d.truck_status)}>
              Truck: {titleCase(d.truck_status)}
            </span>
          ) : (
            <span className={statusChipClasses("truck", "unknown")}>Truck: —</span>
          )}
          {d.bin_status ? (
            <span className={statusChipClasses("bin", d.bin_status)}>
              Bin: {titleCase(d.bin_status)}
            </span>
          ) : (
            <span className={statusChipClasses("bin", "unknown")}>Bin: —</span>
          )}
        </div>

        {isAdmin && isEditing ? (
          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                  Truck status
                </span>
                <select
                  value={draftTruckStatus}
                  onChange={(e) => setDraftTruckStatus(e.target.value as TruckStatus)}
                  className="min-w-[140px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                  disabled={saving}
                >
                  <option value="incoming">Incoming</option>
                  <option value="outgoing">Outgoing</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                  Bin status
                </span>
                <select
                  value={draftBinStatus}
                  onChange={(e) => setDraftBinStatus(e.target.value as BinStatus)}
                  className="min-w-[120px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
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
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            {saveError ? <p className="mt-2 text-[11px] text-red-600">{saveError}</p> : null}
          </div>
        ) : null}
        {deleteError ? <p className="mt-2 text-[11px] text-red-600">{deleteError}</p> : null}
      </div>
    </article>
  );
}
