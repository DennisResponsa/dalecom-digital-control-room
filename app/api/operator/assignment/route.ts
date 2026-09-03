import { getD1 } from "../../../../db";

const DEMO_EMPLOYEE_ID = "MARIO_R_084";
const DEMO_EMPLOYEE_NAME = "Mario Rossi";
const DATE_RE = /^2026-(08|09|10)-(0[1-9]|[12]\d|3[01])$/;

type PublishRequest = {
  employeeId?: string;
  employeeName?: string;
  assignmentId?: string;
  projectId?: string;
  orderId?: string;
  siteName?: string;
  siteStart?: string;
  siteEnd?: string;
  workdayDate?: string;
  teamName?: string;
  machineName?: string;
  vehicleName?: string;
  note?: string;
  safetyCompliant?: boolean;
};

type AssignmentRow = PublishRequest & {
  employee_id: string;
  workday_date: string;
  assignment_id: string;
  project_id: string;
  order_id: string;
  site_name: string;
  site_start_epoch_ms: number;
  site_end_epoch_ms: number;
  team_name: string;
  machine_name: string;
  vehicle_name: string;
  instruction_version: string;
  operator_required: number;
  safety_compliant: number;
  note: string;
  published_at_epoch_ms: number;
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function epochAtStart(date: string) {
  return Date.parse(`${date}T00:00:00+03:00`);
}

function validText(value: unknown, max = 160) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const employeeId = url.searchParams.get("employeeId") || "";
  const workdayDate = url.searchParams.get("date") || "";
  if (employeeId !== DEMO_EMPLOYEE_ID || !DATE_RE.test(workdayDate)) {
    return json({ success: false, error: "Profilo o data non validi" }, 400);
  }

  const row = await getD1().prepare(`
    SELECT * FROM operator_assignments
    WHERE employee_id = ? AND workday_date = ?
    ORDER BY published_at_epoch_ms DESC LIMIT 1
  `).bind(employeeId, workdayDate).first<AssignmentRow>();

  if (!row) return json({ success: false, error: "Nessuna giornata pubblicata" }, 404);
  return json({
    success: true,
    source: "Regia Logistica Dalecom · demo live",
    employee: { id: DEMO_EMPLOYEE_ID, name: DEMO_EMPLOYEE_NAME },
    assignment: {
      id: row.assignment_id,
      projectId: row.project_id,
      orderId: row.order_id,
      siteName: row.site_name,
      siteStartEpochMs: row.site_start_epoch_ms,
      siteEndEpochMs: row.site_end_epoch_ms,
      plannedWorkday: {
        date: row.workday_date,
        teamName: row.team_name,
        machineName: row.machine_name,
        vehicleName: row.vehicle_name,
      },
      instructionVersion: row.instruction_version,
      operatorRequired: Boolean(row.operator_required),
      safetyCompliant: Boolean(row.safety_compliant),
      note: row.note,
      publishedAtEpochMs: row.published_at_epoch_ms,
    },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return json({ success: false, error: "Origine richiesta non valida" }, 403);
  }
  let body: PublishRequest;
  try {
    body = await request.json() as PublishRequest;
  } catch {
    return json({ success: false, error: "JSON non valido" }, 400);
  }

  if (body.employeeId !== DEMO_EMPLOYEE_ID || body.employeeName !== DEMO_EMPLOYEE_NAME
      || !DATE_RE.test(body.workdayDate || "") || !DATE_RE.test(body.siteStart || "")
      || !DATE_RE.test(body.siteEnd || "")
      || !validText(body.assignmentId, 100) || !validText(body.projectId, 100)
      || !validText(body.orderId, 100) || !validText(body.siteName)
      || !validText(body.teamName) || !validText(body.machineName)
      || !validText(body.vehicleName)) {
    return json({ success: false, error: "Pianificazione incompleta" }, 400);
  }
  if (body.workdayDate! < body.siteStart! || body.workdayDate! > body.siteEnd!) {
    return json({ success: false, error: "Giornata fuori dal periodo del cantiere" }, 400);
  }

  const publishedAt = Date.now();
  const siteStartEpochMs = epochAtStart(body.siteStart!);
  const siteEndEpochMs = epochAtStart(body.siteEnd!) + 86_399_999;
  const instructionVersion = String(publishedAt);
  await getD1().prepare(`
    INSERT INTO operator_assignments (
      employee_id, workday_date, assignment_id, project_id, order_id, site_name,
      site_start_epoch_ms, site_end_epoch_ms, team_name, machine_name, vehicle_name,
      instruction_version, operator_required, safety_compliant, note, published_at_epoch_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    ON CONFLICT(employee_id, workday_date) DO UPDATE SET
      assignment_id=excluded.assignment_id, project_id=excluded.project_id,
      order_id=excluded.order_id, site_name=excluded.site_name,
      site_start_epoch_ms=excluded.site_start_epoch_ms, site_end_epoch_ms=excluded.site_end_epoch_ms,
      team_name=excluded.team_name, machine_name=excluded.machine_name,
      vehicle_name=excluded.vehicle_name, instruction_version=excluded.instruction_version,
      operator_required=1, safety_compliant=excluded.safety_compliant,
      note=excluded.note, published_at_epoch_ms=excluded.published_at_epoch_ms
  `).bind(
    DEMO_EMPLOYEE_ID, body.workdayDate, body.assignmentId, body.projectId, body.orderId,
    body.siteName, siteStartEpochMs, siteEndEpochMs, body.teamName, body.machineName,
    body.vehicleName, instructionVersion, body.safetyCompliant === false ? 0 : 1,
    (body.note || "").slice(0, 600), publishedAt,
  ).run();

  return json({
    success: true,
    employee: { id: DEMO_EMPLOYEE_ID, name: DEMO_EMPLOYEE_NAME },
    workdayDate: body.workdayDate,
    instructionVersion,
    publishedAtEpochMs: publishedAt,
  }, 201);
}
