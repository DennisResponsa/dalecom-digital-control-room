import test from "node:test";
import assert from "node:assert/strict";
import { buildDigitalDossier, canCloseTraining, COURSE_CERTIFIER_EMAIL, courseCatalog, createTrainingEnrollment } from "../app/safety-training-workflow.ts";

test("il destinatario del certificatore è fisso", () => {
  const enrollment = createTrainingEnrollment({ employeeName: "Mario Rossi", employeeRole: "Operatore", employeeBranch: "Paese", course: courseCatalog[0], date: "2026-09-10", trainer: "Salvatore Calio’", now: new Date("2026-09-08T12:00:00Z") });
  assert.equal(enrollment.recipient, COURSE_CERTIFIER_EMAIL);
  assert.equal(enrollment.recipient, "corsi.hse@gmail.com");
});

test("il catalogo espone tutte le tipologie presenti nel Word Corsi Formazione", () => {
  assert.deepEqual(
    courseCatalog.map((course) => course.code),
    ["LAV-16", "SPEC-12", "PREP-12", "DPI3-8", "QUOTA-8", "TRAB-4", "PLE-10", "CARRELLO-12", "PALA-10", "GRUM-14", "AUTOGRU-14", "POMPA-14", "CONF-8"],
  );
});

test("il fascicolo nasce già precompilato e include la prova pratica solo quando serve", () => {
  const theory = buildDigitalDossier(courseCatalog.find((course) => course.code === "SPEC-12")!);
  const pump = buildDigitalDossier(courseCatalog.find((course) => course.code === "POMPA-14")!);
  assert.ok(theory.some((document) => document.id === "enrollment" && document.status === "ready"));
  assert.equal(theory.some((document) => document.id === "practical"), false);
  assert.equal(pump.some((document) => document.id === "practical"), true);
  assert.equal(pump.find((document) => document.id === "attendance")?.scope, "collective");
  assert.equal(pump.find((document) => document.id === "minutes")?.scope, "collective");
  assert.equal(pump.find((document) => document.id === "certificate")?.scope, "individual");
});

test("una edizione conserva un massimo di 20 partecipanti", () => {
  const participants = Array.from({ length: 25 }, (_, index) => ({ name: `Dipendente ${index + 1}`, role: "Operatore", branch: "Paese" }));
  const enrollment = createTrainingEnrollment({ employeeName: participants[0].name, employeeRole: participants[0].role, employeeBranch: participants[0].branch, participants, course: courseCatalog[0], date: "2026-09-10", trainer: "Salvatore Calio’" });
  assert.equal(enrollment.participants.length, 20);
});

test("il corso si chiude solo con test, firme e prova pratica", () => {
  const enrollment = createTrainingEnrollment({ employeeName: "Mario Rossi", employeeRole: "Operatore", employeeBranch: "Paese", course: courseCatalog.find((course) => course.code === "POMPA-14")!, date: "2026-09-10", trainer: "Salvatore Calio’" });
  assert.equal(canCloseTraining(enrollment), false);
  assert.equal(canCloseTraining({ ...enrollment, testScore: 90, employeeSigned: true, trainerSigned: true, practicalPassed: true }), true);
});
