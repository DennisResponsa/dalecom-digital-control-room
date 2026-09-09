import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function coordinate(value: string | null, min: number, max: number) {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export async function GET(request: NextRequest) {
  const latitude = coordinate(request.nextUrl.searchParams.get("lat"), -90, 90);
  const longitude = coordinate(request.nextUrl.searchParams.get("lon"), -180, 180);
  if (latitude === null || longitude === null) {
    return NextResponse.json({ success: false, error: "Coordinate non valide" }, { status: 400 });
  }

  const query = new URLSearchParams({
    format: "jsonv2",
    lat: latitude.toFixed(5),
    lon: longitude.toFixed(5),
    zoom: "18",
    addressdetails: "1",
  });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "it",
        "User-Agent": "Dalecom-Digital-Control-Room/1.0",
      },
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`Geocodifica non disponibile (${response.status})`);
    const result = (await response.json()) as { display_name?: unknown };
    const address = typeof result.display_name === "string" && result.display_name.trim()
      ? result.display_name.trim()
      : "Indirizzo non disponibile";
    return NextResponse.json(
      { success: true, address },
      { headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Geocodifica non disponibile" },
      { status: 502, headers: { "Cache-Control": "public, max-age=300" } },
    );
  }
}
