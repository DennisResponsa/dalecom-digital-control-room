"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type Area = "control" | "builder" | "travel" | "mail" | "events" | "log";
type Automation = {
  id: string;
  name: string;
  area: string;
  summary: string;
  status: "Attiva" | "In prova" | "Pausa";
  runs: number;
  next: string;
};

const nav: { id: Area; label: string; icon: string; badge?: number }[] = [
  { id: "control", label: "Control center", icon: "◎" },
  { id: "builder", label: "Crea automazione", icon: "✦" },
  { id: "travel", label: "Trasferte e viaggi", icon: "↗", badge: 3 },
  { id: "mail", label: "Posta e reminder", icon: "✉", badge: 5 },
  { id: "events", label: "Ricorrenze ed eventi", icon: "◇", badge: 7 },
  { id: "log", label: "Registro esecuzioni", icon: "≡" },
];

const seedAutomations: Automation[] = [
  { id: "AU-014", name: "Trasferta cantiere fuori regione", area: "TRASFERTE", summary: "Cerca hotel, ristorante e viaggio quando la squadra resta almeno 2 notti.", status: "Attiva", runs: 18, next: "Controllo alle 16:00" },
  { id: "AU-011", name: "Compleanni dipendenti", area: "HR", summary: "Avvisa HR 7 giorni prima e prepara un messaggio per il dipendente.", status: "Attiva", runs: 9, next: "12 settembre" },
  { id: "AU-009", name: "Scadenze clienti e fornitori", area: "CRM", summary: "Crea promemoria al responsabile e una bozza e-mail 14 giorni prima.", status: "Attiva", runs: 31, next: "Domani · 08:00" },
  { id: "AU-006", name: "Fiera rilevante per Dalecom", area: "MARKETING", summary: "Riceve eventi dal modulo Bandi e li assegna a Marketing o Direzione.", status: "In prova", runs: 4, next: "Nuovo controllo venerdì" },
];

const travels = [
  { id: "TR-091", team: "Mario Rossi + squadra P2", site: "Cantiere CMB · Milano", dates: "14–17 settembre · 3 notti", distance: "281 km", status: "DA APPROVARE", total: "€ 1.146", options: ["Hotel 3★ · 4,1 km", "Treno A/R · flessibile", "Ristorante convenzionato"] },
  { id: "TR-088", team: "Squadra pompaggio Nord", site: "Galleria S26 · Trento", dates: "21–25 settembre · 4 notti", distance: "146 km", status: "RICERCA PRONTA", total: "€ 1.684", options: ["Hotel 4★ · 2,7 km", "Furgone Dalecom", "Cena inclusa"] },
  { id: "TR-084", team: "Tecnico assistenza", site: "Cliente · Valencia", dates: "5–7 ottobre · 2 notti", distance: "volo", status: "DATI MANCANTI", total: "—", options: ["Volo Venezia–Valencia", "Hotel vicino cliente", "Transfer aeroporto"] },
];

const reminders = [
  { when: "OGGI · 16:00", title: "Conferma camere squadra P2", owner: "Logistica", kind: "Trasferta", tone: "orange" },
  { when: "DOMANI · 08:00", title: "Sollecito certificati fornitore Beton Nord", owner: "Acquisti", kind: "Fornitore", tone: "red" },
  { when: "12 SETTEMBRE", title: "Compleanno Mario Rossi", owner: "HR", kind: "Dipendente", tone: "green" },
  { when: "18 SETTEMBRE", title: "Anniversario cliente Costruzioni Delta", owner: "Commerciale", kind: "Cliente", tone: "cyan" },
  { when: "30 SETTEMBRE", title: "Rinnovo convenzione Hotel Paese", owner: "Amministrazione", kind: "Contratto", tone: "violet" },
];

const fairs = [
  { date: "24–26 SET", title: "Concrete Europe 2026", place: "Verona", score: 94, action: "Stand e incontri clienti" },
  { date: "8–10 OTT", title: "SAIE · Costruzioni", place: "Bologna", score: 91, action: "Visita commerciale" },
  { date: "19 NOV", title: "Tecnologie per il sottosuolo", place: "Torino", score: 84, action: "Relatore tecnico" },
];

const logs = [
  ["15:42", "AU-014", "Trovate 3 opzioni per CMB Milano", "In attesa approvazione"],
  ["15:10", "AU-009", "Preparato sollecito fornitore Beton Nord", "Bozza pronta"],
  ["14:32", "AU-011", "Creato reminder compleanno Mario Rossi", "Completato"],
  ["12:05", "AU-006", "SAIE classificata rilevante · 91/100", "Assegnato Marketing"],
  ["09:00", "AU-014", "Nessuna trasferta senza copertura", "Controllo superato"],
];

function StatusPill({ status }: { status: Automation["status"] }) {
  return <span className={`${styles.status} ${styles[status.replace(" ", "").toLowerCase()]}`}>{status}</span>;
}

export default function ProcessOptimization() {
  const [area, setArea] = useState<Area>("control");
  const [prompt, setPrompt] = useState("Quando il logista assegna una squadra a un cantiere fuori regione per più di 2 giorni, trova tre hotel vicini, il viaggio più conveniente e un ristorante. Prepara il confronto e chiedi approvazione prima di prenotare.");
  const [planReady, setPlanReady] = useState(false);
  const [automations, setAutomations] = useState(seedAutomations);
  const [notice, setNotice] = useState("");

  const activeCount = useMemo(() => automations.filter((item) => item.status === "Attiva").length, [automations]);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function prepareFlow() {
    if (!prompt.trim()) return flash("Descrivi prima l’automazione da creare");
    setPlanReady(true);
    flash("Flusso preparato: controlla condizioni e autorizzazioni");
  }

  function activateFlow() {
    const exists = automations.some((item) => item.id === "AU-015");
    if (!exists) {
      setAutomations((items) => [{ id: "AU-015", name: "Nuova automazione trasferte", area: "TRASFERTE", summary: prompt, status: "In prova", runs: 0, next: "Verifica simulata tra 5 minuti" }, ...items]);
    }
    setPlanReady(false);
    setArea("control");
    flash("Automazione attivata in prova: nessuna spesa senza approvazione");
  }

  return <main className={styles.page}>
    {notice && <div className={styles.notice}>{notice}</div>}
    <aside className={styles.sidebar}>
      <div className={styles.logo}><img src="/dalecom-logo.png" alt="Dalecom" /><span>Process<br />automation</span></div>
      <a className={styles.back} href="/demo">← Regia principale</a>
      <nav aria-label="Sezioni automazioni">{nav.map((item) => <button key={item.id} className={area === item.id ? styles.active : ""} onClick={() => setArea(item.id)}><i>{item.icon}</i><span>{item.label}</span>{item.badge ? <b>{item.badge}</b> : null}</button>)}</nav>
      <div className={styles.sources}><small>SORGENTI COLLEGATE</small><span><i />1C · ordini e anagrafiche</span><span><i />Logista · squadre e cantieri</span><span><i />Calendari e posta</span><span><i />Modulo 15 · eventi</span><em>In questa demo le azioni esterne sono simulate e richiedono conferma.</em></div>
      <footer><b>DALECOM</b><span>Ottimizzazione processi</span></footer>
    </aside>

    <section className={styles.content}>
      <header className={styles.topbar}><div><small>MODULO 10 · AUTOMAZIONI</small><h1>{nav.find((item) => item.id === area)?.label}</h1></div><div><span className={styles.live}><i /> Motore attivo</span><button onClick={() => setArea("builder")}>＋ Nuova automazione</button></div></header>

      {area === "control" && <>
        <section className={styles.kpis}>
          <article><small>AUTOMAZIONI ATTIVE</small><b>{activeCount}</b><span>+ 1 in fase di prova</span><i /></article>
          <article><small>AZIONI OGGI</small><b>64</b><span>59 concluse automaticamente</span><i /></article>
          <article><small>TRASFERTE DA APPROVARE</small><b>3</b><span>€ 2.830 proposte</span><i /></article>
          <article><small>PROMEMORIA GESTITI</small><b>27</b><span>0 scadenze ignorate</span><i /></article>
          <article className={styles.saving}><small>RISPARMIO STIMATO</small><b>18,5 h</b><span>questa settimana · demo</span><i /></article>
        </section>
        <section className={styles.builderHero}>
          <div><small>COSTRUTTORE DA LINGUAGGIO NATURALE</small><h2>Descrivi cosa deve accadere.<br /><em>Il sistema prepara il processo.</em></h2><p>Scrivi regole, condizioni e destinatari come le spiegheresti a una persona.</p></div>
          <button onClick={() => setArea("builder")}><span>✦</span><b>Crea una nuova automazione</b><small>Nessun codice necessario →</small></button>
        </section>
        <section className={styles.controlGrid}>
          <div className={styles.automationList}><header><div><small>PROCESSI ATTIVI</small><b>Automazioni Dalecom</b></div><span>{automations.length} regole</span></header>{automations.map((item) => <button key={item.id} onClick={() => flash(`${item.id}: dettaglio e storico aperti`)}><i>{item.area.slice(0, 2)}</i><span><b>{item.name}</b><small>{item.summary}</small></span><span><StatusPill status={item.status} /><small>{item.runs} esecuzioni</small></span><em>›</em></button>)}</div>
          <div className={styles.today}><header><small>PROSSIME AZIONI</small><b>Agenda automatica</b></header>{reminders.slice(0, 4).map((item) => <button key={item.title} onClick={() => flash(`${item.title}: scheda attività aperta`)}><time>{item.when}</time><span><b>{item.title}</b><small>{item.owner} · {item.kind}</small></span><i className={styles[item.tone]} /></button>)}<footer><button onClick={() => setArea("events")}>Vedi tutte le ricorrenze →</button></footer></div>
        </section>
      </>}

      {area === "builder" && <section className={styles.builder}>
        <header><small>DA IDEA A PROCESSO</small><h2>Descrivi l’automazione</h2><p>Il motore individua evento iniziale, condizioni, azioni e approvazioni. Prima dell’attivazione puoi controllare tutto.</p></header>
        <div className={styles.promptBox}><span>✦</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="Descrizione automazione" /><button onClick={prepareFlow}>Analizza e prepara</button></div>
        <div className={styles.examples}><b>ESEMPI RAPIDI</b>{[
          "Ricordami i compleanni dei dipendenti 7 giorni prima e prepara un messaggio.",
          "Quando un contratto fornitore scade entro 30 giorni, avvisa acquisti e crea una bozza e-mail.",
          "Quando il modulo Bandi trova una fiera con pertinenza oltre 80, crea attività per Marketing.",
        ].map((text) => <button key={text} onClick={() => setPrompt(text)}>{text}</button>)}</div>
        {planReady && <section className={styles.flowPlan}>
          <header><div><small>PROPOSTA GENERATA</small><b>Automazione pronta per il controllo</b></div><span>IN PROVA</span></header>
          <div className={styles.flowSteps}>
            <article><i>01</i><small>QUANDO</small><b>Assegnazione logistica</b><p>Nuova squadra associata a cantiere.</p></article><strong>→</strong>
            <article><i>02</i><small>SE</small><b>Fuori regione · ≥ 2 giorni</b><p>Controlla durata, sede e persone.</p></article><strong>→</strong>
            <article><i>03</i><small>ALLORA</small><b>Confronta 3 soluzioni</b><p>Hotel, viaggio, ristorante e transfer.</p></article><strong>→</strong>
            <article><i>04</i><small>CONTROLLO</small><b>Chiede approvazione</b><p>Nessuna prenotazione automatica.</p></article>
          </div>
          <div className={styles.guardrails}><span>✓ Limite spesa da 1C</span><span>✓ Preferenze dipendenti</span><span>✓ Politica trasferte</span><span>✓ Registro completo</span></div>
          <footer><button onClick={() => setPlanReady(false)}>Modifica descrizione</button><button className={styles.primary} onClick={activateFlow}>Attiva in modalità prova</button></footer>
        </section>}
      </section>}

      {area === "travel" && <section className={styles.workspace}>
        <header><div><small>TRAVEL DESK AUTOMATICO</small><h2>Trasferte del personale</h2><p>Le assegnazioni arrivano dal Logista. Il sistema prepara alternative, costi e controlli per l’approvazione.</p></div><button onClick={() => flash("Ricerca aggiornata su tutte le trasferte aperte")}>Aggiorna proposte</button></header>
        <div className={styles.travelCards}>{travels.map((travel) => <article key={travel.id}><header><div><small>{travel.id}</small><b>{travel.site}</b></div><span>{travel.status}</span></header><p><b>{travel.team}</b><small>{travel.dates} · {travel.distance}</small></p><div>{travel.options.map((option) => <span key={option}>✓ {option}</span>)}</div><footer><strong>{travel.total}<small> proposta demo</small></strong><button onClick={() => flash(`${travel.id}: confronto tra le alternative aperto`)}>Confronta</button><button className={styles.primary} onClick={() => flash(`${travel.id}: proposta approvata, conferme preparate`)}>Approva</button></footer></article>)}</div>
        <section className={styles.travelFlow}>{["Logista assegna", "Controllo policy", "Ricerca e confronto", "Approvazione", "Conferme e reminder", "Costo su commessa"].map((item, index) => <span key={item}><i>{index + 1}</i><b>{item}</b>{index < 5 ? <em>→</em> : null}</span>)}</section>
      </section>}

      {area === "mail" && <section className={styles.workspace}>
        <header><div><small>POSTA INTERNA E SCADENZE</small><h2>Solo le comunicazioni che richiedono attenzione</h2><p>Le automazioni preparano bozze, solleciti e promemoria; l’invio esterno resta controllato.</p></div><button onClick={() => setArea("builder")}>＋ Crea regola</button></header>
        <div className={styles.mailGrid}><section><header><b>Posta da gestire</b><span>5</span></header>{[
          ["Alta", "Fornitore Beton Nord", "Certificati mezzo mancanti", "Bozza sollecito pronta"],
          ["Media", "Hotel Paese", "Rinnovo convenzione 2027", "Promemoria tra 4 giorni"],
          ["Media", "Costruzioni Delta", "Anniversario collaborazione", "Messaggio commerciale pronto"],
          ["Bassa", "SAIE Bologna", "Invito espositori", "Classificato da Modulo 15"],
        ].map((mail) => <button key={mail[1]} onClick={() => flash(`${mail[1]}: anteprima comunicazione aperta`)}><i className={mail[0] === "Alta" ? styles.red : styles.orange} /><span><b>{mail[1]}</b><small>{mail[2]}</small></span><em>{mail[3]}</em></button>)}</section>
        <section className={styles.rulePanel}><small>REGOLA IN EVIDENZA</small><h3>Sollecito documenti mancanti</h3><p>Ogni mattina controlla i documenti richiesti ai fornitori. Dopo 3 giorni prepara il primo sollecito; dopo 7 giorni avvisa il responsabile acquisti.</p><div><span><b>08:00</b><small>controllo giornaliero</small></span><span><b>3 / 7</b><small>giorni di escalation</small></span></div><button onClick={() => flash("Regola aperta nel costruttore")}>Modifica automazione</button></section></div>
      </section>}

      {area === "events" && <section className={styles.workspace}>
        <header><div><small>PERSONE, CLIENTI, FORNITORI ED EVENTI</small><h2>Ricorrenze e opportunità</h2><p>Un’unica agenda alimentata da 1C, HR, CRM e dal radar del modulo 15.</p></div><button onClick={() => flash("Promemoria manuale pronto per la compilazione")}>＋ Nuovo promemoria</button></header>
        <div className={styles.eventLayout}><section className={styles.timeline}><header><b>Prossime ricorrenze</b><span>settembre 2026</span></header>{reminders.map((item) => <button key={item.title} onClick={() => flash(`${item.title}: automazione e destinatari aperti`)}><time>{item.when}</time><i className={styles[item.tone]} /><span><b>{item.title}</b><small>{item.kind} · responsabile {item.owner}</small></span><em>›</em></button>)}</section>
        <section className={styles.fairs}><header><div><small>DAL MODULO 15</small><b>Fiere ed eventi suggeriti</b></div><a href="/bandi">Apri Bandi →</a></header>{fairs.map((fair) => <article key={fair.title}><time>{fair.date}</time><div><b>{fair.title}</b><small>{fair.place} · {fair.action}</small></div><strong>{fair.score}<small>/100</small></strong><button onClick={() => flash(`${fair.title}: attività creata per Marketing`)}>Crea attività</button></article>)}<footer>Il modulo 15 scopre e qualifica. Il modulo 10 assegna, ricorda e controlla l’esecuzione.</footer></section></div>
      </section>}

      {area === "log" && <section className={styles.workspace}>
        <header><div><small>TRACCIABILITÀ</small><h2>Registro esecuzioni</h2><p>Ogni decisione automatica conserva sorgente, risultato, approvazione e responsabile.</p></div><button onClick={() => flash("Registro filtrato: oggi")}>Oggi ▾</button></header>
        <div className={styles.logTable}><div className={styles.tableHead}><span>Ora</span><span>Regola</span><span>Azione</span><span>Esito</span><span>Controllo</span></div>{logs.map((row) => <button key={row.join("")} onClick={() => flash(`${row[1]}: dettaglio tecnico aperto`)}><time>{row[0]}</time><b>{row[1]}</b><span>{row[2]}</span><em>{row[3]}</em><strong>Apri →</strong></button>)}</div>
        <div className={styles.auditCards}><article><small>ULTIME 24 ORE</small><b>64 esecuzioni</b><span>59 completate · 5 in attesa</span></article><article><small>ERRORI</small><b>0 bloccanti</b><span>2 eccezioni gestite</span></article><article><small>APPROVAZIONI</small><b>3 aperte</b><span>Responsabili già avvisati</span></article></div>
      </section>}

      <footer className={styles.footer}><span><b>DALECOM</b> · Process Automation Center</span><small>Dati dimostrativi. Fonti definitive: 1C, Logista, calendari, posta e servizi viaggio autorizzati.</small></footer>
    </section>
  </main>;
}
