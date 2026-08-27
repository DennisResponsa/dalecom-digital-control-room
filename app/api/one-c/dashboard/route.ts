import { env } from "cloudflare:workers";

type ODataEnvelope<T> = { value?: T[] };
type LeadRow = { Code?: string; Created?: string; Potential?: number; DeletionMark?: boolean };
type OrderRow = { Number?: string; Date?: string; DocumentAmount?: number; Posted?: boolean; DeletionMark?: boolean };
type TimesheetRow = { Number?: string; Date?: string; Posted?: boolean; DeletionMark?: boolean };

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function finite(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function GET() {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const baseUrl = runtimeEnv.ONEC_ODATA_URL?.replace(/\/$/, "");
  const username = runtimeEnv.ONEC_USERNAME;
  const password = runtimeEnv.ONEC_PASSWORD;
  if (!baseUrl || !username || !password) {
    return json({ success: false, error: "Collegamento 1C non configurato" }, 503);
  }

  const headers = { Authorization: `Basic ${btoa(`${username}:${password}`)}`, Accept: "application/json" };

  async function rows<T>(entity: string, select: string, orderBy?: string, top = 500) {
    const query = new URLSearchParams({ $select: select, $filter: "DeletionMark eq false", $top: String(top) });
    if (orderBy) query.set("$orderby", orderBy);
    let lastStatus = 0;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${baseUrl}/${entity}?${query}`, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      lastStatus = response.status;
      if (response.ok) {
        const body = (await response.json()) as ODataEnvelope<T>;
        return Array.isArray(body.value) ? body.value : [];
      }
      if (response.status < 500 || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }
    throw new Error(`${entity} ${lastStatus}`);
  }

  try {
    const [leads, orders, employees, timesheets] = await Promise.all([
      rows<LeadRow>("Catalog_Leads", "Code,Created,Potential,DeletionMark", "Created desc"),
      rows<OrderRow>("Document_SalesOrder", "Number,Date,DocumentAmount,Posted,DeletionMark", "Date desc"),
      rows<{ Ref_Key?: string; IsFolder?: boolean; DeletionMark?: boolean }>("Catalog_Employees", "Ref_Key,IsFolder,DeletionMark"),
      rows<TimesheetRow>("Document_Timesheet", "Number,Date,Posted,DeletionMark", "Date desc"),
    ]);
    const activeEmployees = employees.filter((employee) => employee.IsFolder !== true);

    return json({
      success: true,
      source: "1C ERP · OData live",
      generatedAt: new Date().toISOString(),
      privacy: "Indicatori aggregati; nessun dato cliente esposto",
      kpis: {
        leads: leads.length,
        leadPotential: leads.reduce((sum, lead) => sum + finite(lead.Potential), 0),
        orders: orders.length,
        orderValue: orders.reduce((sum, order) => sum + finite(order.DocumentAmount), 0),
        employees: activeEmployees.length,
        timesheets: timesheets.length,
        postedOrders: orders.filter((order) => order.Posted).length,
        postedTimesheets: timesheets.filter((timesheet) => timesheet.Posted).length,
      },
      recent: {
        leads: leads.slice(0, 5).map((lead) => ({ code: lead.Code || "—", created: lead.Created || null })),
        orders: orders.slice(0, 5).map((order) => ({ number: order.Number || "—", date: order.Date || null, posted: Boolean(order.Posted) })),
      },
    });
  } catch (error) {
    console.error("1C dashboard read failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "unknown error",
    });
    return json({ success: false, error: "Dati 1C momentaneamente non disponibili" }, 502);
  }
}
