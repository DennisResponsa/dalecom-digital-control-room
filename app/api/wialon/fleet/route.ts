import { env } from "cloudflare:workers";

type WialonMessage = {
  t?: number;
  pos?: { s?: number };
  p?: Record<string, number | string | null | undefined>;
};

type WialonUnit = { id: number; nm?: string };

type FleetVehicle = {
  name: string;
  online: boolean;
  lastMessageUtc: string | null;
  speedKmh: number | null;
  maxSpeed24hKmh: number | null;
  odometerCanKm: number | null;
  distance24hKm: number | null;
  fuelLevelPercent: number | null;
  fuelConsumed24hL: number | null;
  messages24h: number;
  positionedMessages24h: number;
};

const apiDefault = "https://hst-api.wialon.com/wialon/ajax.html";
const cacheMs = 60_000;
let cached: { expires: number; payload: Record<string, unknown> } | null = null;

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function wialonCall(
  apiUrl: string,
  service: string,
  params: Record<string, unknown>,
  sid?: string,
) {
  const body = new URLSearchParams({ svc: service, params: JSON.stringify(params) });
  if (sid) body.set("sid", sid);
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok || typeof data.error === "number") {
    throw new Error(`Wialon ${service} non disponibile`);
  }
  return data;
}

function numeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function valuesFor(messages: WialonMessage[], key: string) {
  return messages
    .map((message) => ({ value: numeric(message.p?.[key]), t: message.t || 0 }))
    .filter((entry): entry is { value: number; t: number } => entry.value !== null);
}

function round(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function summarize(unit: WialonUnit, messages: WialonMessage[], now: number): FleetVehicle {
  const last = messages.at(-1);
  const distances = valuesFor(messages, "can_total_distance");
  const fuelLevels = valuesFor(messages, "can_fuel_level_p");
  const totalFuel = valuesFor(messages, "can_total_fuel_l");
  const speeds = messages.map((message) => numeric(message.pos?.s)).filter((v): v is number => v !== null);
  const lastTimestamp = last?.t || 0;
  const firstDistance = distances.at(0)?.value;
  const lastDistance = distances.at(-1)?.value;
  const firstFuel = totalFuel.at(0)?.value;
  const lastFuel = totalFuel.at(-1)?.value;

  return {
    name: unit.nm || `Mezzo ${unit.id}`,
    online: Boolean(lastTimestamp && now - lastTimestamp <= 20 * 60),
    lastMessageUtc: lastTimestamp ? new Date(lastTimestamp * 1000).toISOString() : null,
    speedKmh: round(numeric(last?.pos?.s), 0),
    maxSpeed24hKmh: speeds.length ? round(Math.max(...speeds), 0) : null,
    odometerCanKm: lastDistance === undefined ? null : round(lastDistance / 10, 1),
    distance24hKm:
      firstDistance === undefined || lastDistance === undefined
        ? null
        : round(Math.max(0, lastDistance - firstDistance) / 10, 1),
    fuelLevelPercent: round(fuelLevels.at(-1)?.value ?? null, 1),
    fuelConsumed24hL:
      firstFuel === undefined || lastFuel === undefined ? null : round(Math.max(0, lastFuel - firstFuel), 1),
    messages24h: messages.length,
    positionedMessages24h: messages.filter((message) => message.pos).length,
  };
}

export async function GET() {
  if (cached && cached.expires > Date.now()) return response(cached.payload);

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const token = runtimeEnv.WIALON_TOKEN;
  const apiUrl = runtimeEnv.WIALON_API_URL || apiDefault;
  if (!token) return response({ success: false, error: "Collegamento GPS non configurato" }, 503);

  let sid: string | undefined;
  try {
    const login = await wialonCall(apiUrl, "token/login", { token, fl: 7 });
    sid = typeof login.eid === "string" ? login.eid : undefined;
    if (!sid) throw new Error("Sessione Wialon non disponibile");

    const search = await wialonCall(
      apiUrl,
      "core/search_items",
      {
        spec: {
          itemsType: "avl_unit",
          propName: "sys_name",
          propValueMask: "*",
          sortType: "sys_name",
        },
        force: 1,
        flags: 4097,
        from: 0,
        to: 0,
      },
      sid,
    );
    const units = Array.isArray(search.items) ? (search.items as WialonUnit[]) : [];
    const now = Math.floor(Date.now() / 1000);
    const timeFrom = now - 24 * 60 * 60;
    const vehicles: FleetVehicle[] = [];

    for (const unit of units) {
      const history = await wialonCall(
        apiUrl,
        "messages/load_interval",
        { itemId: unit.id, timeFrom, timeTo: now, flags: 0, flagsMask: 65280, loadCount: 5000 },
        sid,
      );
      const messages = Array.isArray(history.messages) ? (history.messages as WialonMessage[]) : [];
      vehicles.push(summarize(unit, messages, now));
      await wialonCall(apiUrl, "messages/unload", {}, sid);
    }

    const payload = {
      success: true,
      source: "Wialon Remote API · TOPFLY",
      generatedAt: new Date().toISOString(),
      privacy: "Le coordinate precise non vengono pubblicate",
      vehicles,
    };
    cached = { expires: Date.now() + cacheMs, payload };
    return response(payload);
  } catch (error) {
    console.error("Wialon fleet integration failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "unknown error",
    });
    return response({ success: false, error: "Dati GPS momentaneamente non disponibili" }, 502);
  } finally {
    if (sid) await wialonCall(apiUrl, "core/logout", {}, sid).catch(() => undefined);
  }
}
