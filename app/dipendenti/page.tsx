"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type CheckState = "ok" | "warning" | "error";
type ReportField = { label: string; employee: string; thirdParty: string; state: CheckState; note: string };
type EmployeeReport = { id: string; name: string; role: string; area: string; date: string; job: string; customer: string; status: CheckState; statusLabel: string; sourceRef: string; thirdPartyRef: string; fields: ReportField[] };

const oneCUrl = "https://sharedhosting.cloud2.1c-erp.it/Dalecom/";

const reports: EmployeeReport[] = [
  { id: "33-01", name: "Toscano Enrico", role: "Autista betoniera", area: "Cantieri", date: "13 agosto 2026", job: "Costantino Misciagna · Chioggia", customer: "IN.TE.SE. Costruzioni d’Acciaio", status: "ok", statusLabel: "Rapportino congruo", sourceRef: "1C · RAPP-260813-108", thirdPartyRef: "SuperBeton · DDT 44/26 · 03542", fields: [
    { label: "Data", employee: "13/08/2026", thirdParty: "13/08/2026", state: "ok", note: "Coincide" },
    { label: "Cantiere", employee: "Chioggia · Costantino Misciagna", thirdParty: "Chioggia · Costantino Misciagna", state: "ok", note: "Coincide" },
    { label: "Mezzo", employee: "Autobetoniera GY960NP · cod. 10145", thirdParty: "GY960NP · cod. 10145", state: "ok", note: "Coincide" },
    { label: "Inizio attività", employee: "08:37", thirdParty: "08:39", state: "ok", note: "Scarto 2 min · entro tolleranza" },
    { label: "Quantità CLS", employee: "10,00 m³", thirdParty: "10,00 m³", state: "ok", note: "Coincide" },
    { label: "Destinazione d’uso", employee: "Fondazione", thirdParty: "Fondazione", state: "ok", note: "Coincide" },
  ]},
  { id: "34-08", name: "Topala Mihai", role: "Pompista", area: "MI Nord Ovest", date: "13 agosto 2026", job: "Costantino Misciagna · Chioggia", customer: "IN.TE.SE. Costruzioni d’Acciaio", status: "warning", statusLabel: "Documento da completare", sourceRef: "1C · RAPP-260813-109", thirdPartyRef: "SuperBeton · DDT 44/26 · 03542", fields: [
    { label: "Data", employee: "13/08/2026", thirdParty: "13/08/2026", state: "ok", note: "Coincide" },
    { label: "Cantiere", employee: "Chioggia · Costantino Misciagna", thirdParty: "Chioggia · Costantino Misciagna", state: "ok", note: "Coincide" },
    { label: "Pompa", employee: "HA962DT · cod. 802", thirdParty: "HA962DT · cod. 802", state: "ok", note: "Coincide" },
    { label: "Inizio attività", employee: "08:41", thirdParty: "08:39", state: "ok", note: "Scarto 2 min · entro tolleranza" },
    { label: "Quantità pompata", employee: "10,00 m³", thirdParty: "10,00 m³", state: "ok", note: "Coincide" },
    { label: "Fine attività", employee: "10:18", thirdParty: "Non compilata", state: "warning", note: "Manca sul rapporto della ditta terza" },
  ]},
  { id: "35-01", name: "Berdaga Mihail", role: "Preposto", area: "Nord Est", date: "12 agosto 2026", job: "Cantiere Mestre · Lotto B", customer: "Impresa terza · caso demo", status: "error", statusLabel: "Incongruenza da verificare", sourceRef: "1C · RAPP-260812-094", thirdPartyRef: "Rapporto terzi · RT-1248", fields: [
    { label: "Data", employee: "12/08/2026", thirdParty: "12/08/2026", state: "ok", note: "Coincide" },
    { label: "Cantiere", employee: "Mestre · Lotto B", thirdParty: "Mestre · Lotto B", state: "ok", note: "Coincide" },
    { label: "Ingresso", employee: "07:05", thirdParty: "07:10", state: "ok", note: "Scarto 5 min · entro tolleranza" },
    { label: "Uscita", employee: "17:30", thirdParty: "16:00", state: "error", note: "Differenza 1 h 30 min" },
    { label: "Ore dichiarate", employee: "10 h 25 min", thirdParty: "8 h 50 min", state: "error", note: "Supera la tolleranza configurata" },
    { label: "Firma referente", employee: "Presente", thirdParty: "Assente", state: "warning", note: "Richiedere conferma al committente" },
  ]},
];

const stateIcon = { ok: "✓", warning: "!", error: "×" } as const;

export default function EmployeesArea() {
  const [selectedId, setSelectedId] = useState(reports[0].id);
  const selected = reports.find((report) => report.id === selectedId) || reports[0];
  const counters = useMemo(() => ({ ok: reports.filter((report) => report.status === "ok").length, warning: reports.filter((report) => report.status === "warning").length, error: reports.filter((report) => report.status === "error").length }), []);

  return <main className={styles.page}>
    <header className={styles.top}>
      <div className={styles.wordmark} aria-label="Dalecom"><i /><b>DALECOM</b><span>Rapportini</span></div>
      <div className={styles.topActions}><a href="/demo">← Regia principale</a><a href={oneCUrl} target="_blank" rel="noreferrer">Apri 1C ↗</a></div>
    </header>
    <section className={styles.hero}>
      <div><small>PERSONE · CANTIERI · CONTROLLO INCROCIATO</small><h1>Due dichiarazioni.<br /><em>Una sola verità operativa.</em></h1><p>Il rapportino del dipendente viene confrontato con il documento della ditta terza. Le differenze diventano subito controlli da risolvere.</p></div>
      <aside><span>ULTIMO AGGIORNAMENTO</span><b>Ora · dati demo coerenti</b><i>Ingresso API 1C predisposto</i></aside>
    </section>
    <section className={styles.metrics} aria-label="Stato rapportini">
      <article><small>RAPPORTINI RICEVUTI</small><b>{reports.length}</b><span>Ultimi casi demo</span></article>
      <article className={styles.metricOk}><small>CONGRUI</small><b>{counters.ok}</b><span>Nessuna azione</span></article>
      <article className={styles.metricWarning}><small>DA COMPLETARE</small><b>{counters.warning}</b><span>Dato mancante</span></article>
      <article className={styles.metricError}><small>INCONGRUENZE</small><b>{counters.error}</b><span>Verifica necessaria</span></article>
    </section>
    <section className={styles.workspace}>
      <aside className={styles.people}>
        <header><small>DIPENDENTI</small><b>Clicca per l’ultimo rapportino</b></header>
        {reports.map((report) => <button key={report.id} className={selected.id === report.id ? styles.selected : ""} onClick={() => setSelectedId(report.id)}>
          <span className={`${styles.stateDot} ${styles[report.status]}`}>{stateIcon[report.status]}</span><div><b>{report.name}</b><small>{report.role} · {report.date}</small></div><i>→</i>
        </button>)}
        <div className={styles.liveNote}><i /> Quando Michele attiva il flusso, questa lista leggerà gli ultimi rapportini direttamente da 1C.</div>
      </aside>
      <article className={styles.report}>
        <header className={styles.reportHeader}><div><small>CONTROLLO RAPPORTINO · {selected.id}</small><h2>{selected.name}</h2><p>{selected.customer}<br />{selected.job}</p></div><span className={`${styles.resultBadge} ${styles[selected.status]}`}>{stateIcon[selected.status]} {selected.statusLabel}</span></header>
        <div className={styles.sources}>
          <section><span>01 · DIPENDENTE</span><b>Rapportino dall’app 1C</b><small>{selected.sourceRef}</small></section><div>⇄</div><section><span>02 · DITTA TERZA</span><b>Rapporto di lavoro acquisito</b><small>{selected.thirdPartyRef}</small></section>
        </div>
        <div className={styles.comparison}>
          <div className={styles.comparisonHead}><span>Campo verificato</span><span>Dichiarato dal dipendente</span><span>Documento ditta terza</span><span>Esito</span></div>
          {selected.fields.map((field) => <div className={styles.comparisonRow} key={field.label}><b>{field.label}</b><span>{field.employee}</span><span>{field.thirdParty}</span><span className={`${styles.fieldState} ${styles[field.state]}`}><i>{stateIcon[field.state]}</i>{field.note}</span></div>)}
        </div>
        <footer className={styles.reportFooter}><div><small>REGOLA DEMO</small><b>Orari entro 5 minuti: congrui · oltre 15 minuti: verifica</b></div><button onClick={() => window.print()}>Esporta scheda di controllo</button></footer>
      </article>
    </section>
    <footer className={styles.footer}><span>Demo Dalecom · dati simulati ove indicato</span><b>Pronto per ricevere rapportini e allegati dal gestionale 1C</b></footer>
  </main>;
}
