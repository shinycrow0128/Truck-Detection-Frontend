import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type VideoItem = {
  url: string;
  name: string;
  date: string; // YYYY-MM-DD
};

const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const getVideoNameFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    return segment || url;
  } catch {
    const segment = url.split("/").filter(Boolean).pop() ?? "";
    return segment || url;
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date"); // backward-compatible single-day query
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // Determine query range
  let startDate = start ?? "";
  let endDate = end ?? "";
  if (!startDate && !endDate && date) {
    startDate = date;
    endDate = date;
  }

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing date parameters (use `date=YYYY-MM-DD` or `start` and `end`)." },
      { status: 400 },
    );
  }

  if (!isISODate(startDate) || !isISODate(endDate)) {
    return NextResponse.json(
      { error: "Invalid date format (expected YYYY-MM-DD)." },
      { status: 400 },
    );
  }

  const startD = new Date(`${startDate}T00:00:00Z`);
  const endD = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(startD.getTime()) || Number.isNaN(endD.getTime()) || startD > endD) {
    return NextResponse.json(
      { error: "Invalid date range (ensure start <= end)." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();

    // Supabase "date" filtering can behave like a timestamp compare depending on column type.
    // Using an exclusive upper bound ensures the selected `endDate` (YYYY-MM-DD) is fully included.
    const endExclusive = new Date(`${endDate}T00:00:00Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    const endExclusiveDate = endExclusive.toISOString().slice(0, 10); // YYYY-MM-DD

    const { data, error } = await supabase
      .from("video")
      .select("video_url, date")
      .not("video_url", "is", null)
      .gte("date", startDate)
      .lt("date", endExclusiveDate)
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    const items: VideoItem[] = (data ?? [])
      .filter((row) => Boolean(row.video_url && row.date))
      .map((row) => {
        const url = row.video_url as string;
        const dateValue = row.date as string;
        return {
          url,
          name: getVideoNameFromUrl(url),
          date: dateValue.slice(0, 10),
        };
      });

    return NextResponse.json(
      { items },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch videos.",
      },
      { status: 500 },
    );
  }
}

