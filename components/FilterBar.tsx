"use client";

import { useCallback, useMemo, useState } from "react";
import type { Camera } from "@/lib/supabase/types";
import { ThemeToggle } from "./ThemeToggle";

const toDateTimeLocal = (d: Date) => d.toISOString().slice(0, 16);
const toSupabaseTimestamp = (s: string) =>
  s.length <= 16 ? `${s.replace("T", " ")}:00` : s;

type FilterBarProps = {
  cameras: Camera[];
  onFiltersChange?: (filters: {
    cameraId: string | null;
    status: string | null;
    start: string;
    end: string;
  }) => void;
};

export function FilterBar({ cameras, onFiltersChange }: FilterBarProps) {
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return toDateTimeLocal(d);
  }, []);
  const defaultEnd = useMemo(() => toDateTimeLocal(new Date()), []);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const emit = useCallback(
    (cameraId: string | null, status: string | null, start: string, end: string) => {
      onFiltersChange?.({
        cameraId,
        status,
        start: toSupabaseTimestamp(start),
        end: toSupabaseTimestamp(end),
      });
    },
    [onFiltersChange]
  );

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setSelectedCameraId(v === "" ? null : v);
    emit(v === "" ? null : v, selectedStatus, startDate, endDate);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setSelectedStatus(v === "" ? null : v);
    emit(selectedCameraId, v === "" ? null : v, startDate, endDate);
  };
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setStartDate(v);
    emit(selectedCameraId, selectedStatus, v, endDate);
  };
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEndDate(v);
    emit(selectedCameraId, selectedStatus, startDate, v);
  };

  return (
    <header className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] px-4 py-4 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-primary)] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5m1.5-9 1.96 1.96A9.458 9.458 0 0 1 21 13c0 5.03-4.03 9-9 9s-9-3.97-9-9c0-1.83.54-3.53 1.46-4.96L6 9.5A7.5 7.5 0 1 0 19.5 9.5h-2.25a1.25 1.25 0 0 1-1.25-1.25 1.25 1.25 0 0 1 1.25-1.25H19.5Z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[var(--color-text)] hidden sm:block">Truck Detection</h1>
        </div>
        <select
          aria-label="Filter by device"
          value={selectedCameraId ?? ""}
          onChange={handleCameraChange}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
        >
          <option value="">All Devices</option>
          {cameras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.camera_name ?? c.camera_location ?? c.id.slice(0, 8)}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          value={selectedStatus ?? ""}
          onChange={handleStatusChange}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
        >
          <option value="">All</option>
          <option value="detected">Detected</option>
          <option value="empty">Empty</option>
          <option value="full">Full</option>
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
