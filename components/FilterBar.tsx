"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Camera, Truck } from "@/lib/supabase/types";
import { DateTimePicker } from "./DateTimePicker";

/** Format Date for datetime-local input (uses local time, not UTC) */
const toDateTimeLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
/** Convert datetime-local value (local time) to ISO UTC for Supabase */
const toSupabaseTimestamp = (s: string) => {
  if (!s || s.length < 16) return s;
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toISOString();
};
/** Parse datetime-local string to Date */
const parseDateTimeLocal = (s: string): Date | null => {
  if (!s || s.length < 16) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

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
  const [cameraDropdownOpen, setCameraDropdownOpen] = useState(false);
  const cameraDropdownRef = useRef<HTMLDivElement>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mounted, setMounted] = useState(false);

  // Initialize date values only on the client to avoid hydration mismatch
  useEffect(() => {
    if (!mounted) {
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      setStartDate(toDateTimeLocal(oneMonthAgo));
      setEndDate(toDateTimeLocal(now));
      setMounted(true);
    }
  }, [mounted]);

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

  // Close camera dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cameraDropdownRef.current &&
        !cameraDropdownRef.current.contains(event.target as Node)
      ) {
        setCameraDropdownOpen(false);
      }
    };
    if (cameraDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [cameraDropdownOpen]);

  const handleTruckChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setSelectedTruckId(v === "" ? null : v);
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
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-[var(--color-text)]">Truck Records</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            View Recorded Truck Detection Data
          </p>
        </div>
        <div ref={cameraDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setCameraDropdownOpen((prev) => !prev)}
            className="list-none px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors cursor-pointer select-none"
          >
            {selectedCameraSummary}
          </button>
          {cameraDropdownOpen && (
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
          )}
        </div>
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
        <div className="ml-auto mr-[150px] flex items-center gap-3">
          <DateTimePicker
            value={startDate}
            onChange={setStartDate}
            ariaLabel="Start date and time"
            maxDate={parseDateTimeLocal(endDate) || undefined}
          />
          <span className="text-[var(--color-muted)]">→</span>
          <DateTimePicker
            value={endDate}
            onChange={setEndDate}
            ariaLabel="End date and time"
            minDate={parseDateTimeLocal(startDate) || undefined}
          />
        </div>
      </div>
    </header>
  );
}
