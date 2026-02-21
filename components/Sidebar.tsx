"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/supabase/types";

const allNavItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
        <path d="M4 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm10 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V5ZM4 15a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2Zm10 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2Z" />
      </svg>
    ),
  },
  {
    label: "Truck Records",
    href: "/truck-records",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
        <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 0 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
        <path d="M8.25 19.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75V18a3 3 0 0 1 6 0v.75a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75V9a2.25 2.25 0 0 0-2.25-2.25H15.75Z" />
      </svg>
    ),
  },
  {
    label: "Manage Truck and Camera",
    href: "/manage",
    roles: ["admin"] as UserRole[],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
        <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
        <path fillRule="evenodd" d="M9.344 3.07a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.732 1.235a.75.75 0 0 1-.326 1.378A48.058 48.058 0 0 0 12 4.5a48.058 48.058 0 0 0-5.462.185.75.75 0 0 1-.326-1.378c.902-.65 1.765-1.183 2.732-1.235ZM6 4.5a.75.75 0 0 1 .75.75v.352a48.989 48.989 0 0 0 10.5 0V5.25A.75.75 0 0 1 18 4.5h.75a.75.75 0 0 1 .75.75v.352a50.1 50.1 0 0 1-12 0V5.25A.75.75 0 0 1 6.75 4.5H6Zm13.94 3.287a.75.75 0 0 1 .77.043l2.25 1.5a.75.75 0 0 1 0 1.262l-2.25 1.5a.75.75 0 0 1-1.12-.545v-1.5h-6.5v1.5a.75.75 0 0 1-1.12.545l-2.25-1.5a.75.75 0 0 1 0-1.262l2.25-1.5a.75.75 0 0 1 .77-.043v1.5h6.5v-1.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    roles: ["admin"] as UserRole[],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567l-.178 1.071c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083l-1.02-.382a1.875 1.875 0 0 0-2.282.818l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c-.015.2.059.352.153.43l-.84.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.02-.382c.114-.043.282-.031.449.082.313.214.642.405.986.57.182.088.277.228.297.35l.178 1.07c.151.905.933 1.568 1.85 1.568h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.35.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.088-.277-.228-.297-.348l-.178-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, signOut } = useAuth();

  const navItems = allNavItems.filter((item) => {
    const roles = "roles" in item ? item.roles : undefined;
    if (!roles) return true; // Dashboard, Truck Records - visible to all
    return role && roles.includes(role);
  });

  return (
    <aside className="w-64 shrink-0 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] flex flex-col transition-colors duration-300">
      <div className="p-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-primary)] text-white shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M4 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm10 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V5ZM4 15a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2Zm10 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text)]">Truck Monitor</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">RTSP TRACKING</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
            <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
