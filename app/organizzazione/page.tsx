"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type View = "organigramma" | "mansionari" | "procedure";
type Role = { id: string; title: string; person: string; area: string; color: "orange" | "cyan" | "green"; duties: string[]; members?: string[] };

const leadership: Role[] = [
  { id: "01", title: "Socio", person: "Comiotto Walter", area: "Governance", color: "orange", duties: ["Indirizzo societario", "Coordinamento con direzione e vendite"] },
  { id: "02", title: "CEO / Vendite", person: "Comiotto Walter", area: "Direzione", color: "orange", duties: ["Sviluppo commerciale", "Chiusura contratti", "Supervisione preventivi"] },
  { id: "03", title: "Socio", person: "Dal Zilio Alessandro", area: "Governance", color: "orange", duties: ["Indirizzo societario", "Cantieri direzionali e logistica esterna"] },
];

const management: Role[] = [
  { id: "04", title: "CCO", person: "Dal Zilio Alessandro", area: "Commerciale", color: "green", duties: ["Coordinamento commerciale", "Logistica esterna Padernello", "Cantieri direzionali"] },
  { id: "05", title: "CFO / COO", person: "Bertoia Laura", area: "Amministrazione", color: "green", duties: ["Coordinamento uffici", "Controllo di gestione", "Contabilità generale", "Supervisione personale d’ufficio"] },
  { id: "06", title: "CTO / R&D", person: "Favaro Giovanni", area: "Tecnologia", color: "green", duties: ["Integrazione AI e gestionale", "Sviluppo software", "Controllo report ACCISE e rifiuti", "Ricerca nuove tecnologie"] },
  { id: "07", title: "Responsabile unità Paese", person: "Bertoia Laura", area: "Paese", color: "cyan", duties: ["Coordinamento della sede", "Supervisione attività amministrative"] },
  { id: "08", title: "Ufficio acquisti", person: "Bertoia Laura + supporto", area: "Acquisti", color: "cyan", duties: ["Flussi di acquisto", "Supporto a logistica e amministrazione"] },
  { id: "09", title: "Direttore tecnico Bareggio", person: "Radice Carlo", area: "Bareggio", color: "cyan", duties: ["Direzione tecnica", "Logistica interna ed esterna", "Cantieri Milano Nord Ovest"] },
  { id: "10", title: "Ufficio commerciale", person: "Stefanato Veronica", area: "Commerciale", color: "cyan", duties: ["Sviluppo preventivi", "Completamento documentale ordini", "Supporto contratti aperti"] },
  { id: "11", title: "HR", person: "Varo Gianmarco", area: "Persone", color: "green", duties: ["Organizzazione del personale", "Supporto ai responsabili di reparto"] },
  { id: "12", title: "Ufficio commerciale", person: "Garavaglia Ilaria", area: "Milano", color: "cyan", duties: ["Pratiche di ufficio e officina", "Report lavorazioni Milano"] },
  { id: "13", title: "Report lavorazioni Paese", person: "Samia Gabriela", area: "Paese", color: "cyan", duties: ["Raccolta e controllo report", "Aggiornamento avanzamento lavorazioni"] },
  { id: "14", title: "Contabilità interna generale", person: "Fighera Silvia", area: "Amministrazione", color: "green", duties: ["Contabilità interna", "Supporto al controllo di gestione"] },
  { id: "15", title: "Report lavorazioni Milano", person: "Garavaglia Ilaria", area: "Milano", color: "cyan", duties: ["Report operativi", "Aggiornamento attività della sede"] },
  { id: "16", title: "Report e comunicazioni ADG/ADE", person: "Favaro Giovanni", area: "Compliance", color: "green", duties: ["Invio dati", "Aggiornamento dispositivi", "Controllo comunicazioni regolatorie"] },
  { id: "17", title: "Sicurezza e formazione", person: "Calio’ Salvatore", area: "HSE", color: "green", duties: ["Sicurezza", "Formazione", "Supervisione adempimenti"] },
];

const operations: Role[] = [
  { id: "18", title: "Logistica", person: "Filippetto Ivan", area: "Generale", color: "orange", duties: ["Coordinamento della logistica generale", "Programmazione materiali e trasferimenti tra sedi"] },
  { id: "19", title: "Logistica esterna Padernello", person: "Dal Zilio Alessandro", area: "Padernello", color: "orange", duties: ["Logistica esterna della sede", "Coordinamento consegne, ritiri e cantieri"] },
  { id: "20", title: "Logistica interna Padernello", person: "Filippetto Ivan", area: "Padernello", color: "orange", duties: ["Logistica interna della sede", "Flussi di magazzino e preparazione materiali"] },
  { id: "21", title: "Officina Padernello", person: "Zangirolami Alex", area: "Padernello", color: "orange", duties: ["Lavorazioni e riparazioni di officina", "Aggiornamento stato delle lavorazioni"] },
  { id: "22", title: "Officina Bareggio", person: "Bratulescu Ionuț", area: "Bareggio", color: "cyan", duties: ["Lavorazioni e riparazioni di officina", "Aggiornamento stato delle lavorazioni"] },
  { id: "23", title: "Logistica interna Bareggio", person: "Radice Carlo", area: "Bareggio", color: "cyan", duties: ["Logistica interna della sede", "Flussi di magazzino e preparazione materiali"] },
  { id: "24", title: "Logistica esterna Bareggio", person: "Radice Carlo", area: "Bareggio", color: "cyan", duties: ["Logistica esterna della sede", "Coordinamento consegne, ritiri e cantieri"] },
  { id: "25", title: "Verniciatura / Officina", person: "Cani Tonin", area: "Padernello", color: "orange", duties: ["Verniciatura e finitura materiali", "Supporto alle lavorazioni di officina"] },
  { id: "26", title: "Area cantieri Nord Est", person: "Filippetto Ivan", area: "Cantieri", color: "green", duties: ["Responsabilità operativa cantieri Nord Est", "Coordinamento addetti e mezzi"] },
  { id: "27", title: "Area cantieri MI Nord Ovest", person: "Radice Carlo", area: "Cantieri", color: "green", duties: ["Responsabilità operativa cantieri Milano Nord Ovest", "Coordinamento addetti e mezzi"] },
  { id: "28", title: "Lavaggio sedi", person: "Naoussi Carlo · Bratulescu Ionuț", area: "Padernello / Bareggio", color: "cyan", duties: ["Lavaggio Padernello · Naoussi Carlo", "Lavaggio Bareggio · Bratulescu Ionuț", "Controllo visivo e segnalazione anomalie"] },
  { id: "29", title: "Autisti muletti", person: "Cani Tonin · Naoussi Carlo", area: "Padernello", color: "orange", duties: ["Movimentazione interna con muletto", "Cani Tonin", "Naoussi Carlo"] },
  { id: "30", title: "Autisti muletti", person: "Bratulescu Ionuț", area: "Bareggio", color: "cyan", duties: ["Movimentazione interna con muletto", "Bratulescu Ionuț"] },
  { id: "31", title: "Consegne, ritiri e transfert", person: "Miglioranza Cristiano · Montano Stefano", area: "Logistica", color: "orange", duties: ["Consegne e ritiri", "Trasferimenti tra sedi", "Miglioranza Cristiano", "Montano Stefano"] },
  { id: "32", title: "Area cantieri Centro Italia", person: "Turco Lorenzo", area: "Cantieri", color: "green", duties: ["Responsabilità operativa cantieri Centro Italia", "Coordinamento addetti e mezzi"] },
  { id: "33", title: "Autisti betoniere", person: "Squadra operativa", area: "Cantieri", color: "green", duties: ["Conduzione autobetoniere", "Operatività e sicurezza del mezzo assegnato"], members: ["Stecho Dorel", "Stetco Toader", "Toscano Enrico", "Mihali Daniel", "Zaramella Nicola", "Mechhouri Bouabid", "Pralea Vasile"] },
  { id: "34", title: "Addetti preposti", person: "Squadra MI Nord Ovest", area: "Cantieri", color: "green", duties: ["Attività di cantiere nell’area MI Nord Ovest", "Funzione di preposto secondo l’assegnazione operativa"], members: ["Bogdan Emi Lucian", "Cimino Lucio", "Ismail Tarek", "Colan Ciprian", "Dan Bogdan", "Elaraby Abdelrahman", "Elshalaby Mohamed Ibrahim", "Gueye Khadime", "Mircos Grigore"] },
  { id: "35", title: "Addetti preposti", person: "Squadra Nord Est", area: "Cantieri", color: "green", duties: ["Attività di cantiere nell’area Nord Est", "Funzione di preposto secondo l’assegnazione operativa"], members: ["Berdaga Mihail", "Berdaga Tudor", "Kaci Ilirjan", "Loriato Flavio", "Pace Vincenzo", "Talmaci Andrei", "Berdaga Dionisie", "Berdaga Maxim"] },
  { id: "36", title: "Cantiere Varna", person: "Squadra dedicata", area: "Cantieri direzionali", color: "green", duties: ["Attività operative assegnate al cantiere Varna", "Coordinamento con la direzione del cantiere"], members: ["Dal Zilio Alessandro", "Marconato Ermens", "Buonaiuto Paco", "Sow Moustapha", "Verejan Radu", "Bilibio Enrico"] },
  { id: "37", title: "Addetti qualificati e comuni", person: "Squadre di cantiere", area: "Cantieri", color: "green", duties: ["Attività qualificate o comuni secondo assegnazione di cantiere", "Operatività nel rispetto delle procedure e del preposto"], members: ["Aouf Mahmoud Hussein", "Ismailaj Romario", "Karoma Alhaji", "Munteanu Mario Gabriel", "Ndiaye Ibrahima", "Rivero Estrada Liudbel", "Zamà Serghei", "Elshalaby Youssef", "Ntim Samuel", "Berdaga Iacob", "Garbin Thomas", "Lamanna Giuseppe", "Rapallini Stefano", "Kwame Fosu Ebenezer", "Munteanu Nicolae", "Mihuta Flavius", "Lamanna Anthony", "Mesfef Mohammed"] },
];

function membersFor(role: Role) {
  if (role.members) return role.members;
  if (/^(Squadra|Squadre|Responsabili)/.test(role.person)) return [];
  return role.person
    .replace(/\s*\+\s*(supporto|altro)$/i, "")
    .split(" · ")
    .map((name) => name.trim())
    .filter(Boolean);
}

const procedures = [
  { code: "PR-01", title: "Programmazione materiali da trattare", cadence: "Settimanale", owner: "Logistica generale", flow: "Priorità → destinazione → data di utilizzo", status: "Pronta per 1C" },
  { code: "PR-02", title: "Presa in carico dei materiali", cadence: "Giornaliera", owner: "Ogni reparto", flow: "Da lavorare → in lavorazione → completato", status: "Pronta per 1C" },
  { code: "PR-03", title: "Checklist reparto lavaggio", cadence: "Ogni lavorazione", owner: "Lavaggio", flow: "Pulizia → controllo → anomalie → riparazione", status: "Checklist" },
  { code: "PR-04", title: "Riparazione e verniciatura", cadence: "Programmata", owner: "Officina Treviso", flow: "Intervento → priorità → scadenza → standard Milano", status: "Checklist" },
  { code: "PR-05", title: "Controllo standard di resa", cadence: "Prima del magazzino", owner: "Reparto + logistica", flow: "Misure → finitura → accessori → funzionalità", status: "Controllo qualità" },
  { code: "PR-06", title: "Identificazione RFID", cadence: "Chiusura lavorazione", owner: "Logistica", flow: "Codice → tipologia → stato → sede → destinazione", status: "Blocco obbligatorio" },
  { code: "PR-07", title: "Trasferimenti tra sedi", cadence: "48/72 ore prima", owner: "Logistica generale", flow: "Verifica → RFID → lista consegna → trasferimento", status: "Pianificazione" },
  { code: "PR-08", title: "Gestione materiale non conforme", cadence: "Su anomalia", owner: "Responsabile reparto", flow: "Alert → blocco → intervento → chiusura", status: "Alert automatico" },
  { code: "PR-09", title: "Verifica fabbisogni futuri", cadence: "15/30 giorni", owner: "Logistica + sedi", flow: "Cantieri → richieste → disponibilità → programma", status: "Previsione" },
  { code: "PR-10", title: "Punto logistica–reparti", cadence: "Settimanale · 15/20 min", owner: "Logistica e responsabili", flow: "Urgenze → ritardi → carichi → trasferimenti", status: "Riunione eccezioni" },
];

const roleDuties = [
  { title: "Commerciale e ordini", owner: "Uffici commerciali", items: ["Sviluppo preventivi e idee di costo", "Completamento documentale degli ordini", "Associazione di macchine e operatori", "Supporto alla chiusura dei contratti"] },
  { title: "Direzione operativa e amministrazione", owner: "CFO / COO", items: ["Coordinamento delle attività d’ufficio", "Supervisione responsabilità, tempi e priorità", "Controllo di gestione e bilancio", "Contabilità aziendale generale"] },
  { title: "Tecnologia e compliance", owner: "CTO / R&D", items: ["Integrazione AI verso il gestionale", "Sviluppo software di terze parti", "Report ACCISE, rifiuti, carburanti e oli", "Programmazione task del team IT"] },
  { title: "Tecnica e cantieri", owner: "Direzione tecnica", items: ["Gestione cantieri Triveneto e direzionali", "Ricerca tecnologie e attrezzature", "Formazione del reparto tecnico", "Affiancamento logistica e personale di cantiere"] },
];

export default function OrganizationPage() {
  const [view, setView] = useState<View>("organigramma");
  const [selectedId, setSelectedId] = useState("02");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const allRoles = useMemo(() => [...leadership, ...management, ...operations], []);
  const selected = allRoles.find((role) => role.id === selectedId) || allRoles[0];
  const selectedMembers = membersFor(selected);
  const employeeRoles = selectedEmployee ? allRoles.filter((role) => membersFor(role).includes(selectedEmployee)) : [];
  const selectRole = (id: string) => { setSelectedId(id); setSelectedEmployee(null); };

  return <main className={styles.page}>
    <header className={styles.top}>
      <div className={styles.wordmark} aria-label="Dalecom"><i /><b>DALECOM</b><span>Organizzazione</span></div>
      <a href="/demo">← Regia principale</a>
    </header>
    <section className={styles.hero}>
      <div><small>PERSONE · RESPONSABILITÀ · PROCESSI</small><h1>L’azienda sa<br /><em>chi fa cosa.</em></h1></div>
      <aside><b>REV. 25 AGOSTO 2026</b><span>37 codici organizzativi mappati</span><i>Connessione 1C predisposta</i></aside>
    </section>
    <nav className={styles.tabs} aria-label="Viste organizzative">
      {(["organigramma", "mansionari", "procedure"] as View[]).map((item) => <button key={item} className={view === item ? styles.active : ""} onClick={() => setView(item)}>{item === "organigramma" ? "Organigramma" : item === "mansionari" ? "Mansionari" : "Procedure operative"}</button>)}
    </nav>
    {view === "organigramma" && <>
      <section className={styles.orgShell}>
        <div className={styles.orgMap}>
          <div className={styles.levelLabel}>GOVERNANCE</div>
          <div className={styles.leadership}>{leadership.map((role) => <RoleButton role={role} selected={selectedId === role.id && !selectedEmployee} onSelect={selectRole} key={role.id} />)}</div>
          <div className={styles.connector}><i /></div>
          <div className={styles.levelLabel}>DIREZIONE E FUNZIONI</div>
          <div className={styles.management}>{management.map((role) => <RoleButton role={role} selected={selectedId === role.id && !selectedEmployee} onSelect={selectRole} key={role.id} />)}</div>
          <div className={styles.operatingConnector}><i /></div>
          <div className={styles.levelLabel}>AREE, REPARTI E SQUADRE OPERATIVE · CODICI 18–37</div>
          <div className={styles.operations}>{operations.map((role) => <RoleButton role={role} selected={selectedId === role.id && !selectedEmployee} onSelect={selectRole} key={role.id} />)}</div>
        </div>
        <aside className={styles.roleDetail}>
          {selectedEmployee ? <>
            <small>MANSIONARIO DIPENDENTE</small><h2>{selectedEmployee}</h2><b>{employeeRoles.length} {employeeRoles.length === 1 ? "ruolo associato" : "ruoli associati"}</b>
            <div className={styles.employeeRoles}>{employeeRoles.map((role) => <section key={role.id}><span>CODICE {role.id} · {role.area}</span><h3>{role.title}</h3><ul>{role.duties.map((duty) => <li key={duty}>{duty}</li>)}</ul></section>)}</div>
            <button className={styles.backToRole} onClick={() => setSelectedEmployee(null)}>← Torna al ruolo {selected.id}</button>
          </> : <>
            <small>RUOLO {selected.id}</small><h2>{selected.title}</h2><b>{selected.person}</b><span>{selected.area}</span>
            <ul>{selected.duties.map((duty) => <li key={duty}>{duty}</li>)}</ul>
            {selectedMembers.length > 0 && <div className={styles.people}><small>DIPENDENTI COLLEGATI · CLICCA PER IL MANSIONARIO</small>{selectedMembers.map((name) => <button key={name} onClick={() => setSelectedEmployee(name)}>{name}<i>→</i></button>)}</div>}
            <div className={styles.sync}><i /> Scheda pronta per sincronizzazione 1C</div>
          </>}
        </aside>
      </section>
    </>}
    {view === "mansionari" && <section className={styles.dutyGrid}>{roleDuties.map((group, index) => <article key={group.title}><div><span>{String(index + 1).padStart(2, "0")}</span><small>{group.owner}</small></div><h2>{group.title}</h2><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul><footer>Responsabilità e attività · fonte documentale</footer></article>)}</section>}
    {view === "procedure" && <section className={styles.procedureList}>
      <header><div><small>10 PROCEDURE MAPPATE</small><h2>Dalla regola all’esecuzione</h2></div><span>Il prossimo passo è trasformarle in checklist e task 1C.</span></header>
      {procedures.map((procedure) => <article key={procedure.code}><b>{procedure.code}</b><div><h3>{procedure.title}</h3><p>{procedure.flow}</p></div><dl><div><dt>Frequenza</dt><dd>{procedure.cadence}</dd></div><div><dt>Responsabile</dt><dd>{procedure.owner}</dd></div></dl><span>{procedure.status}</span></article>)}
    </section>}
    <footer className={styles.footer}><span>Fonte: organigramma, mansionario e procedure soft · revisione 25 agosto 2026</span><b>Fase demo · dati strutturati per futura API 1C</b></footer>
  </main>;
}

function RoleButton({ role, selected, onSelect }: { role: Role; selected: boolean; onSelect: (id: string) => void }) {
  return <button className={`${styles.role} ${styles[role.color]} ${selected ? styles.selected : ""}`} onClick={() => onSelect(role.id)}><span>{role.id}</span><div><small>{role.title}</small><b>{role.person}</b></div></button>;
}
