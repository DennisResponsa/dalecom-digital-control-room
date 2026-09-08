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
  participants?: Array<{ name?: string; role?: string; branch?: string }>;
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
  const participants = (body.participants?.length ? body.participants : [{ name: body.employeeName, role: body.employeeRole, branch: body.employeeBranch }])
    .filter((participant) => validText(participant.name) && validText(participant.role) && validText(participant.branch))
    .map((participant) => ({ name: participant.name!.trim(), role: participant.role!.trim(), branch: participant.branch!.trim() }));
  const uniqueParticipants = participants.filter((participant, index) => participants.findIndex((item) => item.name === participant.name) === index);
  if (!course || uniqueParticipants.length < 1 || uniqueParticipants.length > 20
      || !validText(body.trainer) || !/^20\d\d-\d\d-\d\d$/.test(body.courseDate || "")) {
    return json({ success: false, error: "Dati iscrizione incompleti" }, 400);
  }

  const firstParticipant = uniqueParticipants[0];
  const enrollment = createTrainingEnrollment({
    employeeName: firstParticipant.name, employeeRole: firstParticipant.role, employeeBranch: firstParticipant.branch,
    participants: uniqueParticipants,
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
  `).bind(enrollment.id, document.id, document.title, document.owner, document.status)), ...uniqueParticipants.map((participant, index) => database.prepare(`
    INSERT INTO training_enrollment_participants (enrollment_id, participant_name, participant_role, participant_branch, roster_position)
    VALUES (?, ?, ?, ?, ?)
  `).bind(enrollment.id, participant.name, participant.role, participant.branch, index + 1))];
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
          subject: `Dalecom · ${enrollment.courseCode} · ${enrollment.participants.length} partecipanti`,
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
