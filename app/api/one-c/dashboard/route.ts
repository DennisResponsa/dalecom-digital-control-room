import { env } from "cloudflare:workers";
import { oneCNumericValue } from "../../../one-c";

type ODataEnvelope<T> = { value?: T[] };
type LeadRow = {
  Code?: string;
  Created?: string;
  Potential?: number;
  Description?: string;
  KanbanDescription?: string;
  DeletionMark?: boolean;
};
type OrderRow = {
  Number?: string;
  Date?: string;
  DocumentAmount?: number;
  Posted?: boolean;
  Closed?: boolean;
  Comment?: string;
  Counterparty_Key?: string;
  Responsible_Key?: string;
  OrderState_Key?: string;
  DeletionMark?: boolean;
};
type EmployeeRow = {
  Ref_Key?: string;
  Code?: string;
  Description?: string;
  EmployeeType?: string;
  Department_Key?: string;
  Position_Key?: string;
  IsFolder?: boolean;
  DeletionMark?: boolean;
};
type TimesheetRow = {
  Number?: string;
  Date?: string;
  Posted?: boolean;
  RegistrationPeriod?: string;
  Comment?: string;
  HoursWorkedPerPeriod?: Array<Record<string, unknown>>;
  DeletionMark?: boolean;
};
type LookupRow = { Ref_Key?: string; Code?: string; Description?: string; DeletionMark?: boolean };

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function leadCard(lead: LeadRow) {
  const description = (lead.Description || "").trim();
  const referenceMatch = description.match(/^(.*?)\s*·\s*(DL-[A-Z0-9-]+)$/i);
  const details = lead.KanbanDescription || "";
  const field = (label: string) => details.match(new RegExp(`(?:^|\\n)${label}:\\s*([^\\r\\n]+)`, "i"))?.[1]?.trim() || "—";
  const jsonText = (name: string) => details.match(new RegExp(`"${name}"\\s*:\\s*"([^"]+)"`, "i"))?.[1]?.trim() || "";
  let quote: Record<string, any> = {};
  const jsonMarker = "DATI COMPLETI PREVENTIVO (JSON)";
  const jsonStart = details.indexOf(jsonMarker);
  if (jsonStart >= 0) {
    try {
      quote = JSON.parse(details.slice(jsonStart + jsonMarker.length).trim()) as Record<string, any>;
    } catch {
      quote = {};
    }
  }
  return {
    code: lead.Code || "—",
    created: lead.Created || null,
    potential: oneCNumericValue(lead.Potential),
    customer: referenceMatch?.[1]?.trim() || `Cliente ${lead.Code || "1C"}`,
    quoteReference: referenceMatch?.[2] || "—",
    contactName: field("Referente"),
    email: field("Email"),
    phone: field("Telefono"),
    service: field("Servizio") === "—" ? "Preventivo Dalecom" : field("Servizio"),
    job: String(quote.job?.intervention || jsonText("intervention") || "Preventivo Dalecom"),
    equipment: String(quote.main_equipment?.asset_name || jsonText("asset_name")),
    location: [quote.site?.municipality || jsonText("municipality"), quote.site?.province || jsonText("province")].filter(Boolean).join(" · "),
    duration: String(quote.schedule?.duration_label || jsonText("duration_label")),
  };
}

export async function GET() {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const baseUrl = runtimeEnv.ONEC_ODATA_URL?.replace(/\/$/, "");
  const username = runtimeEnv.ONEC_USERNAME;
  const password = runtimeEnv.ONEC_PASSWORD;
  if (!baseUrl || !username || !password) {
    return json({ success: false, error: "Collegamento 1C non configurato" }, 503);
  }

  const headers = {
    Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    Accept: "application/json",
    "Cache-Control": "no-cache, no-store, max-age=0",
    Pragma: "no-cache",
  };

  async function rows<T>(entity: string, select: string, identityField: "Code" | "Number", orderBy?: string, top = 500) {
    // Il proxy davanti a 1C conserva alcune risposte OData anche quando il client
    // richiede no-store. Un confronto sempre vero con un valore impossibile rende
    // univoca la URL senza cambiare i record restituiti.
    const cacheKey = `DALECOM-CACHE-${Date.now()}-${crypto.randomUUID()}`;
    const filter = `DeletionMark eq false and ${identityField} ne '${cacheKey}'`;
    const query = [
      `$select=${encodeURIComponent(select).replaceAll("%2C", ",")}`,
      `$filter=${encodeURIComponent(filter)}`,
      `$top=${top}`,
      ...(orderBy ? [`$orderby=${encodeURIComponent(orderBy)}`] : []),
    ].join("&");
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
    const [leads, orders, employees, timesheets, counterparties, positions, departments, orderStatuses] = await Promise.all([
      rows<LeadRow>("Catalog_Leads", "Code,Created,Potential,Description,KanbanDescription,DeletionMark", "Code", "Created desc"),
      rows<OrderRow>("Document_SalesOrder", "Number,Date,DocumentAmount,Posted,Closed,Comment,Counterparty_Key,Responsible_Key,OrderState_Key,DeletionMark", "Number", "Date desc"),
      rows<EmployeeRow>("Catalog_Employees", "Ref_Key,Code,Description,EmployeeType,Department_Key,Position_Key,IsFolder,DeletionMark", "Code"),
      rows<TimesheetRow>("Document_Timesheet", "Number,Date,Posted,RegistrationPeriod,Comment,HoursWorkedPerPeriod,DeletionMark", "Number", "Date desc"),
      rows<LookupRow>("Catalog_Counterparties", "Ref_Key,Code,Description,DeletionMark", "Code"),
      rows<LookupRow>("Catalog_Positions", "Ref_Key,Code,Description,DeletionMark", "Code"),
      rows<LookupRow>("Catalog_BusinessUnits", "Ref_Key,Code,Description,DeletionMark", "Code"),
      rows<LookupRow>("Catalog_SalesOrderStatuses", "Ref_Key,Code,Description,DeletionMark", "Code"),
    ]);
    const activeEmployees = employees.filter((employee) => employee.IsFolder !== true);
    const leadCards = leads.map(leadCard).sort((a, b) => b.code.localeCompare(a.code, "it", { numeric: true }));
    const names = (items: LookupRow[] | EmployeeRow[]) => new Map(items.map((item) => [item.Ref_Key || "", item.Description || ""]));
    const counterpartyNames = names(counterparties);
    const employeeNames = names(activeEmployees);
    const positionNames = names(positions);
    const departmentNames = names(departments);
    const orderStatusNames = names(orderStatuses);
    const orderCards = orders.map((order) => ({
      number: order.Number || "—",
      date: order.Date || null,
      amount: oneCNumericValue(order.DocumentAmount),
      customer: counterpartyNames.get(order.Counterparty_Key || "") || "Cliente non associato",
      responsible: employeeNames.get(order.Responsible_Key || "") || "Non assegnato",
      status: order.Closed ? "Chiuso" : orderStatusNames.get(order.OrderState_Key || "") || (order.Posted ? "Registrato" : "Bozza"),
      posted: Boolean(order.Posted),
      closed: Boolean(order.Closed),
      comment: (order.Comment || "").trim(),
    })).sort((a, b) => b.number.localeCompare(a.number, "it", { numeric: true }));
    const employeeCards = activeEmployees.map((employee) => ({
      code: employee.Code || "—",
      name: employee.Description || `Dipendente ${employee.Code || "1C"}`,
      type: employee.EmployeeType === "Standard" ? "Dipendente" : employee.EmployeeType || "Collaboratore",
      position: positionNames.get(employee.Position_Key || "") || "Ruolo da completare",
      department: departmentNames.get(employee.Department_Key || "") || "Reparto da completare",
    })).sort((a, b) => a.name.localeCompare(b.name, "it"));
    const timesheetCards = timesheets.map((timesheet) => {
      const entries = Array.isArray(timesheet.HoursWorkedPerPeriod) ? timesheet.HoursWorkedPerPeriod : [];
      const people = new Set(entries.map((entry) => String(entry.Employee_Key || "")).filter(Boolean));
      const hours = entries.reduce((sum, entry) => sum + Object.entries(entry).reduce((lineTotal, [key, value]) => /Hours\d+$/i.test(key) ? lineTotal + oneCNumericValue(value) : lineTotal, 0), 0);
      return {
        number: timesheet.Number || "—",
        date: timesheet.Date || null,
        period: timesheet.RegistrationPeriod || null,
        posted: Boolean(timesheet.Posted),
        status: timesheet.Posted ? "Registrato" : "Da approvare",
        people: people.size,
        hours,
        comment: (timesheet.Comment || "").trim(),
      };
    }).sort((a, b) => b.number.localeCompare(a.number, "it", { numeric: true }));

    return json({
      success: true,
      source: "1C ERP · OData live",
      generatedAt: new Date().toISOString(),
      privacy: "Schede commerciali senza contatti personali; email e telefoni non sono esposti",
      kpis: {
        leads: leads.length,
        leadPotential: leads.reduce((sum, lead) => sum + oneCNumericValue(lead.Potential), 0),
        orders: orders.length,
        orderValue: orders.reduce((sum, order) => sum + oneCNumericValue(order.DocumentAmount), 0),
        employees: activeEmployees.length,
        timesheets: timesheets.length,
        postedOrders: orders.filter((order) => order.Posted).length,
        postedTimesheets: timesheets.filter((timesheet) => timesheet.Posted).length,
      },
      recent: {
        leads: leadCards.slice(0, 5),
        orders: orderCards.slice(0, 5),
      },
      leadCards,
      orderCards,
      employeeCards,
      timesheetCards,
    });
  } catch (error) {
    console.error("1C dashboard read failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "unknown error",
    });
    return json({ success: false, error: "Dati 1C momentaneamente non disponibili" }, 502);
  }
}
