import { env } from "cloudflare:workers";
import { getD1 } from "../../../../db";
import { buildDigitalDossier, COURSE_CERTIFIER_EMAIL, courseCatalog, createTrainingEnrollment } from "../../../safety-training-workflow";

type CreateRequest = {
  employeeName?: string;
  employeeRole?: string;
  employeeBranch?: string;
  courseCode?: string;
  courseDate?: string;
  trainer?: string;
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

function validText(value: unknown, max = 160) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ success: false, error: "Origine richiesta non valida" }, 403);

  let body: CreateRequest;
  try { body = await request.json() as CreateRequest; }
  catch { return json({ success: false, error: "JSON non valido" }, 400); }

  const course = courseCatalog.find((item) => item.code === body.courseCode);
  if (!course || !validText(body.employeeName) || !validText(body.employeeRole) || !validText(body.employeeBranch)
      || !validText(body.trainer) || !/^20\d\d-\d\d-\d\d$/.test(body.courseDate || "")) {
    return json({ success: false, error: "Dati iscrizione incompleti" }, 400);
  }

  const enrollment = createTrainingEnrollment({
    employeeName: body.employeeName!, employeeRole: body.employeeRole!, employeeBranch: body.employeeBranch!,
    course, date: body.courseDate!, trainer: body.trainer!,
  });
  const documents = buildDigitalDossier(course);
  const database = getD1();
  const statements = [database.prepare(`
    INSERT INTO training_enrollments (
      id, employee_name, employee_role, employee_branch, course_code, course_title, course_date,
      trainer, recipient, created_by, created_at, updated_at_epoch_ms, email_status, status,
      test_score, employee_signed, trainer_signed, practical_passed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, 0, ?)
  `).bind(
    enrollment.id, enrollment.employeeName, enrollment.employeeRole, enrollment.employeeBranch,
    enrollment.courseCode, enrollment.courseTitle, enrollment.date, enrollment.trainer,
    COURSE_CERTIFIER_EMAIL, enrollment.createdBy, enrollment.createdAt, Date.now(), "queued",
    enrollment.status, enrollment.practicalPassed === null ? null : 1,
  ), ...documents.map((document) => database.prepare(`
    INSERT INTO training_documents (enrollment_id, document_id, title, owner, status)
    VALUES (?, ?, ?, ?, ?)
  `).bind(enrollment.id, document.id, document.title, document.owner, document.status))];
  await database.batch(statements);

  let emailStatus: "queued" | "sent" = "queued";
  const webhook = (env as unknown as { COURSE_MAIL_WEBHOOK_URL?: string }).COURSE_MAIL_WEBHOOK_URL;
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: COURSE_CERTIFIER_EMAIL,
          subject: `Dalecom · iscrizione ${enrollment.courseCode} · ${enrollment.employeeName}`,
          enrollment,
          documents,
        }),
      });
      if (response.ok) emailStatus = "sent";
    } catch { /* La coda resta recuperabile. */ }
  }
  await database.prepare("UPDATE training_enrollments SET email_status = ?, updated_at_epoch_ms = ? WHERE id = ?")
    .bind(emailStatus, Date.now(), enrollment.id).run();

  return json({ success: true, enrollment: { ...enrollment, emailStatus }, documents, mailTransportConfigured: Boolean(webhook) }, 201);
}
