import { env } from "cloudflare:workers";

type WialonMessage = {
  t?: number;
  pos?: { s?: number; x?: number; y?: number };
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
  odometerSource: "can_total_distance" | "mileage" | null;
  fuelTelemetryStatus: "available" | "not_transmitted";
  speedAlerts: Array<{
    speedKmh: number;
    occurredAtUtc: string;
    position: { latitude: number; longitude: number } | null;
  }>;
  messages24h: number;
  positionedMessages24h: number;
  position: { latitude: number; longitude: number } | null;
};

const apiDefault = "https://hst-api.wialon.com/wialon/ajax.html";
const productionFleetEndpoint =
  "https://dalecom-digital-control-room.dalecom-control-room.workers.dev/api/wialon/fleet";
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

function usableValues(messages: WialonMessage[], key: string) {
  const entries = valuesFor(messages, key);
  return entries.some((entry) => entry.value !== 0) ? entries : [];
}

function speedAlerts(messages: WialonMessage[], thresholdKmh = 130) {
  const alerts: Array<{ speedKmh: number; occurredAtUtc: string; position: { latitude: number; longitude: number } | null }> = [];
  let peak: WialonMessage | null = null;
  let lastOverLimitAt = 0;

  const commit = () => {
    if (!peak?.t) return;
    const longitude = numeric(peak.pos?.x);
    const latitude = numeric(peak.pos?.y);
    alerts.push({
      speedKmh: round(numeric(peak.pos?.s), 0) as number,
      occurredAtUtc: new Date(peak.t * 1000).toISOString(),
      position:
        longitude === null || latitude === null
          ? null
          : { latitude: round(latitude, 6) as number, longitude: round(longitude, 6) as number },
    });
    peak = null;
  };

  for (const message of messages) {
    const speed = numeric(message.pos?.s);
    const timestamp = message.t || 0;
    if (speed !== null && speed > thresholdKmh) {
      if (peak && timestamp - lastOverLimitAt > 120) commit();
      if (!peak || speed > (numeric(peak.pos?.s) ?? -1)) peak = message;
      lastOverLimitAt = timestamp;
    } else if (peak && timestamp - lastOverLimitAt > 60) {
      commit();
    }
  }
  commit();
  return alerts.sort((a, b) => b.speedKmh - a.speedKmh).slice(0, 6);
}

function round(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function summarize(unit: WialonUnit, messages: WialonMessage[], now: number): FleetVehicle {
  const last = messages.at(-1);
  const canDistances = usableValues(messages, "can_total_distance");
  const mileage = usableValues(messages, "mileage");
  const distances = canDistances.length ? canDistances : mileage;
  const distanceDivisor = canDistances.length ? 10 : 1;
  const odometerSource = canDistances.length ? "can_total_distance" : mileage.length ? "mileage" : null;
  const fuelLevels = usableValues(messages, "can_fuel_level_p");
  const fuelLitres = usableValues(messages, "can_total_fuel_l");
  const totalFuel = fuelLitres.length ? fuelLitres : usableValues(messages, "can_total_fuel");
  const speeds = messages.map((message) => numeric(message.pos?.s)).filter((v): v is number => v !== null);
  const lastPosition = [...messages].reverse().find((message) => {
    return numeric(message.pos?.x) !== null && numeric(message.pos?.y) !== null;
  })?.pos;
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
    odometerCanKm: lastDistance === undefined ? null : round(lastDistance / distanceDivisor, 1),
    distance24hKm:
      firstDistance === undefined || lastDistance === undefined
        ? null
        : round(Math.max(0, lastDistance - firstDistance) / distanceDivisor, 1),
    fuelLevelPercent: round(fuelLevels.at(-1)?.value ?? null, 1),
    fuelConsumed24hL:
      firstFuel === undefined || lastFuel === undefined ? null : round(Math.max(0, lastFuel - firstFuel), 1),
    odometerSource,
    fuelTelemetryStatus: fuelLevels.length || totalFuel.length ? "available" : "not_transmitted",
    speedAlerts: speedAlerts(messages),
    messages24h: messages.length,
    positionedMessages24h: messages.filter((message) => message.pos).length,
    position:
      numeric(lastPosition?.x) === null || numeric(lastPosition?.y) === null
        ? null
        : {
            latitude: round(numeric(lastPosition?.y), 4) as number,
            longitude: round(numeric(lastPosition?.x), 4) as number,
          },
  };
}

export async function GET(request: Request) {
  if (cached && cached.expires > Date.now()) return response(cached.payload);

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const token = runtimeEnv.WIALON_TOKEN;
  const apiUrl = runtimeEnv.WIALON_API_URL || apiDefault;
  if (!token) {
    const hostname = new URL(request.url).hostname;
    const isLocalPreview = hostname === "localhost" || hostname === "127.0.0.1";
    if (isLocalPreview) {
      try {
        const upstream = await fetch(productionFleetEndpoint, { cache: "no-store" });
        const payload = (await upstream.json()) as Record<string, unknown>;
        if (upstream.ok && payload.success === true) {
          return response({ ...payload, previewSource: "Telemetria del sito Dalecom pubblicato" });
        }
      } catch {
        // Il pannello storico resta comunque disponibile nel frontend.
      }
    }
    return response({ success: false, error: "Collegamento GPS non configurato" }, 503);
  }

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
      privacy: "Posizioni GPS mostrate con coordinate arrotondate per la demo",
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
