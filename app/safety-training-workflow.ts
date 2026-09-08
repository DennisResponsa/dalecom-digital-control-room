export const COURSE_CERTIFIER_EMAIL = "corsi.hse@gmail.com";

export type CourseDefinition = {
  code: string;
  title: string;
  hours: number;
  theoryHours: number;
  practicalHours: number;
  renewal: string;
  requiresPracticalAssessment: boolean;
};

export const courseCatalog: CourseDefinition[] = [
  { code: "LAV-16", title: "Lavoratore edilizia · generale + specifica rischio alto", hours: 16, theoryHours: 16, practicalHours: 0, renewal: "6 ore ogni 5 anni · CCNL Edilizia: 3 anni", requiresPracticalAssessment: false },
  { code: "SPEC-12", title: "Formazione specifica · rischio alto", hours: 12, theoryHours: 12, practicalHours: 0, renewal: "6 ore ogni 5 anni · CCNL Edilizia: 3 anni", requiresPracticalAssessment: false },
  { code: "PREP-12", title: "Preposto", hours: 12, theoryHours: 12, practicalHours: 0, renewal: "6 ore ogni 2 anni", requiresPracticalAssessment: false },
  { code: "DPI3-8", title: "DPI III categoria · anticaduta", hours: 8, theoryHours: 4, practicalHours: 4, renewal: "4–8 ore · periodicità consigliata 5 anni", requiresPracticalAssessment: true },
  { code: "QUOTA-8", title: "Lavori in quota", hours: 8, theoryHours: 4, practicalHours: 4, renewal: "4 ore ogni 5 anni", requiresPracticalAssessment: true },
  { code: "TRAB-4", title: "Trabattelli", hours: 4, theoryHours: 1, practicalHours: 3, renewal: "4 ore ogni 5 anni", requiresPracticalAssessment: true },
  { code: "PLE-10", title: "Piattaforme di lavoro elevabili", hours: 10, theoryHours: 4, practicalHours: 6, renewal: "4 ore ogni 5 anni", requiresPracticalAssessment: true },
  { code: "CARRELLO-12", title: "Carrello elevatore", hours: 12, theoryHours: 8, practicalHours: 4, renewal: "4 ore ogni 5 anni", requiresPracticalAssessment: true },
  { code: "PALA-10", title: "Pala caricatrice frontale", hours: 10, theoryHours: 4, practicalHours: 6, renewal: "4 ore ogni 5 anni", requiresPracticalAssessment: true },
  { code: "GRUM-14", title: "Gru mobile", hours: 14, theoryHours: 7, practicalHours: 7, renewal: "4 ore ogni 5 anni", requiresPracticalAssessment: true },
  { code: "AUTOGRU-14", title: "Autogru", hours: 14, theoryHours: 7, practicalHours: 7, renewal: "4 ore ogni 5 anni", requiresPracticalAssessment: true },
  { code: "POMPA-14", title: "Addetto alla conduzione di pompe per calcestruzzo", hours: 14, theoryHours: 7, practicalHours: 7, renewal: "4 ore ogni 5 anni", requiresPracticalAssessment: true },
  { code: "CONF-8", title: "Ambienti sospetti di inquinamento o confinati", hours: 8, theoryHours: 4, practicalHours: 4, renewal: "4 ore ogni 5 anni", requiresPracticalAssessment: true },
];

export type DigitalCourseDocument = {
  id: string;
  title: string;
  owner: "Sistema" | "Dipendente" | "Docente" | "Salvatore" | "Certificatore";
  status: "ready" | "pending" | "locked";
};

export function buildDigitalDossier(course: CourseDefinition): DigitalCourseDocument[] {
  return [
    { id: "enrollment", title: "Scheda d’iscrizione precompilata", owner: "Sistema", status: "ready" },
    { id: "privacy", title: "Informativa privacy precompilata", owner: "Dipendente", status: "pending" },
    { id: "attendance", title: "Registro presenze digitale", owner: "Sistema", status: "ready" },
    { id: "test", title: "Test finale digitale", owner: "Dipendente", status: "pending" },
    ...(course.requiresPracticalAssessment ? [{ id: "practical", title: "Valutazione prova pratica", owner: "Docente" as const, status: "pending" as const }] : []),
    { id: "minutes", title: "Verbale finale", owner: "Docente", status: "pending" },
    { id: "certificate", title: "Attestato e nuova scadenza", owner: "Certificatore", status: "locked" },
  ];
}

export type TrainingEnrollment = {
  id: string;
  employeeName: string;
  employeeRole: string;
  employeeBranch: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  trainer: string;
  recipient: typeof COURSE_CERTIFIER_EMAIL;
  createdBy: "Salvatore";
  createdAt: string;
  emailStatus: "queued" | "prepared" | "sent";
  testScore: number | null;
  employeeSigned: boolean;
  trainerSigned: boolean;
  practicalPassed: boolean | null;
  status: "Fascicolo pronto" | "In corso" | "Da chiudere" | "Completato";
};

export function createTrainingEnrollment(input: {
  employeeName: string;
  employeeRole: string;
  employeeBranch: string;
  course: CourseDefinition;
  date: string;
  trainer: string;
  now?: Date;
}): TrainingEnrollment {
  const now = input.now ?? new Date();
  return {
    id: `TRN-${now.getTime()}`,
    employeeName: input.employeeName,
    employeeRole: input.employeeRole,
    employeeBranch: input.employeeBranch,
    courseCode: input.course.code,
    courseTitle: input.course.title,
    date: input.date,
    trainer: input.trainer,
    recipient: COURSE_CERTIFIER_EMAIL,
    createdBy: "Salvatore",
    createdAt: now.toISOString(),
    emailStatus: "queued",
    testScore: null,
    employeeSigned: false,
    trainerSigned: false,
    practicalPassed: input.course.requiresPracticalAssessment ? null : true,
    status: "Fascicolo pronto",
  };
}

export function canCloseTraining(enrollment: TrainingEnrollment) {
  return enrollment.testScore !== null && enrollment.testScore >= 80 && enrollment.employeeSigned && enrollment.trainerSigned && enrollment.practicalPassed === true;
}
