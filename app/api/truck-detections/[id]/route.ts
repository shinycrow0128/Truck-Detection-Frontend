import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TruckStatus = "incoming" | "outgoing";
type BinStatus = "full" | "empty";

interface PatchBody {
  truck_status?: TruckStatus;
  bin_status?: BinStatus;
}

function isTruckStatus(value: unknown): value is TruckStatus {
  return value === "incoming" || value === "outgoing";
}

function isBinStatus(value: unknown): value is BinStatus {
  return value === "full" || value === "empty";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   // ← THIS IS THE FIX
) {
  // ✅ Await params (required in Next.js 15+)
  const { id } = await params;

  // ID is a UUID (not a number) – we keep it as string
  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Invalid detection ID" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const { truck_status, bin_status } = body as PatchBody;

  if (truck_status === undefined && bin_status === undefined) {
    return NextResponse.json(
      { error: "At least one of truck_status or bin_status must be provided" },
      { status: 400 }
    );
  }

  if (truck_status !== undefined && !isTruckStatus(truck_status)) {
    return NextResponse.json(
      { error: "truck_status must be 'incoming' or 'outgoing'" },
      { status: 400 }
    );
  }

  if (bin_status !== undefined && !isBinStatus(bin_status)) {
    return NextResponse.json(
      { error: "bin_status must be 'full' or 'empty'" },
      { status: 400 }
    );
  }
  
  const { data, error } = await supabase
    .from("truck_detections")
    .update({truck_status, bin_status})
    .eq("id", id)
    .select("id, truck_status, bin_status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Detection not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Invalid detection ID" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const { error } = await supabase
    .from("truck_detections")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}