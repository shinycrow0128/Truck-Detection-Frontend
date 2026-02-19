"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Camera, Truck } from "@/lib/supabase/types";
import { ThemeToggle } from "./ThemeToggle";

const toDateTimeLocal = (d: Date) => d.toISOString().slice(0, 16);
const toSupabaseTimestamp = (s: string) =>
  s.length <= 16 ? `${s.replace("T", " ")}:00` : s;

type FilterBarProps = {
  cameras: Camera[];
  trucks: Truck[];
  onFiltersChange?: (filters: {
    cameraIds: string[];
    truckId: string | null;
    start: string;
    end: string;
  }) => void;
};

export function FilterBar({ cameras, trucks, onFiltersChange }: FilterBarProps) {
  const userHasUncheckedAll = useRef(false);
  const [selectedCameraIds, setSelectedCameraIds] = useState<string[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return toDateTimeLocal(d);
  }, []);
  const defaultEnd = useMemo(() => toDateTimeLocal(new Date()), []);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const cameraLabel = useCallback((c: Camera) => {
    const base = c.camera_name ?? c.camera_location ?? c.id.slice(0, 8);
    return /front/i.test(base) ? `${base} (Front)` : base;
  }, []);

  const allCamerasSelected =
    cameras.length > 0 && selectedCameraIds.length === cameras.length;

  const selectedCameraSummary = useMemo(() => {
    if (allCamerasSelected) return "All Cameras";
    if (selectedCameraIds.length === 0) return "No Cameras";
    const map = new Map(cameras.map((c) => [c.id, cameraLabel(c)] as const));
    const labels = selectedCameraIds.map((id) => map.get(id) ?? id.slice(0, 8));
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
  }, [cameras, cameraLabel, selectedCameraIds, allCamerasSelected]);

  const toggleCamera = (id: string) => {
    setSelectedCameraIds((prev) => {
      return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const selectAllCameras = () => {
    userHasUncheckedAll.current = false;
    setSelectedCameraIds(cameras.map((c) => c.id));
  };

  const clearCameras = () => {
    userHasUncheckedAll.current = true;
    setSelectedCameraIds([]);
  };

  const handleAllCamerasChange = () => {
    if (allCamerasSelected) clearCameras();
    else selectAllCameras();
  };

  // Initial load: select all cameras when cameras first load
  useEffect(() => {
    if (
      cameras.length > 0 &&
      selectedCameraIds.length === 0 &&
      !userHasUncheckedAll.current
    ) {
      setSelectedCameraIds(cameras.map((c) => c.id));
    }
  }, [cameras]);

  const handleTruckChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setSelectedTruckId(v === "" ? null : v);
  };
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setStartDate(v);
  };
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEndDate(v);
  };

  useEffect(() => {
    if (!onFiltersChange) return;
    onFiltersChange({
      cameraIds: selectedCameraIds,
      truckId: selectedTruckId,
      start: toSupabaseTimestamp(startDate),
      end: toSupabaseTimestamp(endDate),
    });
  }, [onFiltersChange, selectedCameraIds, selectedTruckId, startDate, endDate]);

  return (
    <header className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] px-4 py-4 shadow-sm transition-colors duration-300">
      <div className="w-full flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-primary)] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5m1.5-9 1.96 1.96A9.458 9.458 0 0 1 21 13c0 5.03-4.03 9-9 9s-9-3.97-9-9c0-1.83.54-3.53 1.46-4.96L6 9.5A7.5 7.5 0 1 0 19.5 9.5h-2.25a1.25 1.25 0 0 1-1.25-1.25 1.25 1.25 0 0 1 1.25-1.25H19.5Z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[var(--color-text)] hidden sm:block">Truck Detection</h1>
        </div>
        <details className="relative">
          <summary className="list-none px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors cursor-pointer select-none">
            {selectedCameraSummary}
          </summary>
          <div className="absolute z-10 mt-2 w-72 max-w-[80vw] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-lg p-2">
            <label className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={allCamerasSelected}
                onChange={handleAllCamerasChange}
              />
              <span className="text-sm text-[var(--color-text)]">All Cameras</span>
            </label>
            <div className="my-2 h-px bg-[var(--color-border)]" />
            <div className="max-h-64 overflow-auto pr-1">
              {cameras.map((c) => {
                const label = cameraLabel(c);
                const isFront = /front/i.test(c.camera_name ?? c.camera_location ?? "");
                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCameraIds.includes(c.id)}
                      onChange={() => toggleCamera(c.id)}
                    />
                    <span className="text-sm text-[var(--color-text)] truncate" title={label}>
                      {label}
                    </span>
                    {isFront && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        Front
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </details>
        <select
          aria-label="Filter by truck"
          value={selectedTruckId ?? ""}
          onChange={handleTruckChange}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
        >
          <option value="">All Trucks</option>
          {trucks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.truck_name ?? t.truck_number ?? t.id.slice(0, 8)}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-3">
          <input
            type="datetime-local"
            aria-label="Start date and time"
            value={startDate}
            onChange={handleStartChange}
            className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
          />
          <span className="text-[var(--color-muted)]">→</span>
          <input
            type="datetime-local"
            aria-label="End date and time"
            value={endDate}
            onChange={handleEndChange}
            className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
