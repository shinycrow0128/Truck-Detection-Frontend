import { NextRequest, NextResponse } from "next/server";

const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? "";

type VideoItem = {
  url: string;
  name: string;
  date: string; // YYYY-MM-DD
};

const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const toISODateUTC = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

const addDaysUTC = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const buildListingUrl = (baseUrl: string, isoDate: string) => {
  const [yearStr, monthStr, dayStr] = isoDate.split("-");
  const year = Number(yearStr);
  const month = (monthStr ?? "").padStart(2, "0");
  const day = (dayStr ?? "").padStart(2, "0");
  return `${baseUrl}/${year}/${month}/${day}/`;
};

const parseVideoItemsFromHtml = (html: string, listingUrl: string, isoDate: string): VideoItem[] => {
  if (!html) return [];

  const items: VideoItem[] = [];

  // Basic extraction of href targets that end with ".mp4"
  // Works for typical directory listings (nginx, apache, etc.)
  const anchorRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = (match[1] ?? "").trim();
    const text = (match[2] ?? "").replace(/<[^>]*>/g, "").trim();

    if (!href.toLowerCase().endsWith(".mp4")) continue;

    const url = href.startsWith("http") ? href : `${listingUrl}${href}`;
    items.push({
      url,
      name: text || href,
      date: isoDate,
    });
  }

  return items;
};

export async function GET(request: NextRequest) {
  if (!VIDEO_BASE_URL) {
    return NextResponse.json(
      { error: "Video base URL is not configured." },
      { status: 500 },
    );
  }

  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date"); // backward-compatible single-day query
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const baseUrl = VIDEO_BASE_URL.replace(/\/+$/, "");

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
    const maxDays = 366; // safety cap
    const results: VideoItem[] = [];

    let cursor = startD;
    for (let i = 0; i < maxDays; i++) {
      if (cursor > endD) break;
      const iso = toISODateUTC(cursor);
      const listingUrl = buildListingUrl(baseUrl, iso);

      const upstream = await fetch(listingUrl, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (upstream.ok) {
        const html = await upstream.text();
        results.push(...parseVideoItemsFromHtml(html, listingUrl, iso));
      } else if (upstream.status !== 404) {
        return NextResponse.json(
          { error: `Upstream request failed with status ${upstream.status}` },
          { status: 502 },
        );
      }

      cursor = addDaysUTC(cursor, 1);
    }

    return NextResponse.json(
      { items: results },
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
        error: "Failed to fetch video listing.",
      },
      { status: 500 },
    );
  }
}

