import { createClient } from "@/lib/supabase/server";
import { UserAccessRightsTable } from "@/components/settings/UserAccessRightsTable";
import type { Profile } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";

type ProfileRow = Profile & {
  email?: string | null;
  full_name?: string | null;
  username?: string | null;
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profile").select("*");

  const safeProfiles = ((profiles ?? []) as ProfileRow[]).filter((p) => p && typeof p.id === "string");

  const admin = createAdminClient();
  const profilesWithEmail: ProfileRow[] = admin
    ? await Promise.all(
        safeProfiles.map(async (p) => {
          try {
            const { data } = await admin.auth.admin.getUserById(p.id);
            return { ...p, email: data.user?.email ?? p.email ?? null };
          } catch {
            return p;
          }
        })
      )
    : safeProfiles;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] px-4 py-4 shadow-sm transition-colors duration-300">
        <div className="w-full flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-[var(--color-text)]">Settings</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Configure your application preferences.
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col p-6">
        <section className="flex-1 flex flex-col gap-6">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-sm p-6">
            <h2 className="text-base font-semibold text-[var(--color-text)]">User access rights</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Manage which role is assigned to each user in the system.
            </p>
            <UserAccessRightsTable initialProfiles={profilesWithEmail} />
          </div>
        </section>
      </main>
    </div>
  );
}
