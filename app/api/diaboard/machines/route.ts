import { NextResponse } from "next/server";
import { getDiaboardMachines } from "../../../diaboard-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = process.env.DIABOARD_EMAIL;
  const password = process.env.DIABOARD_PASSWORD;
  if (!email || !password) {
    return NextResponse.json(
      { success: false, source: "Diaboard", error: "Credenziali API Diaboard non configurate" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const machines = await getDiaboardMachines({ email, password });
    return NextResponse.json(
      { success: true, source: "Diaboard", generatedAt: new Date().toISOString(), machines },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, source: "Diaboard", error: error instanceof Error ? error.message : "Errore API Diaboard" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
