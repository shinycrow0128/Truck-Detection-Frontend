"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Camera, Truck, TruckDetection } from "@/lib/supabase/types";
import { FilterBar } from "./FilterBar";
import { EmptyState } from "./EmptyState";
import { DetectionList } from "./DetectionList";

type Filters = {
  cameraIds: string[];
  truckId: string | null;
  start: string;
  end: string;
};

const defaultStart = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString();
};
const defaultEnd = () => new Date().toISOString();

export function Dashboard() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [detections, setDetections] = useState<TruckDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    cameraIds: [],
    truckId: null,
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

  const fetchTrucks = useCallback(async () => {
    const supabase = createClient();
    const { data, error: e } = await supabase
      .from("truck")
      .select("*")
      .order("truck_name");
    if (e) throw e;
    setTrucks((data as Truck[]) ?? []);
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

      if (f.cameraIds.length > 0) q = q.in("camera_id", f.cameraIds);
      else q = q.in("camera_id", []); // no cameras selected → no videos
      if (f.truckId) q = q.eq("truck_id", f.truckId);

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
        await Promise.all([fetchCameras(), fetchTrucks()]);
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
  }, [fetchCameras, fetchTrucks, fetchDetections, filters]);

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-subtle)] transition-colors duration-300">
      <FilterBar cameras={cameras} trucks={trucks} onFiltersChange={handleFiltersChange} />
      {error && (
        <div className="w-full px-4 py-4">
          <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
            {error}
          </p>
        </div>
      )}
      {loading ? (
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[var(--color-text-secondary)]">Loading…</p>
        </main>
      ) : detections.length > 0 ? (
        <DetectionList detections={detections} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
