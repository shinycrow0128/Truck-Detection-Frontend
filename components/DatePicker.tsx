"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar } from "./Calendar";

type DatePickerProps = {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  ariaLabel?: string;
  minDate?: Date;
  maxDate?: Date;
};

const toISODate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const parseISODate = (s: string): Date | null => {
  if (!s || s.length < 10) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export function DatePicker({
  value,
  onChange,
  ariaLabel,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  const dateValue = parseISODate(value);

  const formatDisplayValue = (val: string) => {
    const d = parseISODate(val);
    if (!d) return val;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors hover:bg-[var(--color-bg)] cursor-pointer min-w-[180px] text-left"
      >
        {hasMounted && value ? formatDisplayValue(value) : "Select date"}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <Calendar
            value={dateValue}
            onChange={(d) => onChange(toISODate(d))}
            onClose={() => setIsOpen(false)}
            minDate={minDate}
            maxDate={maxDate}
            showTime={false}
          />
        </div>
      )}
    </div>
  );
}

