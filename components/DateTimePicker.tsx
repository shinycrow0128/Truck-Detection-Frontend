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
  const [hasMounted, setHasMounted] = useState(false);
  const dateValue = parseDateTimeLocal(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleCalendarChange = (date: Date) => {
    onChange(toDateTimeLocal(date));
  };

  const formatDisplayValue = (val: string) => {
    if (!val) return "";
    const d = parseDateTimeLocal(val);
    if (!d) return val;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${month} ${day}, ${year}, ${String(displayHour).padStart(2, "0")}:${minutes} ${ampm}`;
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
        {hasMounted && value ? formatDisplayValue(value) : "Select date & time"}
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
