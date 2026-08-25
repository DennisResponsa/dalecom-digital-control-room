import {
  escapeODataString,
  mapOneCLead,
  oneCLeadDescription,
  validateOneCLeadRequest,
} from "../../../one-c";
import { env } from "cloudflare:workers";

const maxBodyBytes = 100_000;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (!origin || origin !== requestOrigin) {
    return json({ success: false, error: "Origine richiesta non valida" }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBodyBytes) return json({ success: false, error: "Payload troppo grande" }, 413);

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > maxBodyBytes) return json({ success: false, error: "Payload troppo grande" }, 413);
    raw = JSON.parse(text);
  } catch {
    return json({ success: false, error: "JSON non valido" }, 400);
  }

  const validated = validateOneCLeadRequest(raw);
  if (!validated.valid) return json({ success: false, error: validated.error }, 400);

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const baseUrl = runtimeEnv.ONEC_ODATA_URL;
  const username = runtimeEnv.ONEC_USERNAME;
  const password = runtimeEnv.ONEC_PASSWORD;
  if (!baseUrl || !username || !password) {
    return json({ success: false, error: "Collegamento gestionale non configurato" }, 503);
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/`;
  const authorization = `Basic ${btoa(`${username}:${password}`)}`;
  const headers = {
    Authorization: authorization,
    Accept: "application/json",
    "Content-Type": "application/json;charset=utf-8",
  };
  const description = oneCLeadDescription(validated.data);

  try {
    const filter = encodeURIComponent(`Description eq '${escapeODataString(description)}' and DeletionMark eq false`);
    const duplicateResponse = await fetch(
      `${endpoint}Catalog_Leads?$select=Ref_Key,Code,Description&$filter=${filter}&$top=1`,
      { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) },
    );
    if (!duplicateResponse.ok) throw new Error(`1C duplicate check ${duplicateResponse.status}`);
    const duplicateData = (await duplicateResponse.json()) as {
      value?: Array<{ Ref_Key: string; Code?: string; Description?: string }>;
    };
    const existing = duplicateData.value?.[0];
    if (existing) {
      return json({
        success: true,
        duplicate: true,
        quote_reference: validated.data.quote.quote_reference,
        lead_id: existing.Ref_Key,
        lead_code: existing.Code || null,
      });
    }

    const createResponse = await fetch(`${endpoint}Catalog_Leads`, {
      method: "POST",
      headers,
      body: JSON.stringify(mapOneCLead(validated.data)),
      signal: AbortSignal.timeout(15_000),
    });
    if (!createResponse.ok) throw new Error(`1C create lead ${createResponse.status}`);
    const created = (await createResponse.json()) as {
      Ref_Key: string;
      Code?: string;
      Description?: string;
    };
    return json(
      {
        success: true,
        duplicate: false,
        quote_reference: validated.data.quote.quote_reference,
        lead_id: created.Ref_Key,
        lead_code: created.Code || null,
      },
      201,
    );
  } catch (error) {
    console.error("1C lead integration failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "unknown error",
      cause: error instanceof Error && error.cause ? String(error.cause) : undefined,
    });
    return json({ success: false, error: "1C non ha accettato la richiesta. Riprova tra poco." }, 502);
  }
}
