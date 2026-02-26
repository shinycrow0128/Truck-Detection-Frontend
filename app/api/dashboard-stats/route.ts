import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const range = searchParams.get("range") || "7d";
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  // Calculate date range
  let now = new Date();
  let startDate: Date;

  if (startParam && endParam) {
    const parsedStart = new Date(startParam);
    const parsedEnd = new Date(endParam);

    if (
      !Number.isNaN(parsedStart.getTime()) &&
      !Number.isNaN(parsedEnd.getTime()) &&
      parsedStart <= parsedEnd
    ) {
      startDate = parsedStart;
      now = parsedEnd;
    } else {
      switch (range) {
        case "1d":
          startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }
  } else {
    switch (range) {
      case "1d":
        startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  try {
    // Fetch all detections within range
    const { data: detections, error: detectionsError } = await supabase
      .from("truck_detections")
      .select("*, camera:camera_id(id, camera_name, camera_location), truck:truck_id(id, truck_name, truck_number)")
      .gte("detected_at", startDate.toISOString())
      .lte("detected_at", now.toISOString())
      .order("detected_at", { ascending: true });

    if (detectionsError) throw detectionsError;

    // Fetch all trucks
    const { data: trucks, error: trucksError } = await supabase
      .from("truck")
      .select("*")
      .order("truck_name");
    if (trucksError) throw trucksError;

    // Fetch all cameras
    const { data: cameras, error: camerasError } = await supabase
      .from("camera")
      .select("*")
      .order("camera_name");
    if (camerasError) throw camerasError;

    // Previous period for comparison
    const prevStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const { data: prevDetections, error: prevError } = await supabase
      .from("truck_detections")
      .select("id")
      .gte("detected_at", prevStart.toISOString())
      .lt("detected_at", startDate.toISOString());
    if (prevError) throw prevError;

    const allDetections = detections ?? [];
    const prevCount = prevDetections?.length ?? 0;

    // --- KPI Summary ---
    const totalDetections = allDetections.length;
    const detectionChange = prevCount > 0
      ? Math.round(((totalDetections - prevCount) / prevCount) * 100)
      : totalDetections > 0 ? 100 : 0;

    const uniqueTrucks = new Set(allDetections.map((d) => d.truck_id)).size;
    const activeCameras = new Set(allDetections.map((d) => d.camera_id)).size;

    // Bin status counts
    const binStatusMap: Record<string, number> = {};
    for (const d of allDetections) {
      const status = d.bin_status || "unknown";
      binStatusMap[status] = (binStatusMap[status] || 0) + 1;
    }

    // Truck status counts
    const truckStatusMap: Record<string, number> = {};
    let emptyTrucksOut = 0;
    let fullTrucksIn = 0;

    for (const d of allDetections) {
      const status = d.truck_status || "unknown";
      truckStatusMap[status] = (truckStatusMap[status] || 0) + 1;

      const binStatus = (d.bin_status || "").toLowerCase();
      const truckStatus = (d.truck_status || "").toLowerCase();

      // Empty trucks going out: bin is empty and truck marked as outgoing
      if (binStatus === "empty" && truckStatus === "outgoing") {
        emptyTrucksOut++;
      }

      // Full trucks coming in: bin is full and truck marked as incoming
      if (binStatus === "full" && truckStatus === "incoming") {
        fullTrucksIn++;
      }
    }

    // --- Daily detection trend ---
    const dailyMap: Record<string, { total: number; binStatuses: Record<string, number> }> = {};
    for (const d of allDetections) {
      const day = d.detected_at.slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { total: 0, binStatuses: {} };
      dailyMap[day].total++;
      const bs = d.bin_status || "unknown";
      dailyMap[day].binStatuses[bs] = (dailyMap[day].binStatuses[bs] || 0) + 1;
    }

    // Fill in missing days
    const dailyTrend: Array<{ date: string; total: number; [key: string]: string | number }> = [];
    const cursor = new Date(startDate);
    while (cursor <= now) {
      const day = cursor.toISOString().slice(0, 10);
      const entry = dailyMap[day] || { total: 0, binStatuses: {} };
      dailyTrend.push({
        date: day,
        total: entry.total,
        ...entry.binStatuses,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // --- Hourly distribution (for today or all days aggregated) ---
    const hourlyMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourlyMap[h] = 0;
    for (const d of allDetections) {
      const hour = new Date(d.detected_at).getHours();
      hourlyMap[hour]++;
    }
    const hourlyDistribution = Object.entries(hourlyMap).map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      detections: count,
    }));

    // --- Per-truck breakdown ---
    const truckMap: Record<string, { name: string; number: string; count: number }> = {};
    for (const d of allDetections) {
      const tid = d.truck_id;
      if (!truckMap[tid]) {
        const truckInfo = d.truck as { id: string; truck_name: string; truck_number: string } | null;
        truckMap[tid] = {
          name: truckInfo?.truck_name || "Unknown",
          number: truckInfo?.truck_number || "",
          count: 0,
        };
      }
      truckMap[tid].count++;
    }
    const truckBreakdown = Object.entries(truckMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count);

    // --- Per-camera breakdown ---
    const cameraMap: Record<string, { name: string; location: string; count: number }> = {};
    for (const d of allDetections) {
      const cid = d.camera_id;
      if (!cameraMap[cid]) {
        const camInfo = d.camera as { id: string; camera_name: string; camera_location: string } | null;
        cameraMap[cid] = {
          name: camInfo?.camera_name || "Unknown",
          location: camInfo?.camera_location || "",
          count: 0,
        };
      }
      cameraMap[cid].count++;
    }
    const cameraBreakdown = Object.entries(cameraMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count);

    // --- Bin status distribution ---
    const binStatusDistribution = Object.entries(binStatusMap).map(([status, count]) => ({
      status,
      count,
    }));

    // --- Truck status distribution ---
    const truckStatusDistribution = Object.entries(truckStatusMap).map(([status, count]) => ({
      status,
      count,
    }));

    // --- Recent detections ---
    const recentDetections = allDetections.slice(-10).reverse().map((d) => ({
      id: d.id,
      detected_at: d.detected_at,
      bin_status: d.bin_status,
      truck_status: d.truck_status,
      truck_name: (d.truck as { truck_name?: string } | null)?.truck_name || "Unknown",
      camera_name: (d.camera as { camera_name?: string } | null)?.camera_name || "Unknown",
    }));

    return NextResponse.json({
      kpi: {
        totalDetections,
        detectionChange,
        uniqueTrucks,
        totalTrucks: trucks?.length ?? 0,
        activeCameras,
        totalCameras: cameras?.length ?? 0,
        emptyTrucksOut,
        fullTrucksIn,
      },
      dailyTrend,
      hourlyDistribution,
      truckBreakdown,
      cameraBreakdown,
      binStatusDistribution,
      truckStatusDistribution,
      recentDetections,
      allBinStatuses: [...new Set(allDetections.map((d) => d.bin_status || "unknown"))],
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
