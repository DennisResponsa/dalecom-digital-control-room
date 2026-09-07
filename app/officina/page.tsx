"use client";

import { useMemo, useState } from "react";
import { safetyCheck } from "../safety-data";
import styles from "./page.module.css";

type Phase = "prep" | "assets" | "people";
type AssetState = "ok" | "warning" | "blocked" | "workshop";
type ResourceKind = "prep" | "asset" | "person";

type Asset = {
  id: string;
  name: string;
  kind: "Macchina" | "Mezzo";
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
  time: string;
  site: string;
  customer: string;
  service: string;
  checklist: string[];
  assets: string[];
  people: string[];
};

const days = Array.from({ length: 30 }, (_, index) => index + 1);
const blanks = Array.from({ length: 1 });
const weekDays = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];

const assets: Asset[] = [
  { id: "M-160", name: "PCA TB30 #160", kind: "Macchina", state: "ok", location: "Padernello", counter: "1.842 h", maintenance: "Tra 158 h", inspection: "12/06/2027", certificate: "Conforme", washing: "Da lavare al rientro", parts: "Kit filtri prenotato" },
  { id: "M-183", name: "Braccio MX36 #183", kind: "Macchina", state: "warning", location: "Milano", counter: "986 h", maintenance: "Tra 42 h", inspection: "18/10/2026", certificate: "Scade tra 41 giorni", washing: "Lavaggio programmato 10/09", parts: "Disponibili" },
  { id: "M-189", name: "PCA BSA 2110 #189", kind: "Macchina", state: "workshop", location: "Officina Padernello", counter: "2.411 h", maintenance: "In corso", inspection: "20/02/2027", certificate: "Conforme", washing: "Completato", parts: "Attesa guarnizione" },
  { id: "M-271", name: "ATLAS XAVS186 #271", kind: "Macchina", state: "blocked", location: "Padernello", counter: "3.106 h", maintenance: "Scaduta", inspection: "04/09/2026", certificate: "Verifica scaduta", washing: "Da lavare", parts: "Cofano ordinato" },
  { id: "V-FW903", name: "Autocarro FW903KV", kind: "Mezzo", state: "ok", location: "Padernello", counter: "128.430 km", maintenance: "Tra 5.570 km", inspection: "22/03/2027", certificate: "Conforme", washing: "Pulito 06/09", parts: "Disponibili" },
  { id: "V-GC589", name: "Furgone GC589XY", kind: "Mezzo", state: "warning", location: "Bareggio", counter: "94.210 km", maintenance: "Tra 790 km", inspection: "16/11/2026", certificate: "Conforme", washing: "Da lavare", parts: "Filtro olio sotto scorta" },
  { id: "V-CITY", name: "CityPump · mezzo integrato", kind: "Mezzo", state: "ok", location: "Modena", counter: "76.520 km", maintenance: "Tra 3.480 km", inspection: "08/05/2027", certificate: "Conforme", washing: "Lavaggio a fine turno", parts: "Disponibili" },
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
  { id: "PREP-0907", date: 7, time: "06:30", site: "Cantiere Z · Milano", customer: "Cliente demo Milano", service: "Pompaggio a caldo", checklist: ["Tubi e curve", "Kit pulizia", "Documenti cantiere"], assets: ["M-160", "V-FW903"], people: ["Mario Rossi"] },
  { id: "PREP-0908", date: 8, time: "07:00", site: "Modena · Vera Costruzioni", customer: "Vera Costruzioni", service: "CityPump", checklist: ["Tubi alta pressione", "DPI squadra", "Rapportino digitale"], assets: ["V-CITY"], people: ["Kaci Ilirjan", "Garbin Thomas"] },
  { id: "PREP-0910", date: 10, time: "05:45", site: "Roma · ColaBeton", customer: "ColaBeton", service: "Noleggio semifreddo", checklist: ["Documenti mezzo", "Materiale consumo", "Consegna ricambi"], assets: ["V-GC589"], people: ["Loriato Flavio"] },
  { id: "PREP-QUEUE-1", date: null, time: "07:00", site: "Venezia · Boscolo", customer: "Boscolo", service: "Noleggio a freddo", checklist: ["Tubi e accessori", "Verbale consegna", "Lavaggio al rientro"], assets: [], people: [] },
  { id: "PREP-QUEUE-2", date: null, time: "08:00", site: "Padernello · manutenzione interna", customer: "Dalecom", service: "Rientro programmato", checklist: ["Area lavaggio", "Scheda manutenzione", "Ricambi prenotati"], assets: ["M-183"], people: ["Miglioranza Cristiano"] },
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
  if (!encodedValue || !["prep", "asset", "person"].includes(kind)) return null;
  return { kind: kind as ResourceKind, value: decodeURIComponent(encodedValue), sourceId: decodeURIComponent(encodedSource || "") };
}

const stateLabel: Record<AssetState, string> = {
  ok: "REGOLARE",
  warning: "SCADENZA VICINA",
  blocked: "NON ASSEGNABILE",
  workshop: "IN OFFICINA",
};

export default function WorkshopPage() {
  const [phase, setPhase] = useState<Phase>("prep");
  const [preparations, setPreparations] = useState(initialPreparations);
  const [selectedId, setSelectedId] = useState("PREP-0907");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const selected = preparations.find((item) => item.id === selectedId) || preparations[0];
  const assignedAssets = selected.assets.map((id) => assets.find((item) => item.id === id)).filter(Boolean) as Asset[];
  const blockedAssets = assignedAssets.filter((item) => item.state === "blocked" || item.state === "workshop");
  const blockedPeople = selected.people.filter((name) => safetyCheck(name, selected.site).level === "red");
  const scheduledCount = preparations.filter((item) => item.date !== null).length;
  const washingCount = assets.filter((item) => /da lavare|programmato|fine turno/i.test(item.washing)).length;
  const availableCount = assets.filter((item) => item.state === "ok" || item.state === "warning").length;

  const filteredAssets = useMemo(() => assets.filter((item) => `${item.name} ${item.kind} ${item.location}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const filteredPeople = useMemo(() => people.filter((name) => name.toLowerCase().includes(search.toLowerCase())), [search]);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const movePreparation = (id: string, date: number | null) => {
    setPreparations((current) => current.map((item) => item.id === id ? { ...item, date } : item));
    setSelectedId(id);
    flash(date ? `Preparazione pianificata il ${date} settembre.` : "Preparazione riportata nella colonna operativa.");
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
      const alreadyBusy = preparations.some((item) => item.id !== prepId && item.date === target.date && item.assets.includes(value));
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
      const alreadyBusy = preparations.some((item) => item.id !== prepId && item.date === target.date && item.people.includes(value));
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

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}><img src="/dalecom-logo.png" alt="Dalecom" /><span>CENTRALE TECNICA</span></div>
        <nav><a href="/demo">← Regia principale</a><button type="button" onClick={() => flash("Dati aggiornati · fonte prevista 1C")}>Aggiorna da 1C</button></nav>
      </header>

      <section className={styles.hero}>
        <div><small>MODULO 09 · MAGAZZINO, OFFICINA E MANUTENZIONE</small><h1>Preparare. Assegnare. <em>Proteggere.</em></h1><p>Un unico calendario collega cantiere, macchine, mezzi, ricambi e uomini. Le scadenze bloccanti impediscono assegnazioni non conformi.</p></div>
        <div className={styles.source}><i /> DATI DEMO<br /><b>Fonte prevista: 1C</b></div>
      </section>

      <section className={styles.kpis}>
        <article><small>PREPARAZIONI PIANIFICATE</small><b>{scheduledCount}</b><span>{preparations.length - scheduledCount} da collocare</span></article>
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
          <div className={styles.resourceList}>
            {phase === "prep" ? preparations.filter((item) => item.date === null).map((item) => <button key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", payload("prep", item.id))} onClick={() => setSelectedId(item.id)} className={styles.resource}><i>P</i><span><b>{item.site}</b><small>{item.service} · {item.time}</small></span><em>⠿</em></button>) : null}
            {phase === "assets" ? filteredAssets.map((item) => <button key={item.id} draggable={item.state !== "blocked" && item.state !== "workshop"} onDragStart={(event) => event.dataTransfer.setData("text/plain", payload("asset", item.id))} onClick={() => flash(`${item.name} · ${item.maintenance} · ${item.washing}`)} className={`${styles.resource} ${styles[item.state]}`}><i>{item.kind === "Macchina" ? "M" : "V"}</i><span><b>{item.name}</b><small>{stateLabel[item.state]} · {item.washing}</small></span><em>{item.state === "blocked" || item.state === "workshop" ? "×" : "⠿"}</em></button>) : null}
            {phase === "people" ? filteredPeople.map((name) => {
              const safety = safetyCheck(name, selected.site);
              return <button key={name} draggable={safety.level !== "red"} onDragStart={(event) => event.dataTransfer.setData("text/plain", payload("person", name))} onClick={() => flash(safety.level === "red" ? `${name} · ${safety.missing.join(", ")}` : `${name} · Safety Passport ${safety.level === "yellow" ? "con avvisi" : "conforme"}`)} className={`${styles.resource} ${styles[safety.level]}`}><i>U</i><span><b>{name}</b><small>{safety.level === "red" ? "NON ASSEGNABILE" : safety.level === "yellow" ? "SCADENZA VICINA" : "DPI E FORMAZIONE OK"}</small></span><em>{safety.level === "red" ? "×" : "⠿"}</em></button>;
            }) : null}
          </div>
          <div className={styles.dropBack}>↩ Trascina qui per rimuovere</div>
        </aside>

        <section className={styles.calendarWrap}>
          <header className={styles.calendarHead}><div><button type="button" aria-label="Mese precedente">‹</button><strong>SETTEMBRE 2026</strong><button type="button" aria-label="Mese successivo">›</button></div><span>Calendario condiviso · preparazione → mezzi → uomini</span></header>
          <div className={styles.weekHead}>{weekDays.map((day) => <b key={day}>{day}</b>)}</div>
          <div className={styles.calendar}>
            {blanks.map((_, index) => <div className={styles.blank} key={`blank-${index}`} />)}
            {days.map((day) => <div key={day} className={`${styles.day} ${(day + 1) % 7 > 5 || (day + 1) % 7 === 0 ? styles.weekend : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
              event.preventDefault();
              const parsed = parsePayload(event.dataTransfer.getData("text/plain"));
              if (parsed?.kind === "prep") movePreparation(parsed.value, day);
            }}><span className={styles.dayNumber}>{day}</span><div className={styles.cards}>{preparations.filter((item) => item.date === day).map((item) => {
              const itemAssets = item.assets.map((id) => assets.find((asset) => asset.id === id)).filter(Boolean) as Asset[];
              const technicalBlock = itemAssets.some((asset) => asset.state === "blocked" || asset.state === "workshop");
              const peopleBlock = item.people.some((name) => safetyCheck(name, item.site).level === "red");
              return <article key={item.id} tabIndex={0} onClick={() => setSelectedId(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropOnPreparation(event, item.id)} className={`${styles.job} ${selectedId === item.id ? styles.selected : ""} ${technicalBlock || peopleBlock ? styles.jobBlocked : ""}`}>
                <div draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData("text/plain", payload("prep", item.id)); }}><b>{item.time}</b><small>⠿ {item.service}</small></div>
                <strong>{item.site}</strong>
                <span>{item.assets.length} mezzi/macchine · {item.people.length} uomini</span>
                {item.assets.map((id) => { const asset = assets.find((entry) => entry.id === id); return asset ? <small key={id} draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData("text/plain", payload("asset", id, item.id)); }}>M/V · {asset.name} ↩</small> : null; })}
                {item.people.map((name) => <small key={name} draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData("text/plain", payload("person", name, item.id)); }}>U · {name} ↩</small>)}
              </article>;
            })}</div></div>)}
          </div>
        </section>

        <aside className={styles.inspector}>
          <header><small>SCHEDA OPERATIVA</small><b>{selected.site}</b><span>{selected.customer} · {selected.service}</span></header>
          <section className={styles.readiness}>
            <b>{blockedAssets.length || blockedPeople.length ? "⛔ PREPARAZIONE BLOCCATA" : selected.assets.length && (selected.people.length || selected.service.includes("freddo")) ? "✓ CANTIERE PRONTO" : "△ DATI DA COMPLETARE"}</b>
            <span>{blockedAssets.length ? `${blockedAssets.length} mezzo/macchina non conforme` : blockedPeople.length ? `${blockedPeople.length} persona non conforme` : "Controlli tecnici e sicurezza collegati"}</span>
          </section>

          <section className={styles.detailSection}><div className={styles.sectionTitle}><b>1 · Preparazione</b><span>{selected.checklist.filter((item) => checks[`${selected.id}-${item}`]).length}/{selected.checklist.length}</span></div>{selected.checklist.map((item) => <button key={item} onClick={() => setChecks((current) => ({ ...current, [`${selected.id}-${item}`]: !current[`${selected.id}-${item}`] }))} className={checks[`${selected.id}-${item}`] ? styles.checked : ""}><i>{checks[`${selected.id}-${item}`] ? "✓" : ""}</i>{item}</button>)}</section>

          <section className={styles.detailSection}><div className={styles.sectionTitle}><b>2 · Mezzi, officina e ricambi</b><span>{assignedAssets.length}</span></div>{assignedAssets.length ? assignedAssets.map((asset) => <article className={`${styles.assetCard} ${styles[asset.state]}`} key={asset.id}><b>{asset.name}</b><span>{asset.counter} · {asset.location}</span><small>Manutenzione: {asset.maintenance}</small><small>Revisione/certificati: {asset.certificate}</small><small className={styles.washing}>Lavaggio: {asset.washing}</small><small>Ricambi: {asset.parts}</small></article>) : <p>Trascina qui una macchina o un mezzo.</p>}</section>

          <section className={styles.detailSection}><div className={styles.sectionTitle}><b>3 · Uomini</b><span>{selected.people.length}</span></div>{selected.people.length ? selected.people.map((name) => { const safety = safetyCheck(name, selected.site); return <article className={`${styles.personCard} ${styles[safety.level]}`} key={name}><b>{name}</b><span>{safety.level === "green" ? "DPI e formazione conformi" : safety.level === "yellow" ? `Avviso: ${safety.warnings.join(", ")}` : `Blocco: ${safety.missing.join(", ")}`}</span></article>; }) : <p>Nessun uomo Dalecom assegnato.</p>}</section>

          <details className={styles.maintenance}><summary>Scheda manutenzione e collaudo</summary><div><b>Controlli dalla scheda Dalecom</b>{maintenanceChecklist.map((item) => <label key={item}><input type="checkbox" />{item}<select defaultValue=""><option value="">Esito</option><option>OK</option><option>NON OK</option><option>SISTEMATO</option></select></label>)}<small>Firma tecnico e verifica responsabile alla chiusura.</small></div></details>
        </aside>
      </section>

      <footer className={styles.footer}><b>DALECOM · CENTRALE TECNICA</b><span>Le scadenze obbligatorie bloccano l’assegnazione. Le scadenze vicine generano un avviso.</span><small>Dati dimostrativi · fonte prevista 1C</small></footer>
    </main>
  );
}
