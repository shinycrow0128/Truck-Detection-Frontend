import { NextRequest, NextResponse } from "next/server";

const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? "";

export async function GET(request: NextRequest) {
  if (!VIDEO_BASE_URL) {
    return NextResponse.json(
      { error: "Video base URL is not configured." },
      { status: 500 },
    );
  }

  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Missing date parameter (expected YYYY-MM-DD)." },
      { status: 400 },
    );
  }

  const [yearStr, monthStr, dayStr] = date.split("-");
  if (!yearStr || !monthStr || !dayStr) {
    return NextResponse.json(
      { error: "Invalid date format (expected YYYY-MM-DD)." },
      { status: 400 },
    );
  }

  const year = Number(yearStr);
  const month = monthStr.padStart(2, "0");
  const day = dayStr.padStart(2, "0");

  if (!Number.isFinite(year)) {
    return NextResponse.json(
      { error: "Invalid date value." },
      { status: 400 },
    );
  }

  const baseUrl = VIDEO_BASE_URL.replace(/\/+$/, "");
  const listingUrl = `${baseUrl}/${year}/${month}/${day}/`;

  try {
    const upstream = await fetch(listingUrl, {
      headers: {
        "ngrok-skip-browser-warning": "1",
      },
    });

    if (!upstream.ok) {
      // If the directory for this date doesn't exist, treat it as "no videos"
      // instead of a hard error so the UI can simply show an empty state.
      if (upstream.status === 404) {
        return NextResponse.json(
          {
            html: "",
            listingUrl,
          },
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }

      return NextResponse.json(
        {
          error: `Upstream request failed with status ${upstream.status}`,
        },
        { status: 502 },
      );
    }

    const html = await upstream.text();

    return new NextResponse(
      JSON.stringify({
        html,
        listingUrl,
      }),
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

