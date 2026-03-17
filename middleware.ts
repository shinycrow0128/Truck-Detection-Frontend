import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessTokenFromSupabaseAuthCookieValue } from "@/lib/supabase/auth-token";

function getAccessTokenFromSupabaseCookie(request: NextRequest): string | null {
  // Supabase stores session JSON in a cookie like:
  // sb-<project-ref>-auth-token=base64-<base64url(JSON)>
  const cookies = request.cookies.getAll();
  const tokenCookie = cookies.find((c) => c.name.endsWith("-auth-token"));
  return getAccessTokenFromSupabaseAuthCookieValue(tokenCookie?.value ?? null);
}

export async function middleware(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const token = getAccessTokenFromSupabaseCookie(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/truck-detections/:path*"],
};
