"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import palette from "./palette.module.css";
import flowStyles from "./workflow.module.css";
import theme from "./dalecom-theme.module.css";
import safetyStyles from "./safety.module.css";
import { employeeNames, safetyCheck } from "../safety-data";

type Assignment = {
  id: string;
  date: number | null;
  month: number | null;
  service: "cold" | "semi" | "hot";
  site: string;
  machine: string;
  vehicle: string;
  people: string[];
  start: string;
  note: string;
};

type ResourceType = "site" | "machine" | "vehicle" | "person";
type Resource = { value: string; status?: "available" | "busy" | "service"; note?: string };
type CalendarView = "month" | "week" | "day";
type CalendarCell = { day: number; month: number } | null;

const machineResources: Resource[] = [
  { value: "PCA BM30 #116 · Padernello", status: "available" },
  { value: "PCA TB30 #160 · Padernello", status: "available" },
  { value: "PCA TB30 #174 · Padernello", status: "available" },
  { value: "PCA TB30 #205 · Padernello", status: "available" },
  { value: "PCA TB30 #222 · Bareggio", status: "available" },
  { value: "PCA TB30 #280 · Bareggio", status: "available" },
  { value: "PCA TB30 #432 · Bareggio", status: "busy", note: "Prenotata per getti Milano" },
  { value: "PCA BSA 1409 #322 · Bareggio", status: "available" },
  { value: "PCA BSA 2110 #189 · Bareggio", status: "available", note: "Riparata / pronta" },
  { value: "PCA Liebherr #177 · Padernello", status: "available" },
  { value: "Pompa a vite T20X #289 · Padernello", status: "available" },
  { value: "Braccio TSR7 #291 · Padernello", status: "available", note: "Pronto" },
  { value: "Braccio MX36 #183 · Padernello", status: "available", note: "Pronto" },
  { value: "Braccio MX36 #297 · Padernello", status: "available", note: "Pronto" },
  { value: "ATLAS XAVS186 #271 · Padernello", status: "service", note: "Funzionante · cofano da sistemare" },
  { value: "CityPump · squadra Modena", status: "busy" },
];
const vehicleResources: Resource[] = [
  { value: "Eurocargo · trasporto", status: "available" }, { value: "CityPump · mezzo integrato", status: "busy" },
  { value: "HE008HW · Roma", status: "busy" }, { value: "Furgone logistica · Padernello", status: "available" },
  { value: "GC589XY · furgone", status: "available" }, { value: "FW903KV · autocarro", status: "available" },
  { value: "Mezzo da assegnare", status: "service", note: "Scelta necessaria" },
];
const peopleResources: Resource[] = employeeNames.map((value) => {
  const safety = safetyCheck(value);
  const onLeave = ["Naoussi Carlo", "Cani Tonin", "Buonaiuto Paco", "Verejan Radu", "Berdaga Maxim", "Berdaga Mihail", "Ibrahima Ndiaye"].includes(value);
  if (safety.level === "red") return { value, status: "service", note: `SICUREZZA · ${safety.missing.join(", ")}` };
  if (onLeave) return { value, status: "busy", note: "Ferie nel programma corrente" };
  return { value, status: "available", note: safety.level === "yellow" ? `ATTENZIONE · ${safety.warnings.join(", ")}` : "Safety Passport conforme" };
});
const siteResources: Resource[] = ["Varna", "Roma · ColaBeton", "Modena · Vera Costruzioni", "Trieste · Piccola Sicilia", "Vicenza · EdilDesign", "Cittadella", "Bologna · SEAF", "Mantova", "Marghera", "Val d’Ultimo", "Padernello · Capannone", "Venezia · Boscolo"].map((value) => ({ value, status: "available" }));
const machines = machineResources.map((item) => item.value);
const vehicles = vehicleResources.map((item) => item.value);
const people = peopleResources.map((item) => item.value);
const sites = siteResources.map((item) => item.value);

const initialAssignments: Assignment[] = [
  { id: "JOB-260824-A", date: 24, month: 8, service: "hot", site: sites[0], machine: machines[10], vehicle: vehicles[3], people: ["Marconato Ermens", "Buonaiuto Paco", "Sow Moustapha", "Verejan Radu"], start: "06:30", note: "Squadra Varna · programma cantieri" },
  { id: "JOB-260824-B", date: 24, month: 8, service: "hot", site: sites[1], machine: machines[4], vehicle: vehicles[2], people: ["Toscano Enrico", "Mihali Daniel", "Stecho Dorel"], start: "07:00", note: "ColaBeton · permanenza settimanale" },
  { id: "JOB-260826", date: 26, month: 8, service: "hot", site: sites[2], machine: machines[15], vehicle: vehicles[1], people: ["Kaci Ilirjan", "Garbin Thomas", "Mesfef Mohammed"], start: "09:00", note: "CityPump · 80 m + 180 m²" },
  { id: "JOB-260827", date: 27, month: 8, service: "semi", site: sites[3], machine: machines[4], vehicle: vehicles[0], people: ["Loriato Flavio"], start: "05:15", note: "Partenza da Padernello con Eurocargo" },
  { id: "JOB-260828-A", date: 28, month: 8, service: "hot", site: sites[4], machine: machines[15], vehicle: vehicles[1], people: ["Kaci Ilirjan", "Garbin Thomas", "Mesfef Mohammed"], start: "07:00", note: "CityPump · getto programmato" },
  { id: "JOB-260828-B", date: 28, month: 8, service: "cold", site: sites[5], machine: machines[12], vehicle: vehicles[6], people: [], start: "07:00", note: "Noleggio a freddo · nessun uomo Dalecom" },
  { id: "JOB-QUEUE-1", date: null, month: null, service: "hot", site: sites[6], machine: machines[15], vehicle: vehicles[1], people: ["Berdaga Mihail", "Berdaga Tudor"], start: "07:00", note: "Nota programma: getto da confermare" },
  { id: "JOB-QUEUE-2", date: null, month: null, service: "cold", site: sites[11], machine: machines[6], vehicle: vehicles[6], people: [], start: "06:30", note: "Getto Boscolo · noleggio a freddo" },
];

const weekDays = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];
const calendarMonths = [
  { number: 8, label: "AGOSTO", days: 31, blanks: 5 },
  { number: 9, label: "SETTEMBRE", days: 30, blanks: 1 },
  { number: 10, label: "OTTOBRE", days: 31, blanks: 3 },
] as const;
const monthName = (month: number | null) => calendarMonths.find((item) => item.number === month)?.label.toLocaleLowerCase("it") || "";
const calendarDate = (month: number, day: number) => new Date(2026, month - 1, day, 12);
const mondayIndex = (date: Date) => (date.getDay() + 6) % 7;
const isInsidePlanningRange = (date: Date) => date >= calendarDate(8, 1) && date <= calendarDate(10, 31);

function conflictsFor(assignments: Assignment[]) {
  const conflicts = new Set<string>();
  assignments.filter((item) => item.date !== null).forEach((item, index, dated) => {
    dated.slice(index + 1).forEach((other) => {
      if (item.date !== other.date || item.month !== other.month) return;
      const sharedPerson = item.people.some((person) => other.people.includes(person));
      const sharedMachine = item.machine !== "Macchina da assegnare" && item.machine === other.machine;
      const sharedVehicle = item.vehicle !== "Mezzo da assegnare" && item.vehicle === other.vehicle;
      if (sharedMachine || sharedVehicle || sharedPerson) {
        conflicts.add(item.id);
        conflicts.add(other.id);
      }
    });
  });
  return conflicts;
}

function resourcePayload(type: ResourceType, value: string) {
  return `resource|${type}|${encodeURIComponent(value)}`;
}

function calendarResourcePayload(id: string, type: ResourceType, value: string) {
  return `calendar|${encodeURIComponent(id)}|${type}|${encodeURIComponent(value)}`;
}

function readPayload(raw: string) {
  if (raw.startsWith("assignment|")) return { kind: "assignment" as const, id: raw.slice(11) };
  const [kind, type, encoded] = raw.split("|");
  if (kind === "resource" && encoded && ["site", "machine", "vehicle", "person"].includes(type)) {
    return { kind: "resource" as const, type: type as ResourceType, value: decodeURIComponent(encoded) };
  }
  if (kind === "calendar") {
    const [, encodedId, calendarType, encodedValue] = raw.split("|");
    if (encodedId && encodedValue && ["site", "machine", "vehicle", "person"].includes(calendarType)) {
      return { kind: "calendar" as const, id: decodeURIComponent(encodedId), type: calendarType as ResourceType, value: decodeURIComponent(encodedValue) };
    }
  }
  return null;
}

function ResourceItem({ type, item }: { type: ResourceType; item: Resource }) {
  const label = { site: "C", machine: "M", vehicle: "V", person: "U" }[type];
  return <button
    type="button"
    draggable={item.status !== "service"}
    onDragStart={(event) => event.dataTransfer.setData("text/plain", resourcePayload(type, item.value))}
    className={`${palette.resourceItem} ${item.status === "busy" ? palette.resourceBusy : ""} ${item.status === "service" ? palette.resourceService : ""}`}
    title={item.note || "Trascina sul calendario o su una commessa"}
  ><i>{label}</i><span><b>{item.value}</b><small>{item.note || (item.status === "busy" ? "Già impegnato · trascinabile" : item.status === "service" ? "Non trascinabile" : "Disponibile")}</small></span><em>⠿</em></button>;
}

function JobCard({ item, selected, conflict, onSelect, onResourceDrop }: { item: Assignment; selected: boolean; conflict: boolean; onSelect: () => void; onResourceDrop: (type: ResourceType, value: string) => void }) {
  const modeLabel = { cold: "A FREDDO", semi: "SEMIFREDDO", hot: "A CALDO" }[item.service];
  const safetyBlocked = item.people.filter((person) => safetyCheck(person, item.site).level === "red");
  const safetyWarning = item.people.filter((person) => safetyCheck(person, item.site).level === "yellow");
  const draggableRow = (type: ResourceType, value: string, label: string) => <small
    className={flowStyles.calendarResource}
    draggable={value !== "Macchina da assegnare" && value !== "Mezzo da assegnare"}
    onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData("text/plain", calendarResourcePayload(item.id, type, value)); }}
  ><b>{label}</b>{value}<em>↩</em></small>;
  return <article
    onDragOver={(event) => event.preventDefault()}
    onDrop={(event) => {
      event.preventDefault();
      event.stopPropagation();
      const payload = readPayload(event.dataTransfer.getData("text/plain"));
      if (payload?.kind === "resource") onResourceDrop(payload.type, payload.value);
    }}
    onClick={onSelect}
    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(); }}
    className={`${styles.job} ${theme.job} ${selected ? styles.selected : ""} ${conflict ? styles.conflict : ""}`}
    aria-label={`${item.site}, trascina per ripianificare`}
    role="button"
    tabIndex={0}
  >
    <span className={`${styles.jobTime} ${flowStyles.cardHead}`} draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData("text/plain", `assignment|${item.id}`); }}><span>{item.start}<i className={flowStyles.dragHandle}>⠿</i></span><i>{conflict ? "CONFLITTO" : modeLabel}</i></span>
    {draggableRow("site", item.site, "C")}
    {draggableRow("machine", item.machine, "M")}
    {draggableRow("vehicle", item.vehicle, "V")}
    {item.service === "cold" ? <small className={flowStyles.coldRow}><b>U</b>Nessun uomo · noleggio a freddo</small> : item.people.map((person) => <span key={person}>{draggableRow("person", person, "U")}</span>)}
    {safetyBlocked.length ? <small className={safetyStyles.safetyBlock}>⛔ SICUREZZA · {safetyBlocked.join(", ")}</small> : safetyWarning.length ? <small className={safetyStyles.safetyWarning}>⚠ SCADENZE · {safetyWarning.join(", ")}</small> : null}
  </article>;
}

export default function LogisticsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [selectedId, setSelectedId] = useState(initialAssignments[0].id);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState<"sites" | "assets" | "people">("sites");
  const [notice, setNotice] = useState("");
  const [currentMonth, setCurrentMonth] = useState(8);
  const [focusDay, setFocusDay] = useState(24);
  const [calendarView, setCalendarView] = useState<CalendarView>("month");

  useEffect(() => {
    const stored = window.localStorage.getItem("dalecom-logistics-demo-v3");
    if (stored) {
      try {
        const restored = (JSON.parse(stored) as Assignment[]).map((item) => ({ ...item, month: item.date && !item.month ? 8 : item.month }));
        const frame = window.requestAnimationFrame(() => setAssignments(restored));
        return () => window.cancelAnimationFrame(frame);
      } catch { /* demo fallback */ }
    }
  }, []);

  const conflicts = useMemo(() => conflictsFor(assignments), [assignments]);
  const selected = assignments.find((item) => item.id === selectedId) || assignments[0];
  const selectedUnavailable = machineResources.some((item) => item.value === selected.machine && item.status === "service") || vehicleResources.some((item) => item.value === selected.vehicle && item.status === "service");
  const selectedIncomplete = selected.machine === "Macchina da assegnare" || selected.vehicle === "Mezzo da assegnare" || (selected.service !== "cold" && selected.people.length === 0);
  const selectedSafetyBlocks = selected.people.flatMap((person) => safetyCheck(person, selected.site).level === "red" ? [person] : []);
  const scheduled = assignments.filter((item) => item.date !== null).length;
  const queue = assignments.filter((item) => item.date === null);
  const busyPeople = new Set(assignments.filter((item) => item.date !== null).flatMap((item) => item.people)).size;

  const move = (id: string, date: number | null, month: number | null = date ? currentMonth : null) => {
    setAssignments((current) => current.map((item) => item.id === id ? { ...item, date, month } : item));
    setSelectedId(id);
    setSaved(false);
  };

  const updateSelected = (patch: Partial<Assignment>) => {
    setAssignments((current) => current.map((item) => item.id === selected.id ? { ...item, ...patch } : item));
    setSaved(false);
  };

  const recordSafetyAlert = (person: string, site: string, level: "red" | "yellow", detail: string) => {
    const key = "dalecom-safety-alerts-v1";
    let existing: { id: string; person: string; site: string; level: "red" | "yellow"; detail: string; createdAt: string }[] = [];
    try { existing = JSON.parse(window.localStorage.getItem(key) || "[]"); } catch { existing = []; }
    const next = [{ id: `ALT-${Date.now()}`, person, site, level, detail, createdAt: new Date().toISOString() }, ...existing].slice(0, 12);
    window.localStorage.setItem(key, JSON.stringify(next));
  };

  const assignResource = (id: string, type: ResourceType, value: string) => {
    const target = assignments.find((item) => item.id === id);
    if (type === "person" && target?.service === "cold") {
      setNotice("Noleggio a freddo: non è previsto personale Dalecom.");
      window.setTimeout(() => setNotice(""), 2600);
      return;
    }
    if (type === "person" && target) {
      const safety = safetyCheck(value, target.site);
      if (safety.level === "red") {
        recordSafetyAlert(value, target.site, "red", safety.missing.join(", "));
        setNotice(`⛔ ASSEGNAZIONE BLOCCATA · ${value}: ${safety.missing.join(", ")}. Alert inviato a HSE e CEO.`);
        window.setTimeout(() => setNotice(""), 5200);
        return;
      }
      if (safety.level === "yellow") {
        recordSafetyAlert(value, target.site, "yellow", safety.warnings.join(", "));
        setNotice(`⚠ ${value} assegnato con attenzione: ${safety.warnings.join(", ")}. HSE e CEO ricevono l’alert.`);
        window.setTimeout(() => setNotice(""), 4200);
      }
    }
    setAssignments((current) => current.map((item) => {
      if (item.id !== id) return item;
      if (type === "person") return { ...item, people: item.people.includes(value) ? item.people : [...item.people, value] };
      if (type === "site") return { ...item, site: value };
      if (type === "machine") return { ...item, machine: value };
      return { ...item, vehicle: value };
    }));
    setSelectedId(id);
    setSaved(false);
  };

  const setPersonSlot = (index: number, value: string) => {
    if (!value) {
      updateSelected({ people: selected.people.filter((_, current) => current !== index) });
      return;
    }
    const safety = safetyCheck(value, selected.site);
    if (safety.level === "red") {
      recordSafetyAlert(value, selected.site, "red", safety.missing.join(", "));
      setNotice(`⛔ ASSEGNAZIONE BLOCCATA · ${value}: ${safety.missing.join(", ")}. Alert inviato a HSE e CEO.`);
      window.setTimeout(() => setNotice(""), 5200);
      return;
    }
    const next = [...selected.people];
    next[index] = value;
    updateSelected({ people: next.filter(Boolean) });
    if (safety.level === "yellow") {
      recordSafetyAlert(value, selected.site, "yellow", safety.warnings.join(", "));
      setNotice(`⚠ ${value} assegnato con scadenze da verificare. Alert inviato a HSE e CEO.`);
      window.setTimeout(() => setNotice(""), 4200);
    }
  };

  const returnToPool = (raw: string, targetType: ResourceType) => {
    const payload = readPayload(raw);
    if (payload?.kind !== "calendar" || payload.type !== targetType) return;
    if (targetType === "site") {
      move(payload.id, null);
      setNotice("Cantiere rimosso dal calendario e riportato tra quelli da pianificare.");
    } else {
      setAssignments((current) => current.map((item) => {
        if (item.id !== payload.id) return item;
        if (targetType === "machine") return { ...item, machine: "Macchina da assegnare" };
        if (targetType === "vehicle") return { ...item, vehicle: "Mezzo da assegnare" };
        return { ...item, people: item.people.filter((person) => person !== payload.value) };
      }));
      setSelectedId(payload.id);
      setSaved(false);
      setNotice(`${payload.value} è tornato disponibile nella colonna.`);
    }
    window.setTimeout(() => setNotice(""), 2600);
  };

  const dropOnDay = (raw: string, date: number, month: number) => {
    const payload = readPayload(raw);
    if (!payload) return;
    if (payload.kind === "assignment") {
      move(payload.id, date, month);
      return;
    }
    if (payload.kind !== "resource" || payload.type !== "site") {
      setNotice("Prima trascina un cantiere sul giorno; poi assegna mezzi e uomini alla sua scheda.");
      window.setTimeout(() => setNotice(""), 2800);
      return;
    }
    const id = `JOB-DRAFT-${month}${String(date).padStart(2, "0")}-${assignments.length + 1}`;
    const draft: Assignment = {
      id,
      date,
      month,
      service: "hot",
      site: payload.value,
      machine: "Macchina da assegnare",
      vehicle: "Mezzo da assegnare",
      people: [],
      start: "07:00",
      note: "Nuova commessa creata dal calendario",
    };
    setAssignments((current) => [...current, draft]);
    setSelectedId(id);
    setSaved(false);
  };

  const save = () => {
    window.localStorage.setItem("dalecom-logistics-demo-v3", JSON.stringify(assignments));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const activeMonth = calendarMonths.find((item) => item.number === currentMonth) || calendarMonths[0];
  const focusDate = calendarDate(currentMonth, Math.min(focusDay, activeMonth.days));
  const monthCells: CalendarCell[] = Array.from({ length: activeMonth.blanks + activeMonth.days }, (_, index) => index < activeMonth.blanks ? null : { day: index - activeMonth.blanks + 1, month: currentMonth });
  const weekStart = new Date(focusDate);
  weekStart.setDate(focusDate.getDate() - mondayIndex(focusDate));
  const weekCells: CalendarCell[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return isInsidePlanningRange(date) ? { day: date.getDate(), month: date.getMonth() + 1 } : null;
  });
  const calendarCells = calendarView === "month" ? monthCells : calendarView === "week" ? weekCells : [{ day: focusDate.getDate(), month: focusDate.getMonth() + 1 }];
  const visibleWeekDays = calendarView === "day" ? [weekDays[mondayIndex(focusDate)]] : weekDays;
  const toolbarLabel = calendarView === "month"
    ? `${activeMonth.label} 2026`
    : calendarView === "day"
      ? `${focusDate.getDate()} ${monthName(focusDate.getMonth() + 1).toLocaleUpperCase("it")} 2026`
      : `${weekCells.find(Boolean)?.day || ""} ${monthName(weekCells.find(Boolean)?.month || currentMonth)} — ${[...weekCells].reverse().find(Boolean)?.day || ""} ${monthName([...weekCells].reverse().find(Boolean)?.month || currentMonth)} 2026`.toLocaleUpperCase("it");
  const changeMonth = (direction: -1 | 1) => {
    const index = calendarMonths.findIndex((item) => item.number === currentMonth);
    const next = calendarMonths[index + direction];
    if (next) {
      setCurrentMonth(next.number);
      setFocusDay(1);
    }
  };
  const moveFocus = (direction: -1 | 1) => {
    if (calendarView === "month") return changeMonth(direction);
    const next = new Date(focusDate);
    next.setDate(focusDate.getDate() + direction * (calendarView === "week" ? 7 : 1));
    if (!isInsidePlanningRange(next)) return;
    setCurrentMonth(next.getMonth() + 1);
    setFocusDay(next.getDate());
  };
  const previousDisabled = calendarView === "month" ? currentMonth === 8 : (calendarView === "day" ? focusDate <= calendarDate(8, 1) : weekStart <= calendarDate(8, 1));
  const nextDisabled = calendarView === "month" ? currentMonth === 10 : (calendarView === "day" ? focusDate >= calendarDate(10, 31) : (weekCells.filter(Boolean).at(-1)?.month === 10 && weekCells.filter(Boolean).at(-1)?.day === 31));
  const resourceGroups: { type: ResourceType; label: string; items: Resource[] }[] = phase === "sites"
    ? [{ type: "site", label: "Cantieri", items: siteResources }]
    : phase === "assets"
      ? [{ type: "machine", label: "Macchine", items: machineResources }, { type: "vehicle", label: "Mezzi", items: vehicleResources }]
      : [{ type: "person", label: "Uomini", items: peopleResources }];
  const query = search.trim().toLocaleLowerCase("it");

  return <main className={`${styles.page} ${theme.page}`}>
    <header className={`${styles.top} ${theme.top}`}>
      <div className={`${styles.brand} ${theme.brand}`}><i /><b>DALECOM</b><span>LOGISTA</span></div>
      <nav><a href="/demo">← Regia principale</a><a href="/sicurezza">Safety Passport</a><button onClick={save}>{saved ? "✓ Piano salvato" : "Salva pianificazione"}</button></nav>
    </header>

    <section className={`${styles.hero} ${theme.hero}`}>
      <div><small>REGIA LOGISTICA · CALENDARIO OPERATIVO</small><h1>Quattro risorse.<br /><em>Un solo calendario.</em></h1><p>Lavora per mese, settimana o giornata. Macchina, mezzo, uomini e cantiere restano collegati; le sovrapposizioni vengono segnalate subito.</p></div>
      <div className={`${styles.legend} ${theme.legend}`}><span><i className={styles.okDot} />Disponibile</span><span><i className={styles.warnDot} />Conflitto risorse</span><b>Agosto — ottobre 2026</b></div>
    </section>

    <section className={`${styles.kpis} ${theme.kpis}`}>
      <article><small>COMMESSE PIANIFICATE</small><b>{scheduled}</b><span>nel periodo</span></article>
      <article><small>DA COLLOCARE</small><b>{queue.length}</b><span>richieste in attesa</span></article>
      <article><small>PERSONE IMPEGNATE</small><b>{busyPeople}</b><span>su {people.length} disponibili</span></article>
      <article className={conflicts.size ? styles.alertKpi : ""}><small>CONFLITTI APERTI</small><b>{conflicts.size}</b><span>{conflicts.size ? "da risolvere" : "piano coerente"}</span></article>
    </section>
    {notice ? <div className={flowStyles.notice} role="status">{notice}</div> : null}

    <section className={`${styles.workspace} ${palette.workspace} ${theme.workspace}`}>
      <aside className={`${styles.queue} ${palette.bank} ${theme.panel}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
        const payload = readPayload(event.dataTransfer.getData("text/plain"));
        if (payload?.kind === "assignment") move(payload.id, null);
      }}>
        <header><small>MAGAZZINO OPERATIVO</small><b>Tutto ciò che puoi assegnare</b><span>Trascina sul giorno o sulla scheda</span></header>
        <div className={palette.search}><span>⌕</span><input aria-label="Cerca risorsa" placeholder="Cerca tutto…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className={flowStyles.steps} aria-label="Sequenza di pianificazione"><button className={phase === "sites" ? flowStyles.activeStep : ""} onClick={() => setPhase("sites")}><i>1</i>Cantieri</button><button className={phase === "assets" ? flowStyles.activeStep : ""} onClick={() => setPhase("assets")}><i>2</i>Mezzi</button><button className={phase === "people" ? flowStyles.activeStep : ""} onClick={() => setPhase("people")}><i>3</i>Uomini</button></div>
        {phase === "sites" ? <section className={palette.waiting}><div className={palette.groupTitle}><b>Cantieri da pianificare</b><span>{queue.length}</span></div><div className={styles.queueList}>{queue.map((item) => <JobCard key={item.id} item={item} selected={selected.id === item.id} conflict={false} onSelect={() => setSelectedId(item.id)} onResourceDrop={(type, value) => assignResource(item.id, type, value)} />)}</div></section> : null}
        {phase === "people" && selected.service === "cold" ? <div className={flowStyles.coldNotice}><b>Noleggio a freddo</b><span>Per la commessa selezionata non devi assegnare uomini.</span></div> : null}
        <div className={palette.resourceSections}>{resourceGroups.map((group) => {
          const visible = group.items.filter((item) => !query || `${item.value} ${item.note || ""}`.toLocaleLowerCase("it").includes(query));
          return <section className={palette.resourceGroup} key={group.type} onDragOver={(event) => event.preventDefault()} onDrop={(event) => returnToPool(event.dataTransfer.getData("text/plain"), group.type)}><div className={palette.groupTitle}><b>{group.label}</b><span>{visible.length}</span></div><div className={flowStyles.dropHint}>↩ Trascina qui dal calendario per liberare la risorsa</div><div>{visible.map((item) => <ResourceItem type={group.type} item={item} key={item.value} />)}</div></section>;
        })}</div>
      </aside>

      <section className={`${styles.calendarWrap} ${theme.panel}`}>
        <div className={theme.monthTabs}>{calendarMonths.map((month) => <button key={month.number} className={currentMonth === month.number ? theme.activeMonth : ""} onClick={() => { setCurrentMonth(month.number); setFocusDay(1); }}>{month.label}<small>2026</small></button>)}</div>
        <div className={theme.viewBar}><span>VISTA CALENDARIO</span><div>{(["month", "week", "day"] as CalendarView[]).map((view) => <button key={view} className={calendarView === view ? theme.activeView : ""} onClick={() => setCalendarView(view)}>{{ month: "Mensile", week: "Settimanale", day: "Giornaliera" }[view]}</button>)}</div></div>
        <div className={`${styles.calendarToolbar} ${theme.calendarToolbar}`}><div><button aria-label="Periodo precedente" disabled={previousDisabled} onClick={() => moveFocus(-1)}>‹</button><strong>{toolbarLabel}</strong><button aria-label="Periodo successivo" disabled={nextDisabled} onClick={() => moveFocus(1)}>›</button></div><span>Trascina cantieri e risorse per pianificare</span></div>
        <div className={`${styles.weekHeader} ${theme.weekHeader} ${calendarView === "day" ? theme.oneColumn : ""}`}>{visibleWeekDays.map((day) => <b key={day}>{day}</b>)}</div>
        <div className={`${styles.calendar} ${calendarView === "week" ? theme.weekCalendar : ""} ${calendarView === "day" ? theme.dayCalendar : ""}`}>
          {calendarCells.map((cell, index) => cell === null ? <div className={styles.blank} key={`blank-${index}`} /> : <div
            className={`${styles.day} ${theme.day} ${mondayIndex(calendarDate(cell.month, cell.day)) > 4 ? styles.weekend : ""}`}
            key={`${cell.month}-${cell.day}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => dropOnDay(event.dataTransfer.getData("text/plain"), cell.day, cell.month)}
          >
            <button className={`${styles.dayNumber} ${theme.dayNumber}`} onClick={() => { setCurrentMonth(cell.month); setFocusDay(cell.day); }} aria-label={`Seleziona ${cell.day} ${monthName(cell.month)}`}>{cell.day}<small>{calendarView !== "month" ? monthName(cell.month).slice(0, 3) : ""}</small></button>
            <div className={styles.dayJobs}>{assignments.filter((item) => item.date === cell.day && item.month === cell.month).map((item) => <JobCard key={item.id} item={item} selected={selected.id === item.id} conflict={conflicts.has(item.id)} onSelect={() => setSelectedId(item.id)} onResourceDrop={(type, value) => assignResource(item.id, type, value)} />)}</div>
          </div>)}
        </div>
      </section>

      <aside className={`${styles.inspector} ${theme.panel}`}>
        <header><small>DETTAGLIO COMMESSA</small><b>{selected.id}</b><span>{selected.date ? `${selected.date} ${monthName(selected.month)} 2026` : "Non pianificata"}</span></header>
        <label><span>Formula di noleggio</span><select value={selected.service} onChange={(event) => { const service = event.target.value as Assignment["service"]; updateSelected({ service, people: service === "cold" ? [] : selected.people }); }}><option value="cold">A freddo · nessun uomo</option><option value="semi">Semifreddo</option><option value="hot">A caldo</option></select></label>
        <label><span><i>C</i>Cantiere</span><select value={selected.site} onChange={(event) => updateSelected({ site: event.target.value })}>{sites.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span><i>M</i>Macchina</span><select value={selected.machine} onChange={(event) => updateSelected({ machine: event.target.value })}><option>Macchina da assegnare</option>{machineResources.map((item) => <option key={item.value} value={item.value} disabled={item.status === "service"}>{item.value}{item.status === "service" ? " · NON DISPONIBILE" : ""}</option>)}</select></label>
        <label><span><i>V</i>Mezzo</span><select value={selected.vehicle} onChange={(event) => updateSelected({ vehicle: event.target.value })}><option>Mezzo da assegnare</option>{vehicleResources.filter((item) => item.value !== "Mezzo da assegnare").map((item) => <option key={item.value} value={item.value} disabled={item.status === "service"}>{item.value}{item.status === "service" ? " · DA RISOLVERE" : ""}</option>)}</select></label>
        {selected.service === "cold" ? <div className={flowStyles.noPeople}><b>U · NESSUN UOMO</b><span>Regola automatica del noleggio a freddo.</span></div> : <><label><span><i>U</i>Primo uomo</span><select value={selected.people[0] || ""} onChange={(event) => setPersonSlot(0, event.target.value)}><option value="">Da assegnare</option>{people.map((value) => <option key={value} disabled={safetyCheck(value, selected.site).level === "red"}>{value}{safetyCheck(value, selected.site).level === "red" ? " · BLOCCATO SICUREZZA" : safetyCheck(value, selected.site).level === "yellow" ? " · ATTENZIONE" : ""}</option>)}</select></label><label><span>Secondo uomo</span><select value={selected.people[1] || ""} onChange={(event) => setPersonSlot(1, event.target.value)}><option value="">Non previsto</option>{people.filter((person) => person !== selected.people[0]).map((value) => <option key={value} disabled={safetyCheck(value, selected.site).level === "red"}>{value}{safetyCheck(value, selected.site).level === "red" ? " · BLOCCATO SICUREZZA" : safetyCheck(value, selected.site).level === "yellow" ? " · ATTENZIONE" : ""}</option>)}</select></label></>}
        <div className={styles.detailGrid}><label><span>Inizio</span><input type="time" value={selected.start} onChange={(event) => updateSelected({ start: event.target.value })} /></label><label><span>Giorno</span><input type="number" min="1" max={calendarMonths.find((month) => month.number === (selected.month || currentMonth))?.days || 31} value={selected.date || ""} onChange={(event) => updateSelected({ date: event.target.value ? Number(event.target.value) : null, month: event.target.value ? (selected.month || currentMonth) : null })} /></label></div>
        <label><span>Nota operativa</span><textarea value={selected.note} onChange={(event) => updateSelected({ note: event.target.value })} /></label>
        <div className={`${styles.check} ${conflicts.has(selected.id) || selectedUnavailable || selectedIncomplete || selectedSafetyBlocks.length ? styles.checkError : ""}`}><i>{conflicts.has(selected.id) || selectedUnavailable || selectedIncomplete || selectedSafetyBlocks.length ? "!" : "✓"}</i><div><b>{selectedSafetyBlocks.length ? "Blocco sicurezza attivo" : selectedUnavailable || selectedIncomplete ? "Configurazione incompleta" : conflicts.has(selected.id) ? "Risorsa già impegnata" : "Configurazione disponibile"}</b><span>{selectedSafetyBlocks.length ? `${selectedSafetyBlocks.join(", ")} non possiede tutti i requisiti per ${selected.site}.` : selectedUnavailable || selectedIncomplete ? "Completa macchina, mezzo e — salvo il freddo — la squadra." : conflicts.has(selected.id) ? "Sposta la commessa o sostituisci la risorsa." : "Risorse disponibili e Safety Passport conformi."}</span></div></div>
        <button className={styles.unschedule} onClick={() => move(selected.id, null)}>Rimetti tra le commesse in attesa</button>
      </aside>
    </section>
    <footer className={styles.footer}><span>Demo Dalecom · pianificazione locale dimostrativa</span><b>Predisposto per disponibilità e commesse da 1C</b></footer>
  </main>;
}
