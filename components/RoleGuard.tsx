"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: React.ReactNode;
  allowedRoles: ("admin" | "client")[];
};

export function RoleGuard({ children, allowedRoles }: Props) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!role || !allowedRoles.includes(role)) {
      router.replace("/");
    }
  }, [role, loading, allowedRoles, router]);

  if (loading || !role || !allowedRoles.includes(role)) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">Loading…</p>
      </main>
    );
  }

  return <>{children}</>;
}
