"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Assignment = {
  id: string;
  date: number | null;
  site: string;
  machine: string;
  vehicle: string;
  people: string[];
  start: string;
  note: string;
};

const machines = ["PCA TB30 #222 · Bareggio", "PCA TB30 #432 · Bareggio", "Pompa a vite T20X #289 · Padernello", "CityPump · squadra Modena", "Braccio MX36 #183 · Padernello", "ATLAS XAVS186 #271 · Padernello"];
const vehicles = ["Eurocargo · trasporto", "CityPump · mezzo integrato", "HE008HW · Roma", "Furgone logistica · Padernello", "Mezzo da assegnare"];
const people = ["Miglioranza Cristiano", "Loriato Flavio", "Marconato Ermens", "Mustapha Sow", "Enon Iloghiojie", "Pace Vincenzo", "Garbin Thomas", "Kaci Ilirjan", "Serghei", "Berdaga Tudor", "Berdaga Jacob", "Berdaga Dionise", "Talmaci Andrei", "Basile Bambara", "Mohammed Mestef"];
const sites = ["Varna", "Roma · ColaBeton", "Modena · Vera Costruzioni", "Trieste · Piccola Sicilia", "Vicenza · EdilDesign", "Cittadella", "Bologna · SEAF"];

const initialAssignments: Assignment[] = [
  { id: "JOB-260824-A", date: 24, site: sites[0], machine: machines[2], vehicle: vehicles[3], people: [people[2], people[3], people[4], people[5]], start: "06:30", note: "Squadra Varna · programma cantieri" },
  { id: "JOB-260824-B", date: 24, site: sites[1], machine: machines[0], vehicle: vehicles[2], people: [people[8], people[9], people[10]], start: "07:00", note: "ColaBeton · permanenza settimanale" },
  { id: "JOB-260826", date: 26, site: sites[2], machine: machines[3], vehicle: vehicles[1], people: [people[7], people[13], people[14]], start: "09:00", note: "CityPump · 80 m + 180 m²" },
  { id: "JOB-260827", date: 27, site: sites[3], machine: machines[0], vehicle: vehicles[0], people: [people[1], people[12]], start: "05:15", note: "Partenza da Padernello con Eurocargo" },
  { id: "JOB-260828-A", date: 28, site: sites[4], machine: machines[3], vehicle: vehicles[1], people: [people[7], people[13], people[14]], start: "07:00", note: "CityPump · getto programmato" },
  { id: "JOB-260828-B", date: 28, site: sites[5], machine: machines[4], vehicle: vehicles[4], people: [people[11], people[12]], start: "07:00", note: "Cantiere Cittadella" },
  { id: "JOB-QUEUE-1", date: null, site: sites[6], machine: machines[3], vehicle: vehicles[1], people: [people[7], people[13]], start: "07:00", note: "Nota programma: getto da confermare" },
  { id: "JOB-QUEUE-2", date: null, site: "Venezia · Boscolo", machine: machines[1], vehicle: vehicles[4], people: [people[6], people[11]], start: "06:30", note: "Getto Boscolo · conferma richiesta" },
];

const weekDays = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];
const blanksBeforeMonth = 5;
const monthDays = 31;

function conflictsFor(assignments: Assignment[]) {
  const conflicts = new Set<string>();
  assignments.filter((item) => item.date !== null).forEach((item, index, dated) => {
    dated.slice(index + 1).forEach((other) => {
      if (item.date !== other.date) return;
      const sharedPerson = item.people.some((person) => other.people.includes(person));
      if (item.machine === other.machine || item.vehicle === other.vehicle || sharedPerson) {
        conflicts.add(item.id);
        conflicts.add(other.id);
      }
    });
  });
  return conflicts;
}

function JobCard({ item, selected, conflict, onSelect }: { item: Assignment; selected: boolean; conflict: boolean; onSelect: () => void }) {
  return <button
    type="button"
    draggable
    onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)}
    onClick={onSelect}
    className={`${styles.job} ${selected ? styles.selected : ""} ${conflict ? styles.conflict : ""}`}
    aria-label={`${item.site}, trascina per ripianificare`}
  >
    <span className={styles.jobTime}>{item.start}<i>{conflict ? "CONFLITTO" : item.id.replace("JOB-", "#")}</i></span>
    <strong>{item.site}</strong>
    <small><b>M</b>{item.machine}</small>
    <small><b>V</b>{item.vehicle}</small>
    <small><b>U</b>{item.people.join(" · ")}</small>
  </button>;
}

export default function LogisticsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [selectedId, setSelectedId] = useState(initialAssignments[0].id);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("dalecom-logistics-demo");
    if (stored) {
      try {
        const restored = JSON.parse(stored) as Assignment[];
        const frame = window.requestAnimationFrame(() => setAssignments(restored));
        return () => window.cancelAnimationFrame(frame);
      } catch { /* demo fallback */ }
    }
  }, []);

  const conflicts = useMemo(() => conflictsFor(assignments), [assignments]);
  const selected = assignments.find((item) => item.id === selectedId) || assignments[0];
  const scheduled = assignments.filter((item) => item.date !== null).length;
  const queue = assignments.filter((item) => item.date === null);
  const busyPeople = new Set(assignments.filter((item) => item.date !== null).flatMap((item) => item.people)).size;

  const move = (id: string, date: number | null) => {
    setAssignments((current) => current.map((item) => item.id === id ? { ...item, date } : item));
    setSelectedId(id);
    setSaved(false);
  };

  const updateSelected = (patch: Partial<Assignment>) => {
    setAssignments((current) => current.map((item) => item.id === selected.id ? { ...item, ...patch } : item));
    setSaved(false);
  };

  const save = () => {
    window.localStorage.setItem("dalecom-logistics-demo", JSON.stringify(assignments));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const calendarCells = Array.from({ length: blanksBeforeMonth + monthDays }, (_, index) => index < blanksBeforeMonth ? null : index - blanksBeforeMonth + 1);

  return <main className={styles.page}>
    <header className={styles.top}>
      <div className={styles.brand}><i /><b>DALECOM</b><span>LOGISTA</span></div>
      <nav><a href="/demo">← Regia principale</a><button onClick={save}>{saved ? "✓ Piano salvato" : "Salva pianificazione"}</button></nav>
    </header>

    <section className={styles.hero}>
      <div><small>REGIA LOGISTICA · PIANIFICAZIONE MENSILE</small><h1>Quattro risorse.<br /><em>Un solo calendario.</em></h1><p>Trascina le commesse tra le giornate. Macchina, mezzo, uomini e cantiere restano collegati; le sovrapposizioni vengono segnalate subito.</p></div>
      <div className={styles.legend}><span><i className={styles.okDot} />Disponibile</span><span><i className={styles.warnDot} />Conflitto risorse</span><b>Agosto 2026 · dati Excel</b></div>
    </section>

    <section className={styles.kpis}>
      <article><small>COMMESSE PIANIFICATE</small><b>{scheduled}</b><span>nel mese</span></article>
      <article><small>DA COLLOCARE</small><b>{queue.length}</b><span>richieste in attesa</span></article>
      <article><small>PERSONE IMPEGNATE</small><b>{busyPeople}</b><span>su {people.length} disponibili</span></article>
      <article className={conflicts.size ? styles.alertKpi : ""}><small>CONFLITTI APERTI</small><b>{conflicts.size}</b><span>{conflicts.size ? "da risolvere" : "piano coerente"}</span></article>
    </section>

    <section className={styles.workspace}>
      <aside className={styles.queue} onDragOver={(event) => event.preventDefault()} onDrop={(event) => move(event.dataTransfer.getData("text/plain"), null)}>
        <header><small>IN ATTESA</small><b>Commesse da pianificare</b><span>Trascina sul giorno desiderato</span></header>
        <div className={styles.queueList}>{queue.map((item) => <JobCard key={item.id} item={item} selected={selected.id === item.id} conflict={false} onSelect={() => setSelectedId(item.id)} />)}</div>
        <div className={styles.resourceKey}><b>I 4 elementi</b><span><i>M</i> Macchina</span><span><i>V</i> Mezzo</span><span><i>U</i> Uomo / squadra</span><span><i>C</i> Cantiere</span></div>
      </aside>

      <section className={styles.calendarWrap}>
        <div className={styles.calendarToolbar}><div><button aria-label="Mese precedente">‹</button><strong>AGOSTO 2026</strong><button aria-label="Mese successivo">›</button></div><span>Dati iniziali dai programmi Dalecom · trascina per cambiare data</span></div>
        <div className={styles.weekHeader}>{weekDays.map((day) => <b key={day}>{day}</b>)}</div>
        <div className={styles.calendar}>
          {calendarCells.map((day, index) => day === null ? <div className={styles.blank} key={`blank-${index}`} /> : <div
            className={`${styles.day} ${(index % 7) > 4 ? styles.weekend : ""}`}
            key={day}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => move(event.dataTransfer.getData("text/plain"), day)}
          >
            <span className={styles.dayNumber}>{day}</span>
            <div className={styles.dayJobs}>{assignments.filter((item) => item.date === day).map((item) => <JobCard key={item.id} item={item} selected={selected.id === item.id} conflict={conflicts.has(item.id)} onSelect={() => setSelectedId(item.id)} />)}</div>
          </div>)}
        </div>
      </section>

      <aside className={styles.inspector}>
        <header><small>DETTAGLIO COMMESSA</small><b>{selected.id}</b><span>{selected.date ? `${selected.date} agosto 2026` : "Non pianificata"}</span></header>
        <label><span><i>C</i>Cantiere</span><select value={selected.site} onChange={(event) => updateSelected({ site: event.target.value })}>{[...sites, "Venezia · Boscolo"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span><i>M</i>Macchina</span><select value={selected.machine} onChange={(event) => updateSelected({ machine: event.target.value })}>{machines.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span><i>V</i>Mezzo</span><select value={selected.vehicle} onChange={(event) => updateSelected({ vehicle: event.target.value })}>{vehicles.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span><i>U</i>Squadra</span><select value={selected.people[0]} onChange={(event) => updateSelected({ people: [event.target.value, ...selected.people.slice(1)] })}>{people.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Secondo uomo</span><select value={selected.people[1] || ""} onChange={(event) => updateSelected({ people: event.target.value ? [selected.people[0], event.target.value, ...selected.people.slice(2)] : [selected.people[0]] })}><option value="">Non previsto</option>{people.filter((person) => person !== selected.people[0]).map((value) => <option key={value}>{value}</option>)}</select></label>
        <div className={styles.detailGrid}><label><span>Inizio</span><input type="time" value={selected.start} onChange={(event) => updateSelected({ start: event.target.value })} /></label><label><span>Giorno</span><input type="number" min="1" max="31" value={selected.date || ""} onChange={(event) => updateSelected({ date: event.target.value ? Number(event.target.value) : null })} /></label></div>
        <label><span>Nota operativa</span><textarea value={selected.note} onChange={(event) => updateSelected({ note: event.target.value })} /></label>
        <div className={`${styles.check} ${conflicts.has(selected.id) ? styles.checkError : ""}`}><i>{conflicts.has(selected.id) ? "!" : "✓"}</i><div><b>{conflicts.has(selected.id) ? "Risorsa già impegnata" : "Configurazione disponibile"}</b><span>{conflicts.has(selected.id) ? "Sposta la commessa o sostituisci la risorsa." : "Nessuna sovrapposizione nella giornata selezionata."}</span></div></div>
        <button className={styles.unschedule} onClick={() => move(selected.id, null)}>Rimetti tra le commesse in attesa</button>
      </aside>
    </section>
    <footer className={styles.footer}><span>Demo Dalecom · pianificazione locale dimostrativa</span><b>Predisposto per disponibilità e commesse da 1C</b></footer>
  </main>;
}
