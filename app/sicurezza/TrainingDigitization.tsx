"use client";

import { useMemo, useRef, useState } from "react";
import { safetyEmployees } from "../safety-data";
import { buildDigitalDossier, canCloseTraining, COURSE_CERTIFIER_EMAIL, courseCatalog, createTrainingEnrollment, type DigitalCourseDocument, type TrainingEnrollment } from "../safety-training-workflow";
import styles from "./training.module.css";
import documentStyles from "./document-preview.module.css";

type View = "planner" | "tablet" | "archive";
type TabletStep = "folder" | "test" | "signatures" | "close";

const questions = [
  { id: "q1", label: "Chi deve rispettare le procedure di sicurezza?", answers: ["Solo il preposto", "Tutte le persone coinvolte", "Solo i nuovi assunti"], correct: 1 },
  { id: "q2", label: "Quando devono essere utilizzati i DPI?", answers: ["Quando previsto da valutazione e procedure", "Solo durante le visite", "A scelta del lavoratore"], correct: 0 },
  { id: "q3", label: "Cosa deve fare il preposto davanti a un pericolo grave?", answers: ["Attendere", "Interrompere l’attività e segnalare", "Annotarlo a fine mese"], correct: 1 },
  { id: "q4", label: "Perché si registra un near miss?", answers: ["Per prevenire eventi futuri", "Solo per fini statistici", "Non è necessario"], correct: 0 },
  { id: "q5", label: "Una protezione macchina rimossa consente l’uso?", answers: ["Sì, con cautela", "Solo per pochi minuti", "No, l’uso va impedito"], correct: 2 },
];

function SignaturePad({ label, signed, onConfirm }: { label: string; signed: boolean; onConfirm: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    canvas.setPointerCapture(event.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = point(event);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); drawing.current = true;
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = event.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = point(event);
    ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.strokeStyle = "#0c2834";
    ctx.lineTo(p.x, p.y); ctx.stroke(); setHasInk(true);
  };
  const stop = () => { drawing.current = false; };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  return <article className={styles.signatureCard}>
    <header><div><small>FIRMA SU TABLET</small><b>{label}</b></div><span className={signed ? styles.done : ""}>{signed ? "Firmato" : "Da firmare"}</span></header>
    <canvas ref={canvasRef} width={720} height={180} aria-label={`Area firma ${label}`} onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} />
    <footer><button onClick={clear} disabled={signed}>Cancella</button><button onClick={onConfirm} disabled={!hasInk || signed}>{signed ? "✓ Firma acquisita" : "Conferma firma"}</button></footer>
  </article>;
}

export default function TrainingDigitization() {
  const [view, setView] = useState<View>("planner");
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [draggedName, setDraggedName] = useState<string | null>(null);
  const [draftNames, setDraftNames] = useState<string[]>([]);
  const [courseCode, setCourseCode] = useState(courseCatalog[0].code);
  const [courseDate, setCourseDate] = useState("2026-09-10");
  const [trainer, setTrainer] = useState("Calio’ Salvatore");
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tabletStep, setTabletStep] = useState<TabletStep>("folder");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState("");
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);

  const employees = useMemo(() => safetyEmployees.filter((employee) => employee.name.toLowerCase().includes(employeeQuery.toLowerCase())), [employeeQuery]);
  const active = enrollments.find((item) => item.id === activeId) || null;
  const selectedCourse = courseCatalog.find((course) => course.code === courseCode) || courseCatalog[0];
  const activeCourse = active ? courseCatalog.find((course) => course.code === active.courseCode) || courseCatalog[0] : selectedCourse;

  const addParticipant = (name: string | null) => {
    if (!name || draftNames.includes(name)) return;
    if (draftNames.length >= 20) { setNotice("Limite raggiunto: una singola edizione può contenere al massimo 20 dipendenti."); return; }
    setDraftNames((names) => [...names, name]);
  };

  const updateActive = (change: Partial<TrainingEnrollment>) => {
    if (!activeId) return;
    setEnrollments((items) => items.map((item) => item.id === activeId ? { ...item, ...change } : item));
  };
  const openTablet = (id: string) => { setActiveId(id); setTabletStep("folder"); setPreviewDocumentId(null); setView("tablet"); setNotice(""); };
  const schedule = async () => {
    const participants = draftNames.map((name) => safetyEmployees.find((item) => item.name === name)).filter((employee): employee is (typeof safetyEmployees)[number] => Boolean(employee));
    if (!participants.length) return;
    const employee = participants[0];
    const enrollment = createTrainingEnrollment({ employeeName: employee.name, employeeRole: employee.role, employeeBranch: employee.branch, participants: participants.map((item) => ({ name: item.name, role: item.role, branch: item.branch })), course: selectedCourse, date: courseDate, trainer });
    let savedEnrollment = { ...enrollment, emailStatus: "prepared" as const };
    let transportConfigured = false;
    try {
      const response = await fetch("/api/safety/course-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants: participants.map((item) => ({ name: item.name, role: item.role, branch: item.branch })), courseCode: selectedCourse.code, courseDate, trainer }),
      });
      const result = await response.json() as { success?: boolean; enrollment?: TrainingEnrollment; mailTransportConfigured?: boolean };
      if (response.ok && result.success && result.enrollment) savedEnrollment = result.enrollment;
      transportConfigured = Boolean(result.mailTransportConfigured);
    } catch { /* La dimostrazione continua anche senza collegamento server locale. */ }
    setEnrollments((items) => [savedEnrollment, ...items]);
    setDraftNames([]);
    setNotice(transportConfigured
      ? `Edizione con ${participants.length} partecipanti generata e inviata automaticamente a ${COURSE_CERTIFIER_EMAIL}.`
      : `Edizione con ${participants.length} partecipanti generata senza compilazione manuale. Destinatario bloccato su ${COURSE_CERTIFIER_EMAIL}; il trasporto automatico deve essere collegato prima della produzione.`);
  };
  const sendEmailDraft = (enrollment: TrainingEnrollment) => {
    const subject = encodeURIComponent(`Dalecom · ${enrollment.courseCode} · ${enrollment.participants.length} partecipanti`);
    const roster = enrollment.participants.map((participant, index) => `${index + 1}. ${participant.name} · ${participant.role}`).join("\n");
    const body = encodeURIComponent(`Buongiorno,\n\ntrasmettiamo il fascicolo digitale già precompilato per il corso:\n${enrollment.courseTitle}\nData: ${enrollment.date}\nDocente: ${enrollment.trainer}\nPartecipanti: ${enrollment.participants.length}\n\n${roster}\n\nRiferimento: ${enrollment.id}\n\nDalecom HSE`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(COURSE_CERTIFIER_EMAIL)}&su=${subject}&body=${body}`, "_blank", "noopener,noreferrer");
    setEnrollments((items) => items.map((item) => item.id === enrollment.id ? { ...item, emailStatus: "prepared" } : item));
  };
  const submitTest = () => {
    if (Object.keys(answers).length !== questions.length) { setNotice("Completa tutte le risposte prima di consegnare il test."); return; }
    const correct = questions.filter((question) => answers[question.id] === question.correct).length;
    const score = Math.round((correct / questions.length) * 100);
    updateActive({ testScore: score, status: "In corso" });
    setNotice(`Test registrato: ${score}% · ${score >= 80 ? "superato" : "da ripetere"}.`);
  };
  const closeTraining = () => {
    if (!active || !canCloseTraining(active)) { setNotice("Chiusura bloccata: servono test superato, firma dipendente, firma docente e prova pratica quando prevista."); return; }
    updateActive({ status: "Completato" });
    setNotice("Corso chiuso: attestato e nuova scadenza pronti per Safety Passport, Logista e 1C.");
  };

  const documentPreview = (document: DigitalCourseDocument) => {
    if (!active) return null;
    const participantLabel = document.scope === "collective" ? `${active.participants.length} dipendenti` : `${active.participants.length} documenti individuali`;
    const commonRows = [
      ["Azienda", "Dalecom S.r.l."], ["Partecipanti", participantLabel], ["Corso", active.courseTitle], ["Codice corso", active.courseCode],
      ["Data", active.date], ["Durata", `${activeCourse.hours} ore (${activeCourse.theoryHours} teoria + ${activeCourse.practicalHours} pratica)`],
      ["Docente", active.trainer], ["Responsabile interno", "Calio’ Salvatore"],
    ];
    const specificRows: Record<string, string[][]> = {
      enrollment: [["Stato iscrizione", "Dati anagrafici verificati e fascicolo generato"], ["Destinatario", COURSE_CERTIFIER_EMAIL]],
      privacy: [["Informativa", "Predisposta per presa visione sul tablet"], ["Firma dipendente", active.employeeSigned ? "Acquisita digitalmente" : "Da acquisire durante il corso"]],
      attendance: [["Registro", `Unico documento collettivo con ${active.participants.length} righe`], ["Ingresso / uscita", "Da registrare automaticamente il giorno del corso"], ["Presenze", "In attesa dell’avvio del corso"]],
      test: [["Questionario", `${questions.length} domande già predisposte`], ["Esito", active.testScore === null ? "Da svolgere sul tablet" : `${active.testScore}%`]],
      practical: [["Prova pratica", active.practicalPassed === null ? "Da valutare dal docente" : active.practicalPassed ? "Idoneo" : "Non idoneo"], ["Firma docente", active.trainerSigned ? "Acquisita digitalmente" : "Da acquisire"]],
      minutes: [["Verbale", `Unico documento collettivo per l’edizione`], ["Esiti individuali", active.testScore === null ? "Da completare" : `${active.testScore}%`], ["Firma docente", active.trainerSigned ? "Acquisita" : "Da acquisire"]],
      certificate: [["Stato attestato", active.status === "Completato" ? "Pronto per emissione" : "Bloccato fino alla chiusura del corso"], ["Aggiornamento previsto", activeCourse.renewal]],
    };
    return <div className={documentStyles.previewBackdrop} role="presentation" onClick={() => setPreviewDocumentId(null)}><section className={documentStyles.documentPreview} role="dialog" aria-modal="true" aria-label={`Anteprima ${document.title}`} onClick={(event) => event.stopPropagation()}>
      <header><div><span>DALECOM</span><small>FASCICOLO FORMAZIONE DIGITALE</small></div><button onClick={() => setPreviewDocumentId(null)} aria-label="Chiudi anteprima">×</button></header>
      <div className={documentStyles.documentHeading}><small>{active.id}</small><h4>{document.title}</h4><p>Documento generato automaticamente dai dati aziendali. Nessuna ricompilazione manuale.</p></div>
      <dl>{[...commonRows, ...(specificRows[document.id] || [])].map(([label, value]) => <div key={`${document.id}-${label}`}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className={documentStyles.roster}><b>{document.scope === "collective" ? "Elenco nel documento collettivo" : "File individuali generati"}</b>{active.participants.map((participant, index) => <span key={participant.name}><i>{index + 1}</i>{participant.name}<small>{participant.role} · {participant.branch}</small></span>)}</div>
      <footer><span>Stato: <b>{document.status === "ready" ? "Precompilato" : document.status === "locked" ? "Vincolato alla chiusura" : "Precompilato · completamento sul tablet"}</b></span><small>Tracciatura digitale · versione 1 · {active.createdAt.slice(0, 10)}</small></footer>
    </section></div>;
  };

  return <section className={styles.shell}>
    <header className={styles.titlebar}>
      <div><small>GESTIONE FORMAZIONE ZERO CARTA</small><h2>Dal calendario al fascicolo firmato</h2><p>Salvatore assegna il corso. I documenti nascono già compilati. Dipendente e docente lavorano sul tablet.</p></div>
      <div className={styles.destination}><span>DESTINATARIO FISSO</span><b>{COURSE_CERTIFIER_EMAIL}</b><small>Mai modificabile dall’operatore</small></div>
    </header>

    <nav className={styles.tabs} aria-label="Gestione corsi digitali">
      <button className={view === "planner" ? styles.active : ""} onClick={() => setView("planner")}>1 · Pianificazione</button>
      <button className={view === "tablet" ? styles.active : ""} onClick={() => setView("tablet")} disabled={!active}>2 · Tablet corso</button>
      <button className={view === "archive" ? styles.active : ""} onClick={() => setView("archive")}>3 · Fascicoli</button>
    </nav>

    {notice && <div className={styles.notice}>{notice}<button onClick={() => setNotice("")}>×</button></div>}

    {view === "planner" && <div className={styles.planner}>
      <aside className={styles.employeeRail}>
        <header><div><small>ANAGRAFICA DIPENDENTI</small><b>Trascina sul nuovo corso</b></div><input value={employeeQuery} onChange={(event) => setEmployeeQuery(event.target.value)} placeholder="Cerca persona" /></header>
        <div>{employees.map((employee) => <button key={employee.name} draggable disabled={draftNames.includes(employee.name)} onDragStart={() => setDraggedName(employee.name)} onDragEnd={() => setDraggedName(null)} onClick={() => addParticipant(employee.name)}>
          <i>{employee.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</i><span><b>{employee.name}</b><small>{employee.role} · {employee.branch}</small></span><em>⋮⋮</em>
        </button>)}</div>
      </aside>

      <section className={styles.scheduleBoard}>
        <div className={styles.coursePicker}>
          <div className={styles.coursePickerTitle}>
            <span>1</span>
            <div><small>PRIMA SCEGLI IL CORSO</small><b>Tipo di corso da organizzare</b></div>
          </div>
          <label>Tipo di corso
            <select value={courseCode} onChange={(event) => setCourseCode(event.target.value)}>
              {courseCatalog.map((course) => <option key={course.code} value={course.code}>{course.title} · {course.hours} h</option>)}
            </select>
          </label>
          <label>Data corso<input type="date" value={courseDate} onChange={(event) => setCourseDate(event.target.value)} /></label>
          <label>Docente<input value={trainer} onChange={(event) => setTrainer(event.target.value)} /></label>
          <div className={styles.courseSummary}><span><small>TEORIA</small><b>{selectedCourse.theoryHours} h</b></span><span><small>PRATICA</small><b>{selectedCourse.practicalHours} h</b></span><span><small>AGGIORNAMENTO</small><b>{selectedCourse.renewal}</b></span></div>
        </div>
        <div className={`${styles.dropzone} ${draggedName ? styles.dragging : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addParticipant(draggedName); setDraggedName(null); }}>
          <span>2</span><div><b>Assegna fino a 20 dipendenti a “{selectedCourse.title}”</b><small>Trascina o seleziona i nomi uno dopo l’altro · {draftNames.length}/20 aggiunti.</small></div>
        </div>
        {draftNames.length > 0 && <div className={styles.setup}>
          <header><div><small>PARTECIPANTI ALLA STESSA EDIZIONE</small><h3>{draftNames.length} dipendent{draftNames.length === 1 ? "e" : "i"} su 20</h3></div><button onClick={() => setDraftNames([])} aria-label="Svuota elenco">×</button></header>
          <div className={documentStyles.selectedRoster}>{draftNames.map((name, index) => <div key={name}><i>{index + 1}</i><span><b>{name}</b><small>{safetyEmployees.find((employee) => employee.name === name)?.role}</small></span><button onClick={() => setDraftNames((names) => names.filter((item) => item !== name))} aria-label={`Rimuovi ${name}`}>×</button></div>)}</div>
          <p className={styles.confirmCourse}><b>{selectedCourse.title}</b><span>{selectedCourse.hours} ore · {courseDate} · docente {trainer}</span></p>
          <footer><div><small>ALLA CONFERMA</small><b>Documenti individuali + registro e verbale collettivi · invio a {COURSE_CERTIFIER_EMAIL}</b></div><button onClick={schedule}>Genera fascicolo aula</button></footer>
        </div>}
        <div className={styles.enrollmentList}>
          <header><div><small>EDIZIONI CREATE</small><b>{enrollments.length} fascicoli digitali</b></div></header>
          {!enrollments.length && <div className={styles.empty}>Trascina un dipendente nella casella per iniziare.</div>}
          {enrollments.map((item) => <article key={item.id}><div className={styles.statusDot} /><div><small>{item.courseCode} · {item.date}</small><b>{item.participants.length} partecipanti</b><span>{item.courseTitle}</span></div><em>{item.status}</em><div className={styles.rowActions}><button onClick={() => sendEmailDraft(item)}>Email certificatore</button><button onClick={() => openTablet(item.id)}>Apri tablet →</button></div></article>)}
        </div>
      </section>
    </div>}

    {view === "tablet" && active && <div className={styles.tabletShell}>
      <aside className={styles.tabletPerson}><div className={styles.bigAvatar}>{active.participants.length}</div><small>EDIZIONE COLLETTIVA</small><h3>{active.participants.length} partecipanti</h3><p>{active.participants.slice(0, 4).map((participant) => participant.name).join(" · ")}{active.participants.length > 4 ? ` · +${active.participants.length - 4}` : ""}</p><hr /><b>{active.courseTitle}</b><span>{active.date} · {active.trainer}</span></aside>
      <section className={styles.tabletWork}>
        <nav>{(["folder", "test", "signatures", "close"] as TabletStep[]).map((step, index) => <button key={step} className={tabletStep === step ? styles.active : ""} onClick={() => setTabletStep(step)}>{index + 1}<span>{step === "folder" ? "Documenti" : step === "test" ? "Test" : step === "signatures" ? "Firme" : "Chiusura"}</span></button>)}</nav>
        {tabletStep === "folder" && <div className={styles.folder}><header><small>DOCUMENTI GIÀ PRECOMPILATI</small><h3>Nessun dato da riscrivere</h3></header>{buildDigitalDossier(activeCourse).map((document) => <article className={documentStyles.documentRow} key={document.id}><i>{document.status === "ready" ? "✓" : document.status === "locked" ? "🔒" : "○"}</i><div><b>{document.title}</b><small>{document.scope === "collective" ? `1 documento collettivo · ${active.participants.length} nominativi` : `${active.participants.length} documenti individuali`} · Responsabile: {document.owner}</small></div><span>{document.status === "ready" ? "Pronto" : document.status === "locked" ? "Dopo la chiusura" : "Da completare sul tablet"}</span><button className={documentStyles.openButton} onClick={() => setPreviewDocumentId(document.id)}>Apri documento</button></article>)}{previewDocumentId && documentPreview(buildDigitalDossier(activeCourse).find((document) => document.id === previewDocumentId)!)}</div>}
        {tabletStep === "test" && <div className={styles.test}><header><small>TEST DIGITALE</small><h3>{active.testScore === null ? "Rispondi e consegna" : `Ultimo risultato ${active.testScore}%`}</h3></header>{questions.map((question, index) => <fieldset key={question.id}><legend>{index + 1}. {question.label}</legend>{question.answers.map((answer, answerIndex) => <label key={answer}><input type="radio" name={question.id} checked={answers[question.id] === answerIndex} onChange={() => setAnswers((value) => ({ ...value, [question.id]: answerIndex }))} />{answer}</label>)}</fieldset>)}<button className={styles.primary} onClick={submitTest}>Consegna test</button></div>}
        {tabletStep === "signatures" && <div className={styles.signatures}><SignaturePad label={`Dipendente · ${active.employeeName}`} signed={active.employeeSigned} onConfirm={() => updateActive({ employeeSigned: true, status: "In corso" })} /><SignaturePad label={`Docente · ${active.trainer}`} signed={active.trainerSigned} onConfirm={() => updateActive({ trainerSigned: true, status: "Da chiudere" })} /></div>}
        {tabletStep === "close" && <div className={styles.closure}><header><small>VERIFICA FINALE</small><h3>Chiusura del fascicolo</h3></header>{activeCourse.requiresPracticalAssessment && <label>Esito prova pratica<select value={active.practicalPassed === null ? "" : active.practicalPassed ? "yes" : "no"} onChange={(event) => updateActive({ practicalPassed: event.target.value === "" ? null : event.target.value === "yes" })}><option value="">Seleziona esito</option><option value="yes">Idoneo</option><option value="no">Non idoneo</option></select></label>}<div className={styles.checklist}><span className={active.testScore !== null && active.testScore >= 80 ? styles.ok : ""}>Test ≥ 80%</span><span className={active.employeeSigned ? styles.ok : ""}>Firma dipendente</span><span className={active.trainerSigned ? styles.ok : ""}>Firma docente</span><span className={active.practicalPassed === true ? styles.ok : ""}>Prova pratica</span></div><button className={styles.primary} onClick={closeTraining} disabled={active.status === "Completato"}>{active.status === "Completato" ? "✓ Fascicolo completato" : "Chiudi corso e aggiorna Safety Passport"}</button></div>}
      </section>
    </div>}

    {view === "archive" && <div className={styles.archive}><header><div><small>ARCHIVIO DIGITALE</small><h3>Edizioni, firme, esiti e scadenze</h3></div><span>{enrollments.filter((item) => item.status === "Completato").length} completati</span></header>{!enrollments.length ? <div className={styles.empty}>Nessun fascicolo creato in questa sessione.</div> : enrollments.map((item) => <article key={item.id}><div><small>{item.id}</small><b>{item.participants.length} partecipanti</b><span>{item.courseTitle} · {item.date}</span></div><div><small>TEST</small><b>{item.testScore === null ? "—" : `${item.testScore}%`}</b></div><div><small>FIRME</small><b>{Number(item.employeeSigned) + Number(item.trainerSigned)}/2</b></div><em>{item.status}</em><button onClick={() => openTablet(item.id)}>Apri fascicolo</button></article>)}</div>}
  </section>;
}
