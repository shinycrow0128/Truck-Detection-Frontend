"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Camera, TruckDetection } from "@/lib/supabase/types";
import { FilterBar } from "./FilterBar";
import { EmptyState } from "./EmptyState";
import { DetectionList } from "./DetectionList";

type Filters = {
  cameraId: string | null;
  status: string | null;
  start: string;
  end: string;
};

const defaultStart = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const local = d.toISOString().slice(0, 16);
  return `${local.replace("T", " ")}:00`;
};
const defaultEnd = () => {
  const local = new Date().toISOString().slice(0, 16);
  return `${local.replace("T", " ")}:00`;
};

export function Dashboard() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [detections, setDetections] = useState<TruckDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    cameraId: null,
    status: null,
    start: defaultStart(),
    end: defaultEnd(),
  });

  const fetchCameras = useCallback(async () => {
    const supabase = createClient();
    const { data, error: e } = await supabase
      .from("camera")
      .select("*")
      .order("camera_name");
    if (e) throw e;
    setCameras((data as Camera[]) ?? []);
  }, []);

  const fetchDetections = useCallback(
    async (f: Filters) => {
      const supabase = createClient();
      let q = supabase
        .from("truck_detections")
        .select(
          "*, camera:camera_id(*), truck:truck_id(*)"
        )
        .gte("detected_at", f.start)
        .lte("detected_at", f.end)
        .order("detected_at", { ascending: false })
        .limit(50);

      if (f.cameraId) q = q.eq("camera_id", f.cameraId);
      if (f.status) q = q.eq("truck_status", f.status);

      const { data, error: e } = await q;
      if (e) throw e;
      setDetections((data as TruckDetection[]) ?? []);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchCameras();
        if (cancelled) return;
        await fetchDetections(filters);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchCameras, fetchDetections, filters]);

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <FilterBar cameras={cameras} onFiltersChange={handleFiltersChange} />
      {error && (
        <div className="max-w-6xl mx-auto px-4 py-4 w-full">
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-4 py-2">
            {error}
          </p>
        </div>
      )}
      {loading ? (
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[var(--color-muted)]">Loading…</p>
        </main>
      ) : detections.length > 0 ? (
        <DetectionList detections={detections} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
