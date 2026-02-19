"use client";

import { useState, useMemo, useEffect, useRef } from "react";

type CalendarProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
};

export function Calendar({ value, onChange, onClose, minDate, maxDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);
  const [selectedTime, setSelectedTime] = useState<{ hours: number; minutes: number }>(
    value
      ? { hours: value.getHours(), minutes: value.getMinutes() }
      : { hours: new Date().getHours(), minutes: new Date().getMinutes() }
  );
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const monthStart = useMemo(() => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return date;
  }, [currentMonth]);

  const monthEnd = useMemo(() => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return date;
  }, [currentMonth]);

  const startDate = useMemo(() => {
    const date = new Date(monthStart);
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    return date;
  }, [monthStart]);

  const days = useMemo(() => {
    const daysArray: Date[] = [];
    const date = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      daysArray.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return daysArray;
  }, [startDate]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(selectedTime.hours);
      finalDate.setMinutes(selectedTime.minutes);
      onChange(finalDate);
      onClose();
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    setSelectedTime({ hours: today.getHours(), minutes: today.getMinutes() });
  };

  return (
    <div
      ref={modalRef}
      className="bg-[var(--color-bg-elevated)] rounded-xl shadow-lg border border-[var(--color-border)] w-[320px] overflow-hidden"
    >
      <div className="p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-4">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-[var(--color-text-secondary)] py-1"
                >
                  {day.slice(0, 1)}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const disabled = isDisabled(day);

                return (
                  <button
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    disabled={disabled}
                    className={`
                      aspect-square rounded-lg text-xs font-medium transition-all
                      ${isCurrentMonth ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)] opacity-40"}
                      ${isSelected
                        ? "bg-[var(--color-primary)] text-white shadow-md"
                        : "hover:bg-[var(--color-bg)]"
                      }
                      ${isToday && !isSelected ? "ring-1 ring-[var(--color-primary)]" : ""}
                      ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-4 p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">
              Time
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs text-[var(--color-text-secondary)] mb-1">H</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={selectedTime.hours}
                  onChange={(e) =>
                    setSelectedTime({
                      ...selectedTime,
                      hours: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)),
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text)] text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <span className="text-lg font-bold text-[var(--color-text-secondary)] mt-5">:</span>
              <div className="flex-1">
                <label className="block text-xs text-[var(--color-text-secondary)] mb-1">M</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={selectedTime.minutes}
                  onChange={(e) =>
                    setSelectedTime({
                      ...selectedTime,
                      minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text)] text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)] transition-colors text-xs font-medium"
            >
              Today
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              OK
            </button>
          </div>
        </div>
      </div>
  );
}
