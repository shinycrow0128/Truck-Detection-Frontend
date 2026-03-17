import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

type TruckStatus = "incoming" | "outgoing";
type BinStatus = "full" | "empty";

function isTruckStatus(value: unknown): value is TruckStatus {
  return value === "incoming" || value === "outgoing";
}

function isBinStatus(value: unknown): value is BinStatus {
  return value === "full" || value === "empty";
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const detectionId = Number(id);
  if (!Number.isFinite(detectionId)) {
    return NextResponse.json({ error: "Invalid detection id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const role = profile && "role" in profile ? (profile.role as UserRole) : null;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const truck_status = (body as { truck_status?: unknown }).truck_status;
  const bin_status = (body as { bin_status?: unknown }).bin_status;

  if (!isTruckStatus(truck_status) || !isBinStatus(bin_status)) {
    return NextResponse.json(
      { error: "truck_status must be incoming/outgoing and bin_status must be full/empty" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("truck_detections")
    .update({ truck_status, bin_status })
    .eq("id", detectionId)
    .select("id, truck_status, bin_status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Detection not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

