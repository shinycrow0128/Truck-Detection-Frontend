"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDrawerMounted, setMobileDrawerMounted] = useState(false);

  // Keep drawer mounted long enough for close animation
  useEffect(() => {
    if (mobileOpen) {
      setMobileDrawerMounted(true);
      return;
    }
    if (!mobileDrawerMounted) return;
    const t = window.setTimeout(() => setMobileDrawerMounted(false), 220);
    return () => window.clearTimeout(t);
  }, [mobileOpen, mobileDrawerMounted]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-subtle)] transition-colors duration-300">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileDrawerMounted && (
        <div
          className={`md:hidden fixed inset-0 z-50 ${
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <button
            type="button"
            aria-label="Close menu"
            className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200 ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`absolute inset-y-0 left-0 w-[82vw] max-w-[320px] transition-transform duration-200 ease-out will-change-transform ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-40 bg-[var(--color-bg-elevated)]/90 backdrop-blur border-b border-[var(--color-border)]">
          <div className="h-14 px-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--color-text)] truncate">
                Truck Monitor
              </div>
              <div className="text-[11px] text-[var(--color-text-secondary)] truncate">
                Dashboard
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

