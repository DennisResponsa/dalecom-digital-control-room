"use client";

import { useMemo, useState } from "react";
import { safetyCheck } from "../safety-data";
import styles from "./page.module.css";
import maintenanceStyles from "./maintenance.module.css";

type Phase = "prep" | "assets" | "people";
type AssetState = "ok" | "warning" | "blocked" | "workshop";
type ResourceKind = "prep" | "asset" | "person" | "maintenance";

type Asset = {
  id: string;
  name: string;
  kind: "Macchina" | "Mezzo";
  category: "Pompe" | "Bracci" | "Trasporto" | "Attrezzature";
  state: AssetState;
  location: string;
  counter: string;
  maintenance: string;
  inspection: string;
  certificate: string;
  washing: string;
  parts: string;
};

type Preparation = {
  id: string;
  date: number | null;
  month: number;
  time: string;
  site: string;
  customer: string;
  service: string;
  checklist: string[];
  assets: string[];
  people: string[];
};

const weekDays = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];
const calendarMonths = [
  { number: 8, label: "AGOSTO" },
  { number: 9, label: "SETTEMBRE" },
  { number: 10, label: "OTTOBRE" },
  { number: 11, label: "NOVEMBRE" },
] as const;

type MaintenanceJob = {
  id: string;
  assetId: string;
  month: number;
  date: number | null;
  time: string;
  type: "Ordinaria" | "Straordinaria" | "Revisione" | "Lavaggio";
  status: "Completato" | "Programmato" | "In corso" | "Attesa ricambi" | "Bloccante";
  technician: string;
  duration: string;
  parts: string;
  note: string;
};

const assets: Asset[] = [
  { id: "M-160", name: "PCA TB30 #160", kind: "Macchina", category: "Pompe", state: "ok", location: "Padernello", counter: "1.842 h", maintenance: "Tra 158 h", inspection: "12/06/2027", certificate: "Conforme", washing: "Da lavare al rientro", parts: "Kit filtri prenotato" },
  { id: "M-183", name: "Braccio MX36 #183", kind: "Macchina", category: "Bracci", state: "warning", location: "Milano", counter: "986 h", maintenance: "Tra 42 h", inspection: "18/10/2026", certificate: "Scade tra 41 giorni", washing: "Lavaggio programmato 10/09", parts: "Disponibili" },
  { id: "M-189", name: "PCA BSA 2110 #189", kind: "Macchina", category: "Pompe", state: "workshop", location: "Officina Padernello", counter: "2.411 h", maintenance: "In corso", inspection: "20/02/2027", certificate: "Conforme", washing: "Completato", parts: "Attesa guarnizione" },
  { id: "M-271", name: "ATLAS XAVS186 #271", kind: "Macchina", category: "Attrezzature", state: "blocked", location: "Padernello", counter: "3.106 h", maintenance: "Scaduta", inspection: "04/09/2026", certificate: "Verifica scaduta", washing: "Da lavare", parts: "Cofano ordinato" },
  { id: "V-FW903", name: "Autocarro FW903KV", kind: "Mezzo", category: "Trasporto", state: "ok", location: "Padernello", counter: "128.430 km", maintenance: "Tra 5.570 km", inspection: "22/03/2027", certificate: "Conforme", washing: "Pulito 06/09", parts: "Disponibili" },
  { id: "V-GC589", name: "Furgone GC589XY", kind: "Mezzo", category: "Trasporto", state: "warning", location: "Bareggio", counter: "94.210 km", maintenance: "Tra 790 km", inspection: "16/11/2026", certificate: "Conforme", washing: "Da lavare", parts: "Filtro olio sotto scorta" },
  { id: "V-CITY", name: "CityPump · mezzo integrato", kind: "Mezzo", category: "Pompe", state: "ok", location: "Modena", counter: "76.520 km", maintenance: "Tra 3.480 km", inspection: "08/05/2027", certificate: "Conforme", washing: "Lavaggio a fine turno", parts: "Disponibili" },
  { id: "V-AP42", name: "Autopompa 42 m · EZ742PL", kind: "Mezzo", category: "Pompe", state: "ok", location: "Paese", counter: "112.680 km · 4.280 h", maintenance: "Tra 320 h", inspection: "14/04/2027", certificate: "Conforme", washing: "Lavaggio a fine getto", parts: "Kit tenute disponibile" },
  { id: "V-TR01", name: "Trattore stradale · GK218RT", kind: "Mezzo", category: "Trasporto", state: "ok", location: "Padernello", counter: "286.400 km", maintenance: "Tra 8.600 km", inspection: "29/01/2027", certificate: "Conforme", washing: "Da lavare", parts: "Disponibili" },
  { id: "V-RM01", name: "Semirimorchio pianale · RM01", kind: "Mezzo", category: "Trasporto", state: "warning", location: "Paese", counter: "—", maintenance: "Controllo tra 21 giorni", inspection: "01/10/2026", certificate: "Revisione vicina", washing: "Pulito 05/09", parts: "Pneumatico prenotato" },
];

const people = [
  "Mario Rossi",
  "Miglioranza Cristiano",
  "Loriato Flavio",
  "Marconato Ermens",
  "Garbin Thomas",
  "Kaci Ilirjan",
  "Toscano Enrico",
  "Mihali Daniel",
  "Berdaga Mihail",
];

const initialPreparations: Preparation[] = [
  { id: "PREP-0907", date: 7, month: 9, time: "06:30", site: "Cantiere Z · Milano", customer: "Cliente demo Milano", service: "Pompaggio a caldo", checklist: ["Tubi e curve", "Kit pulizia", "Documenti cantiere"], assets: ["M-160", "V-FW903"], people: ["Mario Rossi"] },
  { id: "PREP-0908", date: 8, month: 9, time: "07:00", site: "Modena · Vera Costruzioni", customer: "Vera Costruzioni", service: "CityPump", checklist: ["Tubi alta pressione", "DPI squadra", "Rapportino digitale"], assets: ["V-CITY"], people: ["Kaci Ilirjan", "Garbin Thomas"] },
  { id: "PREP-0910", date: 10, month: 9, time: "05:45", site: "Roma · ColaBeton", customer: "ColaBeton", service: "Noleggio semifreddo", checklist: ["Documenti mezzo", "Materiale consumo", "Consegna ricambi"], assets: ["V-GC589"], people: ["Loriato Flavio"] },
  { id: "PREP-QUEUE-1", date: null, month: 9, time: "07:00", site: "Venezia · Boscolo", customer: "Boscolo", service: "Noleggio a freddo", checklist: ["Tubi e accessori", "Verbale consegna", "Lavaggio al rientro"], assets: [], people: [] },
  { id: "PREP-QUEUE-2", date: null, month: 9, time: "08:00", site: "Padernello · manutenzione interna", customer: "Dalecom", service: "Rientro programmato", checklist: ["Area lavaggio", "Scheda manutenzione", "Ricambi prenotati"], assets: ["M-183"], people: ["Miglioranza Cristiano"] },
];

const initialMaintenanceJobs: MaintenanceJob[] = [
  { id: "ODL-0821", assetId: "M-160", month: 8, date: 21, time: "08:00", type: "Ordinaria", status: "Completato", technician: "Miglioranza Cristiano", duration: "4 h", parts: "Filtro olio, filtro gasolio, 18 l olio", note: "Tagliando completato e collaudo firmato." },
  { id: "ODL-0827", assetId: "V-GC589", month: 8, date: 27, time: "16:30", type: "Lavaggio", status: "Completato", technician: "Mario Rossi", duration: "1 h", parts: "Detergente e trattamento cabina", note: "Lavaggio rientro cantiere." },
  { id: "ODL-0908", assetId: "M-189", month: 9, date: 8, time: "07:30", type: "Straordinaria", status: "Attesa ricambi", technician: "Miglioranza Cristiano", duration: "8 h", parts: "Guarnizione pompaggio in consegna", note: "Perdita rilevata. Macchina ferma fino al collaudo finale." },
  { id: "ODL-0910", assetId: "M-183", month: 9, date: 10, time: "17:00", type: "Lavaggio", status: "Programmato", technician: "Mario Rossi", duration: "1,5 h", parts: "Area lavaggio prenotata", note: "Lavaggio completo dopo rientro dal cantiere Milano." },
  { id: "ODL-0912", assetId: "V-GC589", month: 9, date: 12, time: "08:00", type: "Ordinaria", status: "Programmato", technician: "Miglioranza Cristiano", duration: "3 h", parts: "Filtro olio sotto scorta", note: "Tagliando al raggiungimento di 95.000 km." },
  { id: "ODL-0918", assetId: "M-183", month: 9, date: 18, time: "08:30", type: "Revisione", status: "Programmato", technician: "Ente terzo + officina", duration: "1 giorno", parts: "Nessun ricambio previsto", note: "Controllo strutturale e certificazione del braccio." },
  { id: "ODL-0922", assetId: "V-CITY", month: 9, date: 22, time: "18:00", type: "Lavaggio", status: "Programmato", technician: "Squadra CityPump", duration: "1 h", parts: "Materiale lavaggio disponibile", note: "Lavaggio mezzo e gruppo pompante." },
  { id: "ODL-0928", assetId: "M-271", month: 9, date: 28, time: "09:00", type: "Revisione", status: "Bloccante", technician: "Responsabile officina", duration: "Da definire", parts: "Cofano ordinato", note: "Certificazione scaduta. Asset non assegnabile." },
  { id: "ODL-0915", assetId: "V-AP42", month: 9, date: 15, time: "07:30", type: "Ordinaria", status: "Programmato", technician: "Officina Dalecom", duration: "6 h", parts: "Filtri motore e kit tenute", note: "Controllo congiunto automezzo e gruppo pompante." },
  { id: "ODL-0924", assetId: "V-RM01", month: 9, date: 24, time: "08:00", type: "Revisione", status: "Programmato", technician: "Ente terzo + officina", duration: "4 h", parts: "Pneumatico prenotato", note: "Revisione del mezzo di trasporto e verifica punti di ancoraggio." },
  { id: "ODL-1005", assetId: "V-FW903", month: 10, date: 5, time: "08:00", type: "Ordinaria", status: "Programmato", technician: "Miglioranza Cristiano", duration: "4 h", parts: "Kit filtri disponibile", note: "Controllo programmato prima del ciclo cantieri autunnale." },
  { id: "ODL-1018", assetId: "M-183", month: 10, date: 18, time: "08:00", type: "Revisione", status: "Programmato", technician: "Ente terzo + officina", duration: "1 giorno", parts: "Documentazione predisposta", note: "Scadenza inderogabile certificazione braccio." },
  { id: "ODL-1104", assetId: "M-160", month: 11, date: 4, time: "07:30", type: "Ordinaria", status: "Programmato", technician: "Miglioranza Cristiano", duration: "5 h", parts: "Kit filtri prenotato", note: "Manutenzione prevista al raggiungimento delle 2.000 ore." },
  { id: "ODL-1114", assetId: "V-CITY", month: 11, date: 14, time: "16:30", type: "Lavaggio", status: "Programmato", technician: "Squadra CityPump", duration: "1,5 h", parts: "Area lavaggio prenotata", note: "Lavaggio approfondito e controllo scarichi." },
];

const maintenanceChecklist = [
  "Funzionamento macchina",
  "Sistemi e spine di sicurezza",
  "Pulsanti di emergenza",
  "Manometri olio e pompaggio",
  "Usura tamponi o statore",
  "Perdite olio e ingrassaggio",
  "Livelli olio, acqua e carburante",
  "Stato batteria",
];

function payload(kind: ResourceKind, value: string, sourceId = "") {
  return `${kind}|${encodeURIComponent(value)}|${encodeURIComponent(sourceId)}`;
}

function parsePayload(value: string) {
  const [kind, encodedValue, encodedSource] = value.split("|");
  if (!encodedValue || !["prep", "asset", "person", "maintenance"].includes(kind)) return null;
  return { kind: kind as ResourceKind, value: decodeURIComponent(encodedValue), sourceId: decodeURIComponent(encodedSource || "") };
}

const stateLabel: Record<AssetState, string> = {
  ok: "REGOLARE",
  warning: "SCADENZA VICINA",
  blocked: "NON ASSEGNABILE",
  workshop: "IN OFFICINA",
};

export default function WorkshopPage() {
  const [phase, setPhase] = useState<Phase>("assets");
  const [preparations, setPreparations] = useState(initialPreparations);
  const [maintenanceJobs, setMaintenanceJobs] = useState(initialMaintenanceJobs);
  const [selectedId, setSelectedId] = useState("PREP-0907");
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState("ODL-0908");
  const [currentMonth, setCurrentMonth] = useState(9);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [assetCategory, setAssetCategory] = useState<"Tutti" | Asset["category"]>("Tutti");
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const monthIndex = calendarMonths.findIndex((item) => item.number === currentMonth);
  const month = calendarMonths[monthIndex];
  const days = Array.from({ length: new Date(2026, currentMonth, 0).getDate() }, (_, index) => index + 1);
  const blankCount = (new Date(2026, currentMonth - 1, 1).getDay() + 6) % 7;
  const blanks = Array.from({ length: blankCount });
  const selectedMaintenance = maintenanceJobs.find((item) => item.id === selectedMaintenanceId) || maintenanceJobs[0];
  const maintenanceAsset = assets.find((item) => item.id === selectedMaintenance.assetId) || assets[0];

  const selected = preparations.find((item) => item.id === selectedId) || preparations[0];
  const assignedAssets = selected.assets.map((id) => assets.find((item) => item.id === id)).filter(Boolean) as Asset[];
  const blockedAssets = assignedAssets.filter((item) => item.state === "blocked" || item.state === "workshop");
  const blockedPeople = selected.people.filter((name) => safetyCheck(name, selected.site).level === "red");
  const scheduledCount = preparations.filter((item) => item.date !== null).length;
  const washingCount = assets.filter((item) => /da lavare|programmato|fine turno/i.test(item.washing)).length;
  const availableCount = assets.filter((item) => item.state === "ok" || item.state === "warning").length;
  const monthMaintenance = maintenanceJobs.filter((item) => item.month === currentMonth && item.date !== null);
  const openMaintenance = monthMaintenance.filter((item) => item.status !== "Completato").length;

  const filteredAssets = useMemo(() => assets.filter((item) => (assetCategory === "Tutti" || item.category === assetCategory) && `${item.name} ${item.kind} ${item.category} ${item.location}`.toLowerCase().includes(search.toLowerCase())), [search, assetCategory]);
  const filteredPeople = useMemo(() => people.filter((name) => name.toLowerCase().includes(search.toLowerCase())), [search]);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const movePreparation = (id: string, date: number | null) => {
    setPreparations((current) => current.map((item) => item.id === id ? { ...item, date, month: currentMonth } : item));
    setSelectedId(id);
    flash(date ? `Preparazione pianificata il ${date} ${month.label.toLocaleLowerCase("it")}.` : "Cantiere conservato e riportato tra le preparazioni di magazzino.");
  };

  const moveMaintenance = (id: string, date: number) => {
    setMaintenanceJobs((current) => current.map((item) => item.id === id ? { ...item, date, month: currentMonth } : item));
    setSelectedMaintenanceId(id);
    flash(`Intervento riprogrammato il ${date} ${month.label.toLocaleLowerCase("it")}.`);
  };

  const assignResource = (prepId: string, kind: ResourceKind, value: string) => {
    const target = preparations.find((item) => item.id === prepId);
    if (!target) return;
    if (kind === "asset") {
      const asset = assets.find((item) => item.id === value);
      if (!asset) return;
      if (asset.state === "blocked" || asset.state === "workshop") {
        flash(`⛔ ${asset.name} non è assegnabile: ${asset.certificate}.`);
        return;
      }
      const alreadyBusy = preparations.some((item) => item.id !== prepId && item.month === target.month && item.date === target.date && item.assets.includes(value));
      if (alreadyBusy) {
        flash(`⛔ ${asset.name} è già impegnato nella stessa giornata.`);
        return;
      }
      setPreparations((current) => current.map((item) => item.id === prepId && !item.assets.includes(value) ? { ...item, assets: [...item.assets, value] } : item));
      flash(`${asset.name} collegato a ${target.site}.`);
    }
    if (kind === "person") {
      const safety = safetyCheck(value, target.site);
      if (safety.level === "red") {
        flash(`⛔ ${value} non assegnabile: ${safety.missing.join(", ")}.`);
        return;
      }
      const alreadyBusy = preparations.some((item) => item.id !== prepId && item.month === target.month && item.date === target.date && item.people.includes(value));
      if (alreadyBusy) {
        flash(`⛔ ${value} è già assegnato nella stessa giornata.`);
        return;
      }
      setPreparations((current) => current.map((item) => item.id === prepId && !item.people.includes(value) ? { ...item, people: [...item.people, value] } : item));
      flash(`${value} collegato a ${target.site}.`);
    }
  };

  const removeResource = (prepId: string, kind: ResourceKind, value: string) => {
    setPreparations((current) => current.map((item) => item.id !== prepId ? item : kind === "asset" ? { ...item, assets: item.assets.filter((id) => id !== value) } : kind === "person" ? { ...item, people: item.people.filter((name) => name !== value) } : item));
    flash("Risorsa riportata nella colonna di sinistra.");
  };

  const dropOnPreparation = (event: React.DragEvent, prepId: string) => {
    event.preventDefault();
    event.stopPropagation();
    const parsed = parsePayload(event.dataTransfer.getData("text/plain"));
    if (parsed?.kind === "asset" || parsed?.kind === "person") assignResource(prepId, parsed.kind, parsed.value);
  };

  const dropOnSidebar = (event: React.DragEvent) => {
    event.preventDefault();
    const parsed = parsePayload(event.dataTransfer.getData("text/plain"));
    if (parsed?.sourceId && (parsed.kind === "asset" || parsed.kind === "person")) removeResource(parsed.sourceId, parsed.kind, parsed.value);
    if (parsed?.kind === "prep") movePreparation(parsed.value, null);
  };

  const changeMonth = (direction: -1 | 1) => {
    const next = calendarMonths[monthIndex + direction];
    if (next) setCurrentMonth(next.number);
  };

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}><img src="/dalecom-logo.png" alt="Dalecom" /><span>CENTRALE TECNICA</span></div>
        <nav><a href="/demo">← Regia principale</a><button type="button" onClick={() => flash("Dati aggiornati · fonte prevista 1C")}>Aggiorna da 1C</button></nav>
      </header>

      <section className={styles.hero}>
        <div><small>MODULO 09 · MAGAZZINO, OFFICINA E MANUTENZIONE</small><h1>Manutenzioni. Ricambi. <em>Disponibilità.</em></h1><p>Il calendario tecnico governa manutenzione ordinaria e straordinaria, revisioni, certificazioni e lavaggi. Preparazione cantieri e uomini restano collegati.</p></div>
        <div className={styles.source}><i /> DATI DEMO<br /><b>Fonte prevista: 1C</b></div>
      </section>

      <section className={styles.kpis}>
        <article><small>INTERVENTI NEL MESE</small><b>{monthMaintenance.length}</b><span>{openMaintenance} ancora aperti</span></article>
        <article><small>MEZZI E MACCHINE UTILIZZABILI</small><b>{availableCount}</b><span>su {assets.length} censiti</span></article>
        <article className={styles.washKpi}><small>LAVAGGI DA PROGRAMMARE</small><b>{washingCount}</b><span>mezzi e macchinari</span></article>
        <article className={styles.alertKpi}><small>BLOCCHI TECNICI</small><b>{assets.filter((item) => item.state === "blocked" || item.state === "workshop").length}</b><span>non assegnabili</span></article>
      </section>

      <section className={styles.phaseBar} aria-label="Fasi operative">
        <button className={phase === "prep" ? styles.active : ""} onClick={() => setPhase("prep")}><b>1</b><span>Preparazione cantieri<small>Materiali, documenti e attività</small></span></button>
        <button className={phase === "assets" ? styles.active : ""} onClick={() => setPhase("assets")}><b>2</b><span>Mezzi<small>Officina, ricambi, revisioni e lavaggio</small></span></button>
        <button className={phase === "people" ? styles.active : ""} onClick={() => setPhase("people")}><b>3</b><span>Uomini<small>DPI, formazione e scadenze</small></span></button>
      </section>

      {notice ? <div className={styles.notice}>{notice}</div> : null}

      <section className={styles.workspace}>
        <aside className={styles.sidebar} onDragOver={(event) => event.preventDefault()} onDrop={dropOnSidebar}>
          <header><small>FASE {phase === "prep" ? "01" : phase === "assets" ? "02" : "03"}</small><b>{phase === "prep" ? "Preparazioni" : phase === "assets" ? "Mezzi e macchine" : "Personale"}</b><span>Trascina sul calendario o su una scheda</span></header>
          {phase !== "prep" ? <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cerca…" aria-label="Cerca risorsa" /> : null}
          {phase === "assets" ? <div className={maintenanceStyles.assetFilters}>{(["Tutti", "Pompe", "Bracci", "Trasporto", "Attrezzature"] as const).map((category) => <button type="button" key={category} className={assetCategory === category ? maintenanceStyles.assetFilterActive : ""} onClick={() => setAssetCategory(category)}>{category}</button>)}</div> : null}
          <div className={styles.resourceList}>
            {phase === "prep" ? preparations.filter((item) => item.date === null).map((item) => <button key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", payload("prep", item.id))} onClick={() => setSelectedId(item.id)} className={styles.resource}><i>P</i><span><b>{item.site}</b><small>{item.service} · {item.time}</small></span><em>⠿</em></button>) : null}
            {phase === "assets" ? filteredAssets.map((item) => <button key={item.id} draggable={item.state !== "blocked" && item.state !== "workshop"} onDragStart={(event) => event.dataTransfer.setData("text/plain", payload("asset", item.id))} onClick={() => { const job = maintenanceJobs.find((entry) => entry.assetId === item.id); if (job) { setSelectedMaintenanceId(job.id); setCurrentMonth(job.month); } else flash(`${item.name} · ${item.maintenance} · ${item.washing}`); }} className={`${styles.resource} ${styles[item.state]}`}><i>{item.category === "Pompe" ? "P" : item.category === "Bracci" ? "B" : item.category === "Trasporto" ? "T" : "A"}</i><span><b>{item.name}</b><small>{item.category} · {stateLabel[item.state]} · {item.washing}</small></span><em>{item.state === "blocked" || item.state === "workshop" ? "×" : "⠿"}</em></button>) : null}
            {phase === "people" ? filteredPeople.map((name) => {
              const safety = safetyCheck(name, selected.site);
              return <button key={name} draggable={safety.level !== "red"} onDragStart={(event) => event.dataTransfer.setData("text/plain", payload("person", name))} onClick={() => flash(safety.level === "red" ? `${name} · ${safety.missing.join(", ")}` : `${name} · Safety Passport ${safety.level === "yellow" ? "con avvisi" : "conforme"}`)} className={`${styles.resource} ${styles[safety.level]}`}><i>U</i><span><b>{name}</b><small>{safety.level === "red" ? "NON ASSEGNABILE" : safety.level === "yellow" ? "SCADENZA VICINA" : "DPI E FORMAZIONE OK"}</small></span><em>{safety.level === "red" ? "×" : "⠿"}</em></button>;
            }) : null}
          </div>
          <div className={styles.dropBack}>↩ Trascina qui per riportare il cantiere nelle preparazioni di magazzino</div>
        </aside>

        <section className={styles.calendarWrap}>
          <header className={styles.calendarHead}><div><button className={maintenanceStyles.monthButton} type="button" onClick={() => changeMonth(-1)} disabled={monthIndex === 0} aria-label="Mese precedente">‹</button><strong>{month.label} 2026</strong><button className={maintenanceStyles.monthButton} type="button" onClick={() => changeMonth(1)} disabled={monthIndex === calendarMonths.length - 1} aria-label="Mese successivo">›</button></div><span>{phase === "assets" ? "Piano manutenzioni, revisioni e lavaggi" : "Calendario condiviso · preparazione → mezzi → uomini"}</span></header>
          <div className={styles.weekHead}>{weekDays.map((day) => <b key={day}>{day}</b>)}</div>
          <div className={styles.calendar}>
            {blanks.map((_, index) => <div className={styles.blank} key={`blank-${index}`} />)}
            {days.map((day) => <div key={day} className={`${styles.day} ${(blankCount + day - 1) % 7 >= 5 ? styles.weekend : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
              event.preventDefault();
              const parsed = parsePayload(event.dataTransfer.getData("text/plain"));
              if (parsed?.kind === "prep") movePreparation(parsed.value, day);
              if (parsed?.kind === "maintenance") moveMaintenance(parsed.value, day);
            }}><span className={styles.dayNumber}>{day}</span><div className={styles.cards}>{phase === "assets" ? maintenanceJobs.filter((item) => item.month === currentMonth && item.date === day).map((item) => {
              const asset = assets.find((entry) => entry.id === item.assetId) || assets[0];
              return <article key={item.id} tabIndex={0} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", payload("maintenance", item.id))} onClick={() => setSelectedMaintenanceId(item.id)} className={`${styles.job} ${maintenanceStyles.maintenanceJobCard} ${maintenanceStyles[`type${item.type}`]} ${selectedMaintenanceId === item.id ? styles.selected : ""} ${item.status === "Bloccante" ? styles.jobBlocked : ""}`}>
                <div><b>{item.time}</b><small>⠿ {item.type.toUpperCase()}</small></div>
                <strong>{asset.name}</strong>
                <span>{item.status} · {item.technician}</span>
                <small>Ricambi: {item.parts}</small>
              </article>;
            }) : preparations.filter((item) => item.month === currentMonth && item.date === day).map((item) => {
              const itemAssets = item.assets.map((id) => assets.find((asset) => asset.id === id)).filter(Boolean) as Asset[];
              const technicalBlock = itemAssets.some((asset) => asset.state === "blocked" || asset.state === "workshop");
              const peopleBlock = item.people.some((name) => safetyCheck(name, item.site).level === "red");
              return <article key={item.id} tabIndex={0} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", payload("prep", item.id))} onClick={() => setSelectedId(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropOnPreparation(event, item.id)} className={`${styles.job} ${selectedId === item.id ? styles.selected : ""} ${technicalBlock || peopleBlock ? styles.jobBlocked : ""}`}>
                <div><b>{item.time}</b><small>⠿ {item.service}</small></div>
                <strong>{item.site}</strong>
                <span>{item.assets.length} mezzi/macchine · {item.people.length} uomini</span>
                <button type="button" className={maintenanceStyles.removeJob} onClick={(event) => { event.stopPropagation(); movePreparation(item.id, null); }}>↩ Riporta in preparazione</button>
                {item.assets.map((id) => { const asset = assets.find((entry) => entry.id === id); return asset ? <small key={id} draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData("text/plain", payload("asset", id, item.id)); }}>M/V · {asset.name} ↩</small> : null; })}
                {item.people.map((name) => <small key={name} draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData("text/plain", payload("person", name, item.id)); }}>U · {name} ↩</small>)}
              </article>;
            })}</div></div>)}
          </div>
        </section>

        {phase === "assets" ? <aside className={styles.inspector}>
          <header><small>ORDINE DI LAVORO · {selectedMaintenance.id}</small><b>{maintenanceAsset.name}</b><span>{selectedMaintenance.type} · {selectedMaintenance.status}</span></header>
          <section className={`${styles.readiness} ${selectedMaintenance.status === "Bloccante" ? maintenanceStyles.readinessBlocked : ""}`}><b>{selectedMaintenance.status === "Completato" ? "✓ INTERVENTO COMPLETATO" : selectedMaintenance.status === "Bloccante" ? "⛔ MACCHINA NON DISPONIBILE" : "● INTERVENTO APERTO"}</b><span>{selectedMaintenance.date} {calendarMonths.find((item) => item.number === selectedMaintenance.month)?.label.toLocaleLowerCase("it")} 2026 · {selectedMaintenance.time} · durata {selectedMaintenance.duration}</span></section>
          <section className={styles.detailSection}><div className={styles.sectionTitle}><b>Dati macchina o mezzo</b><span>{maintenanceAsset.category}</span></div><article className={`${styles.assetCard} ${styles[maintenanceAsset.state]}`}><b>{maintenanceAsset.name}</b><span>{maintenanceAsset.kind} · {maintenanceAsset.category} · {maintenanceAsset.counter} · {maintenanceAsset.location}</span><small>Manutenzione: {maintenanceAsset.maintenance}</small><small>Revisione/certificati: {maintenanceAsset.certificate}</small><small className={styles.washing}>Lavaggio: {maintenanceAsset.washing}</small></article></section>
          <section className={styles.detailSection}><div className={styles.sectionTitle}><b>Intervento</b><span>{selectedMaintenance.status}</span></div><article className={maintenanceStyles.workOrder}><b>{selectedMaintenance.type}</b><span>Tecnico: {selectedMaintenance.technician}</span><span>Ricambi: {selectedMaintenance.parts}</span><small>{selectedMaintenance.note}</small></article></section>
          <details key={selectedMaintenance.id} className={styles.maintenance} open><summary>Scheda manutenzione e collaudo</summary><div><b>Controlli dalla scheda Dalecom</b>{maintenanceChecklist.map((item) => <label key={item}><input type="checkbox" defaultChecked={selectedMaintenance.status === "Completato"} />{item}<select defaultValue={selectedMaintenance.status === "Completato" ? "OK" : ""}><option value="">Esito</option><option>OK</option><option>NON OK</option><option>SISTEMATO</option></select></label>)}<small>Firma tecnico e verifica responsabile alla chiusura.</small></div></details>
        </aside> : <aside className={styles.inspector}>
          <header><small>SCHEDA OPERATIVA</small><b>{selected.site}</b><span>{selected.customer} · {selected.service}</span></header>
          <section className={styles.readiness}>
            <b>{blockedAssets.length || blockedPeople.length ? "⛔ PREPARAZIONE BLOCCATA" : selected.assets.length && (selected.people.length || selected.service.includes("freddo")) ? "✓ CANTIERE PRONTO" : "△ DATI DA COMPLETARE"}</b>
            <span>{blockedAssets.length ? `${blockedAssets.length} mezzo/macchina non conforme` : blockedPeople.length ? `${blockedPeople.length} persona non conforme` : "Controlli tecnici e sicurezza collegati"}</span>
          </section>

          <section className={styles.detailSection}><div className={styles.sectionTitle}><b>1 · Preparazione</b><span>{selected.checklist.filter((item) => checks[`${selected.id}-${item}`]).length}/{selected.checklist.length}</span></div>{selected.checklist.map((item) => <button key={item} onClick={() => setChecks((current) => ({ ...current, [`${selected.id}-${item}`]: !current[`${selected.id}-${item}`] }))} className={checks[`${selected.id}-${item}`] ? styles.checked : ""}><i>{checks[`${selected.id}-${item}`] ? "✓" : ""}</i>{item}</button>)}</section>

          <section className={styles.detailSection}><div className={styles.sectionTitle}><b>2 · Mezzi, officina e ricambi</b><span>{assignedAssets.length}</span></div>{assignedAssets.length ? assignedAssets.map((asset) => <article className={`${styles.assetCard} ${styles[asset.state]}`} key={asset.id}><b>{asset.name}</b><span>{asset.counter} · {asset.location}</span><small>Manutenzione: {asset.maintenance}</small><small>Revisione/certificati: {asset.certificate}</small><small className={styles.washing}>Lavaggio: {asset.washing}</small><small>Ricambi: {asset.parts}</small></article>) : <p>Trascina qui una macchina o un mezzo.</p>}</section>

          <section className={styles.detailSection}><div className={styles.sectionTitle}><b>3 · Uomini</b><span>{selected.people.length}</span></div>{selected.people.length ? selected.people.map((name) => { const safety = safetyCheck(name, selected.site); return <article className={`${styles.personCard} ${styles[safety.level]}`} key={name}><b>{name}</b><span>{safety.level === "green" ? "DPI e formazione conformi" : safety.level === "yellow" ? `Avviso: ${safety.warnings.join(", ")}` : `Blocco: ${safety.missing.join(", ")}`}</span></article>; }) : <p>Nessun uomo Dalecom assegnato.</p>}</section>

          <details className={styles.maintenance}><summary>Scheda manutenzione e collaudo</summary><div><b>Controlli dalla scheda Dalecom</b>{maintenanceChecklist.map((item) => <label key={item}><input type="checkbox" />{item}<select defaultValue=""><option value="">Esito</option><option>OK</option><option>NON OK</option><option>SISTEMATO</option></select></label>)}<small>Firma tecnico e verifica responsabile alla chiusura.</small></div></details>
        </aside>}
      </section>

      <footer className={styles.footer}><b>DALECOM · CENTRALE TECNICA</b><span>Le scadenze obbligatorie bloccano l’assegnazione. Le scadenze vicine generano un avviso.</span><small>Dati dimostrativi · fonte prevista 1C</small></footer>
    </main>
  );
}
