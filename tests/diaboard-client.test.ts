import assert from "node:assert/strict";
import test from "node:test";
import { getDiaboardMachines } from "../app/diaboard-client.ts";

test("Diaboard autentica e normalizza la lista macchine senza esporre il token", async () => {
  const calls: Array<{ url: string; authorization: string | null }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    calls.push({ url, authorization: headers.get("authorization") });
    if (url.endsWith("/auth/client-login")) {
      return Response.json({ data: { token: "jwt-test" } });
    }
    return Response.json({
      data: [{
        id: 7,
        machine_type: "TB 30C",
        is_active: true,
        signal_strength: 18,
        description: "TB 30C",
        company_code: "570202",
        machine_client_code: "02094/0523",
        has_active_alarm: false,
        coordinates: { latitude: 45.67, longitude: 12.13 },
        device_legacy: true,
      }],
    });
  };

  const machines = await getDiaboardMachines({ email: "user@example.com", password: "secret", fetcher });
  assert.equal(machines.length, 1);
  assert.deepEqual(machines[0], {
    id: 7,
    machineType: "TB 30C",
    active: true,
    signalStrength: 18,
    description: "TB 30C",
    companyCode: "570202",
    clientCode: "02094/0523",
    hasActiveAlarm: false,
    position: { latitude: 45.67, longitude: 12.13 },
    legacy: true,
  });
  assert.equal(calls[0].authorization, null);
  assert.equal(calls[1].authorization, "Bearer jwt-test");
});
