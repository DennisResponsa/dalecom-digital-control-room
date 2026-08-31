"use client";

import { DragEvent, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import reportStyles from "./report.module.css";

type Severity = "critical" | "high" | "medium" | "ok";
type Decision = "pending" | "accepted" | "rejected";
type Finding = {
  id: number; severity: Severity; area: string; title: string; page: string; article: string;
  excerpt: string; issue: string; suggestion: string; source: string; sourceUrl: string; confidence: number;
};

const findings: Finding[] = [
  { id: 1, severity: "critical", area: "DATE E PRESUPPOSTI", title: "Appalto principale indicato come già scaduto", page: "Pagina 1", article: "Premesse", excerpt: "Durata del contratto: dal 31.10.2023 al 04.10.2025 NON TACITAMENTE RINNOVABILE", issue: "Il contratto Dalecom è datato 10/06/2026 e prevede avvio il 15/07/2026. Occorre documentare proroga, rinnovo o nuovo titolo dell’appalto principale prima della firma.", suggestion: "Sostituire il riferimento con gli estremi dell’atto vigente e allegare la proroga o il nuovo affidamento. Condizionare l’efficacia alla verifica documentale.", source: "D.Lgs. 36/2023 · art. 119", sourceUrl: "https://www.normattiva.it/uri-res/N2Ls?urn%3Anir%3Astato%3Adecreto.legislativo%3A2023-03-31%3B36~art119=", confidence: 99 },
  { id: 2, severity: "critical", area: "APPROVAZIONE SPECIFICA", title: "Rinvii numerici non corrispondenti alle clausole", page: "Pagina 7", article: "Richiamo art. 1341 C.C.", excerpt: "17) Foro competente; 18) Facoltà di recesso unilaterale - risoluzione del contratto", issue: "Nel corpo del documento l’art. 17 riguarda la mediazione, l’art. 18 il foro e l’art. 19 il recesso. L’elenco finale non coincide con la numerazione effettiva.", suggestion: "Correggere l’elenco finale: 17 Mediazione; 18 Foro competente; 19 Recesso e risoluzione. Ripetere l’approvazione specifica sul testo definitivo.", source: "Codice civile · artt. 1341-1342", sourceUrl: "https://www.normattiva.it/eli/id/1942/04/04/042U0262/CONSOLIDATED/20260614", confidence: 99 },
  { id: 3, severity: "high", area: "REVISIONE PREZZI", title: "Esclusione assoluta della revisione prezzi", page: "Pagina 3", article: "Art. 5", excerpt: "La revisione prezzi non è riconosciuta ... espressa deroga agli artt. 1467 e 1664 C.C.", issue: "La rinuncia è molto ampia. Se il rapporto ricade nel subappalto o subcontratto collegato a un contratto pubblico, va verificata anche la disciplina vigente sulla revisione prezzi.", suggestion: "Inserire una clausola di adeguamento collegata a variazioni oggettive e alle soglie normative applicabili, con formula e indice chiaramente definiti.", source: "D.Lgs. 36/2023 · art. 119, c. 2-bis", sourceUrl: "https://www.normattiva.it/uri-res/N2Ls?urn%3Anir%3Astato%3Adecreto.legislativo%3A2023-03-31%3B36~art119=", confidence: 94 },
  { id: 4, severity: "high", area: "DURATA E RECESSO", title: "Due settimane ma proroga tacita senza limite", page: "Pagina 3", article: "Art. 6", excerpt: "durata di circa 2 settimane ... tacitamente prorogato fino a manifesta volontà di una delle Parti", issue: "La durata operativa è breve, ma il rinnovo è indeterminato e non disciplina preavviso, prezzi, disponibilità dei mezzi né ordine scritto delle proroghe.", suggestion: "Prevedere proroghe esclusivamente per iscritto, durata massima, nuovo ordine operativo e conferma preventiva di prezzi e disponibilità.", source: "Codice civile · autonomia contrattuale e buona fede", sourceUrl: "https://www.normattiva.it/eli/id/1942/04/04/042U0262/CONSOLIDATED/20260614", confidence: 97 },
  { id: 5, severity: "high", area: "RESPONSABILITÀ", title: "Responsabilità potenzialmente illimitata e rivalsa ambigua", page: "Pagine 3 e 5", article: "Artt. 7 e 12", excerpt: "Le polizze non limiteranno la responsabilità ... rinuncia al diritto di rivalsa nei confronti della Ditta Noleggiatrice", issue: "La responsabilità supera espressamente i massimali. Inoltre la rinuncia alla rivalsa sembra indicare Dalecom, anziché la Ditta Richiedente: formulazione da chiarire con l’assicuratore.", suggestion: "Definire limiti, esclusioni, danni indiretti e responsabilità reciproche. Correggere il beneficiario della rinuncia alla rivalsa e verificare la coerenza con le polizze effettive.", source: "Codice civile · responsabilità contrattuale", sourceUrl: "https://www.normattiva.it/eli/id/1942/04/04/042U0262/CONSOLIDATED/20260614", confidence: 96 },
  { id: 6, severity: "medium", area: "COERENZA INTERNA", title: "Penali assenti ma richiamate nella risoluzione", page: "Pagine 5-6", article: "Artt. 13 e 19", excerpt: "ART. 13) Non sono previste penali ... fatte salve le penalità previste al precedente art. 13", issue: "Il rinvio crea un’incoerenza oggettiva: l’art. 19 tutela penali che l’art. 13 dichiara inesistenti.", suggestion: "Eliminare il richiamo alle penali oppure disciplinarle nell’art. 13 con importi, presupposti, limiti e procedura di contestazione.", source: "Codice civile · interpretazione del contratto", sourceUrl: "https://www.normattiva.it/eli/id/1942/04/04/042U0262/CONSOLIDATED/20260614", confidence: 99 },
  { id: 7, severity: "medium", area: "PAGAMENTI", title: "Termini di pagamento e documenti da chiarire", page: "Pagine 2-3", article: "Art. 4", excerpt: "B.B. anticipato per il noleggio e B.B. a gg. 30 + 10 fine mese ... per operatori e trasporti", issue: "La ripartizione tra importi anticipati e differiti può generare contestazioni. DURC e liberatorie sono collegati alla sospensione dei pagamenti senza una procedura completa.", suggestion: "Separare le voci economiche, indicare decorrenza e scadenza, documenti necessari, termine per sanare irregolarità e importi eventualmente sospendibili.", source: "Codice civile · adempimento e buona fede", sourceUrl: "https://www.normattiva.it/eli/id/1942/04/04/042U0262/CONSOLIDATED/20260614", confidence: 92 },
  { id: 8, severity: "medium", area: "PRIVACY", title: "Clausola privacy troppo generica", page: "Pagina 7", article: "Art. 23", excerpt: "il trattamento dei dati ... avverrà esclusivamente per lo svolgimento delle attività", issue: "La clausola non identifica in modo completo titolare, finalità, base giuridica, conservazione, destinatari e diritti se intesa anche come informativa agli interessati.", suggestion: "Richiamare un’informativa privacy aggiornata e allegata, distinguendo i ruoli delle parti e disciplinando eventuali trattamenti per conto dell’altra parte.", source: "Regolamento UE 2016/679 · artt. 13-14", sourceUrl: "https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=it", confidence: 91 },
  { id: 9, severity: "ok", area: "SICUREZZA", title: "Obblighi operativi ampiamente descritti", page: "Pagine 3-5", article: "Artt. 7, 9 e 10", excerpt: "POS, PSC, DUVRI, formazione, DPI, idoneità e coordinamento", issue: "Il documento tratta in modo esteso sicurezza, personale, documentazione e coordinamento. Rimane necessaria la verifica concreta degli allegati e delle responsabilità di cantiere.", suggestion: "Mantenere la struttura e aggiungere una checklist degli allegati effettivamente consegnati con data, versione e responsabile della verifica.", source: "D.Lgs. 81/2008 · artt. 26 e 97", sourceUrl: "https://www.normattiva.it/uri-res/N2Ls?urn%3Anir%3Astato%3Adecreto.legislativo%3A2008%3B81~art26-com3=", confidence: 95 },
];

const labels: Record<Severity, string> = { critical: "Critico", high: "Alto", medium: "Medio", ok: "Coerente" };

export default function LegalPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("260701_Contratto_S26_0281_Dalecom.pdf");
  const [state, setState] = useState<"ready" | "analyzing" | "results">("results");
  const [selected, setSelected] = useState(1);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [reportOpen, setReportOpen] = useState(false);
  const current = findings.find((finding) => finding.id === selected) || findings[0];
  const accepted = Object.values(decisions).filter((decision) => decision === "accepted").length;
  const rejected = Object.values(decisions).filter((decision) => decision === "rejected").length;
  const pending = findings.length - accepted - rejected;
  const score = useMemo(() => Math.min(82, 58 + accepted * 3), [accepted]);

  const chooseFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name); setState("ready"); setDecisions({}); setEdits({}); setSelected(1); setReportOpen(false);
  };
  const drop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); chooseFile(event.dataTransfer.files?.[0]); };
  const analyze = () => { setState("analyzing"); window.setTimeout(() => setState("results"), 1700); };
  const decide = (decision: Decision) => setDecisions((value) => ({ ...value, [current.id]: decision }));
  const downloadReport = () => {
    const lines = findings.map((finding) => `${finding.id}. [${labels[finding.severity]}] ${finding.title}\nDecisione: ${decisions[finding.id] || "pending"}\nTesto proposto: ${edits[finding.id] ?? finding.suggestion}\nFonte: ${finding.source}`).join("\n\n");
    const blob = new Blob([`DALECOM - REPORT DI RISCHIO CONTRATTUALE\nDocumento: ${fileName}\nPunteggio demo: ${score}/100\n\n${lines}\n\nValutazione assistita: richiede validazione professionale.`], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "Dalecom_report_rischio_contrattuale.txt"; link.click(); URL.revokeObjectURL(link.href);
  };

  return <main className={styles.page}>
    <header className={styles.topbar}><div className={styles.brand}><i /><b>DALECOM</b><span>Legal · Contract intelligence</span></div><a href="/demo">← Regia principale</a></header>

    <section className={styles.hero}>
      <div><small>11 · LEGAL & COMPLIANCE</small><h1>Dal contratto al rischio.<br /><em>Prima della firma.</em></h1><p>Carica un contratto o un’offerta. Il sistema individua incoerenze, clausole sbilanciate e verifiche normative, lasciando ogni decisione all’operatore.</p></div>
      <aside><span>VALUTAZIONE ASSISTITA</span><b>Fonti tracciate</b><small>Normativa vigente · giurisprudenza da validare · controllo umano finale</small></aside>
    </section>

    <section className={styles.uploadRow}>
      <div className={styles.dropzone} onDragOver={(event) => event.preventDefault()} onDrop={drop} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") inputRef.current?.click(); }}>
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={(event) => chooseFile(event.target.files?.[0])} />
        <span>⇧</span><div><small>TRASCINA QUI PDF O WORD</small><b>{fileName}</b><p>{state === "results" ? "7 pagine · testo acquisito · analisi disponibile" : "Documento pronto per la verifica"}</p></div>
      </div>
      <button className={styles.analyzeButton} onClick={analyze} disabled={state === "analyzing"}>{state === "analyzing" ? "Analisi in corso…" : state === "ready" ? "Avvia verifica" : "Ripeti analisi"}</button>
    </section>

    {state === "analyzing" && <section className={styles.scanning}><div><i /><i /><i /><i /></div><b>Sto leggendo clausole, rinvii e fonti applicabili</b><span>Struttura documento → obblighi → rischi → coerenza → fonti</span></section>}

    {state === "results" && <>
      <section className={styles.summary}>
        <article className={styles.score}><div><small>INDICE DI RISCHIO CONTRATTUALE</small><strong>{score}<em>/100</em></strong><span>Da rivedere prima della firma</span></div><i style={{ "--score": `${score}%` } as React.CSSProperties}><b>{score}</b></i></article>
        <article><small>RILIEVI</small><b>{findings.length}</b><span>2 critici · 3 alti · 3 medi · 1 coerente</span></article>
        <article><small>DECISIONI</small><b>{accepted + rejected}/{findings.length}</b><span>{accepted} accettate · {rejected} respinte</span></article>
        <article><small>DA VALUTARE</small><b>{pending}</b><span>La decisione resta all’operatore</span></article>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.findings}><header><small>ANALISI DEL DOCUMENTO</small><b>Rilievi ordinati per priorità</b></header>{findings.map((finding) => <button key={finding.id} className={`${styles.finding} ${styles[finding.severity]} ${selected === finding.id ? styles.selected : ""}`} onClick={() => setSelected(finding.id)}><span>{String(finding.id).padStart(2, "0")}</span><div><small>{finding.area} · {finding.page}</small><b>{finding.title}</b></div><i>{decisions[finding.id] === "accepted" ? "✓" : decisions[finding.id] === "rejected" ? "×" : labels[finding.severity]}</i></button>)}</aside>

        <article className={styles.detail}>
          <header><div><span className={`${styles.badge} ${styles[current.severity]}`}>{labels[current.severity]}</span><small>{current.page} · {current.article} · confidenza {current.confidence}%</small><h2>{current.title}</h2></div><b>#{String(current.id).padStart(2, "0")}</b></header>
          <section className={styles.original}><small>TESTO INDIVIDUATO NEL DOCUMENTO</small><p>“{current.excerpt}”</p></section>
          <div className={styles.analysisGrid}><section><small>PERCHÉ È SEGNALATO</small><p>{current.issue}</p></section><section><small>FONTE DI VERIFICA</small><a href={current.sourceUrl} target="_blank" rel="noreferrer">{current.source} ↗</a><p>Fonte ufficiale. Applicabilità e versione temporale da confermare sul caso concreto.</p></section></div>
          <section className={styles.suggestion}><small>MODIFICA SUGGERITA · TESTO MODIFICABILE</small><p>Correggi liberamente il testo prima di accettarlo.</p><textarea aria-label="Testo modifica suggerita" value={edits[current.id] ?? current.suggestion} onChange={(event) => setEdits((value) => ({ ...value, [current.id]: event.target.value }))} /></section>
          <footer><div><button className={styles.reject} onClick={() => decide("rejected")}>Rifiuta modifica</button><button className={styles.accept} onClick={() => decide("accepted")}>Accetta modifica</button></div><span>{decisions[current.id] === "accepted" ? "Modifica accettata dall’operatore" : decisions[current.id] === "rejected" ? "Modifica rifiutata dall’operatore" : "In attesa di decisione"}</span></footer>
        </article>
      </section>

      <section className={styles.output}><div><small>OUTPUT DELLA VERIFICA</small><b>{accepted ? `${accepted} modifica${accepted > 1 ? "he" : ""} pronta per la controproposta` : "Apri il report e modifica le proposte"}</b><span>Il documento originale rimane invariato. Ogni scelta viene registrata.</span></div><div className={reportStyles.outputActions}><button className={reportStyles.openReport} onClick={() => setReportOpen(true)}>Apri report modificabile</button><button onClick={downloadReport}>Scarica report</button></div></section>

      {reportOpen && <div className={reportStyles.reportOverlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportOpen(false); }}>
        <section className={reportStyles.reportDialog} role="dialog" aria-modal="true" aria-label="Report modificabile">
          <header><div><small>REPORT DI RISCHIO CONTRATTUALE</small><h2>Revisione delle modifiche</h2><p>{fileName} · indice {score}/100</p></div><button onClick={() => setReportOpen(false)} aria-label="Chiudi report">×</button></header>
          <div className={reportStyles.reportBody}>{findings.map((finding) => <article key={finding.id} className={reportStyles.reportItem}>
            <div className={reportStyles.reportItemHead}><span className={`${styles.badge} ${styles[finding.severity]}`}>{labels[finding.severity]}</span><div><small>{finding.page} · {finding.article}</small><b>{finding.title}</b></div><select aria-label={`Decisione rilievo ${finding.id}`} value={decisions[finding.id] || "pending"} onChange={(event) => setDecisions((value) => ({ ...value, [finding.id]: event.target.value as Decision }))}><option value="pending">Da valutare</option><option value="accepted">Accetta</option><option value="rejected">Rifiuta</option></select></div>
            <textarea aria-label={`Modifica proposta ${finding.id}`} value={edits[finding.id] ?? finding.suggestion} onChange={(event) => setEdits((value) => ({ ...value, [finding.id]: event.target.value }))} />
          </article>)}</div>
          <footer><span>{accepted} accettate · {rejected} rifiutate · {pending} da valutare</span><div><button className={reportStyles.closeReport} onClick={() => setReportOpen(false)}>Salva e chiudi</button><button onClick={downloadReport}>Scarica report aggiornato</button></div></footer>
        </section>
      </div>}
    </>}

    <footer className={styles.footer}><span>DALECOM · Legal & Compliance</span><b>Prototipo dimostrativo · non sostituisce il parere di un professionista legale</b></footer>
  </main>;
}
