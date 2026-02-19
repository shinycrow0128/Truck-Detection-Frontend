"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "./Calendar";

type DateTimePickerProps = {
  value: string; // datetime-local format string
  onChange: (value: string) => void;
  ariaLabel?: string;
  minDate?: Date;
  maxDate?: Date;
};

/** Format Date for datetime-local input (uses local time, not UTC) */
const toDateTimeLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Parse datetime-local string to Date */
const parseDateTimeLocal = (s: string): Date | null => {
  if (!s || s.length < 16) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export function DateTimePicker({
  value,
  onChange,
  ariaLabel,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dateValue = parseDateTimeLocal(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCalendarChange = (date: Date) => {
    onChange(toDateTimeLocal(date));
  };

  const formatDisplayValue = (val: string) => {
    if (!val) return "";
    const d = parseDateTimeLocal(val);
    if (!d) return val;
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors hover:bg-[var(--color-bg)] cursor-pointer min-w-[180px] text-left"
      >
        {value ? formatDisplayValue(value) : "Select date & time"}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <Calendar
            value={dateValue}
            onChange={handleCalendarChange}
            onClose={() => setIsOpen(false)}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      )}
    </div>
  );
}
