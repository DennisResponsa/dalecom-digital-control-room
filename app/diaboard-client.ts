export type DiaboardMachine = {
  id: number;
  machineType: string;
  active: boolean;
  signalStrength: number;
  description: string;
  companyCode: string | null;
  clientCode: string | null;
  hasActiveAlarm: boolean;
  position: { latitude: number; longitude: number } | null;
  legacy: boolean;
};

type DiaboardEnvelope<T> = {
  data?: T;
  meta?: Record<string, unknown>;
  error?: unknown;
};

type RawMachine = {
  id?: unknown;
  machine_type?: unknown;
  is_active?: unknown;
  signal_strength?: unknown;
  description?: unknown;
  company_code?: unknown;
  machine_client_code?: unknown;
  has_active_alarm?: unknown;
  coordinates?: { latitude?: unknown; longitude?: unknown } | null;
  device_legacy?: unknown;
};

const DEFAULT_BASE_URL = "https://diaboard.net/api";

function finiteNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value: unknown, fallback = "Dato non disponibile") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

async function readJson<T>(response: Response): Promise<DiaboardEnvelope<T>> {
  let payload: DiaboardEnvelope<T>;
  try {
    payload = (await response.json()) as DiaboardEnvelope<T>;
  } catch {
    throw new Error(`Diaboard ha restituito una risposta non valida (${response.status})`);
  }
  if (!response.ok) {
    throw new Error(`Diaboard non disponibile (${response.status})`);
  }
  return payload;
}

export async function getDiaboardMachines(options: {
  email: string;
  password: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
}) {
  const fetcher = options.fetcher ?? fetch;
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const login = await fetcher(`${baseUrl}/auth/client-login`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email: options.email, password: options.password }),
    cache: "no-store",
  });
  const loginPayload = await readJson<{ token?: unknown }>(login);
  const token = loginPayload.data?.token;
  if (typeof token !== "string" || !token) throw new Error("Token Diaboard non ricevuto");

  const response = await fetcher(`${baseUrl}/export/machines?limit=1000`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const payload = await readJson<RawMachine[]>(response);
  const machines = Array.isArray(payload.data) ? payload.data : [];

  return machines.map((machine): DiaboardMachine => {
    const latitude = finiteNumber(machine.coordinates?.latitude);
    const longitude = finiteNumber(machine.coordinates?.longitude);
    return {
      id: finiteNumber(machine.id) ?? 0,
      machineType: text(machine.machine_type),
      active: machine.is_active === true,
      signalStrength: finiteNumber(machine.signal_strength) ?? 0,
      description: text(machine.description),
      companyCode: typeof machine.company_code === "string" ? machine.company_code : null,
      clientCode: typeof machine.machine_client_code === "string" ? machine.machine_client_code : null,
      hasActiveAlarm: machine.has_active_alarm === true,
      position: latitude !== null && longitude !== null ? { latitude, longitude } : null,
      legacy: machine.device_legacy === true,
    };
  });
}
