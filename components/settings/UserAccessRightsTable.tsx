"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/lib/supabase/types";

type ProfileRow = Profile & {
  email?: string | null;
  full_name?: string | null;
  username?: string | null;
};

type Props = {
  initialProfiles: ProfileRow[];
};

function roleLabel(role: UserRole) {
  return role === "admin" ? "Administrator" : "Client";
}

function roleValue(labelOrValue: string): UserRole {
  if (labelOrValue === "admin" || labelOrValue === "client") return labelOrValue;
  if (labelOrValue.toLowerCase() === "administrator") return "admin";
  return "client";
}

function displayUser(p: ProfileRow) {
  const byName = (p.full_name || p.username || "").trim();
  if (byName) return byName;
  if (p.email) return p.email;
  return p.id;
}

function shortId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function emailTag(email?: string | null) {
  const value = (email || "").trim();
  if (!value) return null;
  return (
    <span className="mt-1 inline-flex w-fit items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
      {value}
    </span>
  );
}

export function UserAccessRightsTable({ initialProfiles }: Props) {
  const [profiles, setProfiles] = useState<ProfileRow[]>(initialProfiles);
  const [draftRoles, setDraftRoles] = useState<Record<string, UserRole>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    return [...profiles].sort((a, b) => displayUser(a).localeCompare(displayUser(b)));
  }, [profiles]);

  const onChangeRole = (id: string, value: string) => {
    setDraftRoles((prev) => ({ ...prev, [id]: roleValue(value) }));
  };

  const onSave = async (id: string) => {
    const nextRole = draftRoles[id];
    const currentRole = profiles.find((p) => p.id === id)?.role;
    if (!nextRole || !currentRole || nextRole === currentRole) return;

    setError(null);
    setSavingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const supabase = createClient();
      const { error: e } = await supabase.from("profile").update({ role: nextRole }).eq("id", id);
      if (e) throw e;

      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role: nextRole } : p)));
      setDraftRoles((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update access right");
    } finally {
      setSavingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="mt-4 overflow-auto">
      {error ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              User
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              Email
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              Access right
            </th>
            <th className="py-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] w-28">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-10 px-3 text-center text-sm text-[var(--color-text-secondary)]"
              >
                No users found in <span className="font-mono">profile</span>.
              </td>
            </tr>
          ) : (
            rows.map((p, i) => {
              const draft = draftRoles[p.id];
              const effectiveRole = draft ?? p.role;
              const dirty = draft != null && draft !== p.role;
              const saving = !!savingIds[p.id];
              const userText = displayUser(p);
              const showId = userText !== p.id ? shortId(p.id) : null;
              const emailValue = (p.email || "").trim();

              return (
                <tr
                  key={p.id}
                  className={`transition-colors hover:bg-[var(--color-bg-hover)] ${
                    i < rows.length - 1 ? "border-b border-[var(--color-border)]" : ""
                  }`}
                >
                  <td className="py-2.5 px-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--color-text)]">{userText}</span>
                      {showId ? (
                        <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                          {showId}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-sm">
                    {emailValue ? (
                      emailTag(emailValue)
                    ) : (
                      <span className="text-sm text-[var(--color-text-secondary)]">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={effectiveRole}
                      onChange={(e) => onChangeRole(p.id, e.target.value)}
                      className="w-full max-w-[220px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                      disabled={saving}
                      aria-label={`Access right for ${userText}`}
                    >
                      <option value="admin">{roleLabel("admin")}</option>
                      <option value="client">{roleLabel("client")}</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSave(p.id)}
                      disabled={!dirty || saving}
                      className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

