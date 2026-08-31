"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import detailStyles from "./details.module.css";
import historyStyles from "./history.module.css";
import colorStyles from "./color.module.css";

type Employee = { code: string; name: string; type: string; position: string; department: string };
type View = "mensile" | "storico" | "ula";
type PayrollMetric = {
  ordinary: number; overtime: number; permits: number; vacationTaken: number; vacationBalance: number; days: number; saturdays: number;
  tickets: number; travelDays: number; meals: number; allowance: number;
  payslip: number; advance: number; transfer: number; balance: number; thirteenth: number; fourteenth: number;
  months: number; yearlyHours: number; yearlyDays: number; yearlyGross: number; yearlyNet: number;
  status: "ok" | "warning"; note: string; category: string; fte: number;
};
type HistoryMonth = {
  employeeCode: string; month: string; ordinary: number; overtime: number; permits: number; vacationTaken: number; vacationBalance: number; days: number;
  tickets: number; travelDays: number; gross: number; net: number; advance: number; transfer: number;
  allowance: number; thirteenth: number; fourteenth: number;
};
type PriorYear = { employeeCode: string; year: number; months: number; hours: number; days: number; gross: number; net: number };

const fallbackEmployees: Employee[] = [
  { code: "000000001", name: "Amministratore", type: "Other", position: "Operaio", department: "Reparto Principale" },
  { code: "000000002", name: "Rossi Mario", type: "Dipendente", position: "Ruolo da completare", department: "Reparto Principale" },
  { code: "000000003", name: "Verdi Paolo", type: "Dipendente", position: "Ruolo da completare", department: "Reparto Principale" },
];

const demoMetrics: Record<string, PayrollMetric> = {
  "000000001": { ordinary: 168, overtime: 4, permits: 0, vacationTaken: 8, vacationBalance: 112, days: 21, saturdays: 1, tickets: 18, travelDays: 3, meals: 2, allowance: 180, payslip: 2950, advance: 0, transfer: 2950, balance: 0, thirteenth: 246, fourteenth: 246, months: 6, yearlyHours: 1044, yearlyDays: 127, yearlyGross: 21000, yearlyNet: 14750, status: "ok", note: "Presenze, indennità e valori paga coerenti per la simulazione.", category: "IMP", fte: 1 },
  "000000002": { ordinary: 176, overtime: 12, permits: 4, vacationTaken: 16, vacationBalance: 72, days: 21, saturdays: 2, tickets: 20, travelDays: 8, meals: 6, allowance: 265, payslip: 2434, advance: 250, transfer: 2184, balance: 0, thirteenth: 203, fourteenth: 203, months: 6, yearlyHours: 1092, yearlyDays: 127, yearlyGross: 17400, yearlyNet: 14034, status: "ok", note: "Ore, trasferte, ticket e acconto riconciliati. Pacchetto paghe pronto.", category: "OP", fte: 1 },
  "000000003": { ordinary: 168, overtime: 8, permits: 8, vacationTaken: 8, vacationBalance: 64, days: 21, saturdays: 1, tickets: 18, travelDays: 5, meals: 4, allowance: 155, payslip: 2036, advance: 0, transfer: 2036, balance: 0, thirteenth: 170, fourteenth: 170, months: 6, yearlyHours: 1054, yearlyDays: 125, yearlyGross: 14850, yearlyNet: 11926, status: "warning", note: "Una giornata senza cantiere associato: controllo HR richiesto prima della chiusura.", category: "OP", fte: 1 },
};

const history2026: HistoryMonth[] = [
  { employeeCode: "000000001", month: "Gennaio", ordinary: 160, overtime: 4, permits: 0, vacationTaken: 0, vacationBalance: 88, days: 20, tickets: 18, travelDays: 2, gross: 3400, net: 2300, advance: 0, transfer: 2300, allowance: 150, thirteenth: 192, fourteenth: 192 },
  { employeeCode: "000000001", month: "Febbraio", ordinary: 168, overtime: 6, permits: 0, vacationTaken: 0, vacationBalance: 96, days: 21, tickets: 19, travelDays: 2, gross: 3450, net: 2340, advance: 0, transfer: 2340, allowance: 160, thirteenth: 195, fourteenth: 195 },
  { employeeCode: "000000001", month: "Marzo", ordinary: 176, overtime: 4, permits: 0, vacationTaken: 8, vacationBalance: 96, days: 22, tickets: 20, travelDays: 3, gross: 3500, net: 2380, advance: 0, transfer: 2380, allowance: 170, thirteenth: 198, fourteenth: 198 },
  { employeeCode: "000000001", month: "Aprile", ordinary: 168, overtime: 4, permits: 0, vacationTaken: 0, vacationBalance: 104, days: 21, tickets: 18, travelDays: 2, gross: 3500, net: 2400, advance: 0, transfer: 2400, allowance: 165, thirteenth: 200, fourteenth: 200 },
  { employeeCode: "000000001", month: "Maggio", ordinary: 176, overtime: 6, permits: 0, vacationTaken: 0, vacationBalance: 112, days: 22, tickets: 20, travelDays: 4, gross: 3550, net: 2380, advance: 0, transfer: 2380, allowance: 185, thirteenth: 198, fourteenth: 198 },
  { employeeCode: "000000001", month: "Giugno", ordinary: 168, overtime: 4, permits: 0, vacationTaken: 8, vacationBalance: 112, days: 21, tickets: 18, travelDays: 3, gross: 3600, net: 2950, advance: 0, transfer: 2950, allowance: 180, thirteenth: 246, fourteenth: 246 },
  { employeeCode: "000000002", month: "Gennaio", ordinary: 168, overtime: 8, permits: 0, vacationTaken: 0, vacationBalance: 64, days: 21, tickets: 19, travelDays: 6, gross: 2780, net: 2240, advance: 0, transfer: 2240, allowance: 190, thirteenth: 187, fourteenth: 187 },
  { employeeCode: "000000002", month: "Febbraio", ordinary: 160, overtime: 12, permits: 8, vacationTaken: 8, vacationBalance: 64, days: 20, tickets: 18, travelDays: 7, gross: 2820, net: 2280, advance: 250, transfer: 2030, allowance: 215, thirteenth: 190, fourteenth: 190 },
  { employeeCode: "000000002", month: "Marzo", ordinary: 176, overtime: 10, permits: 0, vacationTaken: 0, vacationBalance: 72, days: 22, tickets: 20, travelDays: 8, gross: 2890, net: 2330, advance: 0, transfer: 2330, allowance: 245, thirteenth: 194, fourteenth: 194 },
  { employeeCode: "000000002", month: "Aprile", ordinary: 168, overtime: 14, permits: 4, vacationTaken: 0, vacationBalance: 80, days: 21, tickets: 19, travelDays: 9, gross: 2940, net: 2380, advance: 0, transfer: 2380, allowance: 275, thirteenth: 198, fourteenth: 198 },
  { employeeCode: "000000002", month: "Maggio", ordinary: 176, overtime: 12, permits: 0, vacationTaken: 8, vacationBalance: 80, days: 22, tickets: 20, travelDays: 10, gross: 2950, net: 2370, advance: 0, transfer: 2370, allowance: 295, thirteenth: 198, fourteenth: 198 },
  { employeeCode: "000000002", month: "Giugno", ordinary: 176, overtime: 12, permits: 4, vacationTaken: 16, vacationBalance: 72, days: 21, tickets: 20, travelDays: 8, gross: 3020, net: 2434, advance: 250, transfer: 2184, allowance: 265, thirteenth: 203, fourteenth: 203 },
  { employeeCode: "000000003", month: "Gennaio", ordinary: 168, overtime: 6, permits: 0, vacationTaken: 0, vacationBalance: 48, days: 21, tickets: 18, travelDays: 4, gross: 2380, net: 1900, advance: 0, transfer: 1900, allowance: 135, thirteenth: 158, fourteenth: 158 },
  { employeeCode: "000000003", month: "Febbraio", ordinary: 160, overtime: 8, permits: 8, vacationTaken: 0, vacationBalance: 56, days: 20, tickets: 17, travelDays: 4, gross: 2420, net: 1940, advance: 0, transfer: 1940, allowance: 140, thirteenth: 162, fourteenth: 162 },
  { employeeCode: "000000003", month: "Marzo", ordinary: 176, overtime: 10, permits: 0, vacationTaken: 8, vacationBalance: 56, days: 22, tickets: 20, travelDays: 6, gross: 2490, net: 2000, advance: 150, transfer: 1850, allowance: 170, thirteenth: 167, fourteenth: 167 },
  { employeeCode: "000000003", month: "Aprile", ordinary: 168, overtime: 6, permits: 4, vacationTaken: 0, vacationBalance: 64, days: 20, tickets: 18, travelDays: 5, gross: 2480, net: 1980, advance: 0, transfer: 1980, allowance: 155, thirteenth: 165, fourteenth: 165 },
  { employeeCode: "000000003", month: "Maggio", ordinary: 168, overtime: 8, permits: 0, vacationTaken: 8, vacationBalance: 64, days: 21, tickets: 19, travelDays: 6, gross: 2570, net: 2070, advance: 0, transfer: 2070, allowance: 175, thirteenth: 173, fourteenth: 173 },
  { employeeCode: "000000003", month: "Giugno", ordinary: 168, overtime: 8, permits: 8, vacationTaken: 8, vacationBalance: 64, days: 21, tickets: 18, travelDays: 5, gross: 2510, net: 2036, advance: 0, transfer: 2036, allowance: 155, thirteenth: 170, fourteenth: 170 },
];

const priorYears: PriorYear[] = [
  { employeeCode: "000000001", year: 2021, months: 12, hours: 2016, days: 246, gross: 38600, net: 28640 }, { employeeCode: "000000001", year: 2022, months: 12, hours: 2048, days: 249, gross: 40150, net: 29780 }, { employeeCode: "000000001", year: 2023, months: 12, hours: 2072, days: 252, gross: 42300, net: 31190 }, { employeeCode: "000000001", year: 2024, months: 12, hours: 2094, days: 254, gross: 44750, net: 32940 }, { employeeCode: "000000001", year: 2025, months: 12, hours: 2110, days: 255, gross: 46800, net: 34360 },
  { employeeCode: "000000002", year: 2021, months: 10, hours: 1740, days: 211, gross: 25500, net: 20420 }, { employeeCode: "000000002", year: 2022, months: 12, hours: 2112, days: 252, gross: 31500, net: 25180 }, { employeeCode: "000000002", year: 2023, months: 12, hours: 2175, days: 257, gross: 33700, net: 26740 }, { employeeCode: "000000002", year: 2024, months: 12, hours: 2208, days: 260, gross: 35450, net: 28020 }, { employeeCode: "000000002", year: 2025, months: 12, hours: 2234, days: 262, gross: 37100, net: 29180 },
  { employeeCode: "000000003", year: 2021, months: 8, hours: 1328, days: 160, gross: 18800, net: 15140 }, { employeeCode: "000000003", year: 2022, months: 12, hours: 1990, days: 240, gross: 28700, net: 22860 }, { employeeCode: "000000003", year: 2023, months: 12, hours: 2044, days: 246, gross: 30250, net: 24020 }, { employeeCode: "000000003", year: 2024, months: 12, hours: 2078, days: 250, gross: 31800, net: 25160 }, { employeeCode: "000000003", year: 2025, months: 12, hours: 2110, days: 253, gross: 33450, net: 26390 },
];

const money = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function HrPayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>(fallbackEmployees);
  const [selectedCode, setSelectedCode] = useState(fallbackEmployees[1].code);
  const [view, setView] = useState<View>("mensile");
  const [closed, setClosed] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/one-c/dashboard", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!active || !data?.success || !Array.isArray(data.employeeCards) || !data.employeeCards.length) return;
        setEmployees(data.employeeCards);
        setSelectedCode(data.employeeCards.find((employee: Employee) => employee.type === "Dipendente")?.code || data.employeeCards[0].code);
        setLive(true);
      })
      .catch(() => setLive(false));
    return () => { active = false; };
  }, []);

  const selected = employees.find((employee) => employee.code === selectedCode) || employees[0];
  const metric = demoMetrics[selected?.code] || demoMetrics["000000003"];
  const included = employees;
  const totals = useMemo(() => included.reduce((sum, employee) => {
    const item = demoMetrics[employee.code] || demoMetrics["000000003"];
    return { hours: sum.hours + item.ordinary + item.overtime, days: sum.days + item.days, net: sum.net + item.transfer, warnings: sum.warnings + Number(item.status === "warning") };
  }, { hours: 0, days: 0, net: 0, warnings: 0 }), [employees]);
  const ulaCurrent = included.reduce((sum, employee) => { const item = demoMetrics[employee.code] || demoMetrics["000000003"]; return sum + item.months * item.fte / 12; }, 0);
  const historySummary = useMemo(() => included.map((employee) => {
    const records = history2026.filter((record) => record.employeeCode === employee.code);
    return records.reduce((sum, record) => ({
      employee, months: sum.months + 1, hours: sum.hours + record.ordinary + record.overtime,
      overtime: sum.overtime + record.overtime, permits: sum.permits + record.permits,
      vacationTaken: sum.vacationTaken + record.vacationTaken, vacationBalance: record.vacationBalance, days: sum.days + record.days,
      tickets: sum.tickets + record.tickets, travelDays: sum.travelDays + record.travelDays,
      gross: sum.gross + record.gross, net: sum.net + record.net, advances: sum.advances + record.advance,
      transfers: sum.transfers + record.transfer, allowances: sum.allowances + record.allowance,
      thirteenth: sum.thirteenth + record.thirteenth, fourteenth: sum.fourteenth + record.fourteenth,
    }), { employee, months: 0, hours: 0, overtime: 0, permits: 0, vacationTaken: 0, vacationBalance: 0, days: 0, tickets: 0, travelDays: 0, gross: 0, net: 0, advances: 0, transfers: 0, allowances: 0, thirteenth: 0, fourteenth: 0 });
  }), [included]);
  const historyTotals = useMemo(() => historySummary.reduce((sum, row) => ({
    hours: sum.hours + row.hours, gross: sum.gross + row.gross, net: sum.net + row.net,
    transfers: sum.transfers + row.transfers, tickets: sum.tickets + row.tickets,
  }), { hours: 0, gross: 0, net: 0, transfers: 0, tickets: 0 }), [historySummary]);
  const openMonthly = (code: string) => { setSelectedCode(code); setView("mensile"); };

  return <main className={`${styles.page} ${colorStyles.page}`}>
    <header className={styles.topbar}>
      <div className={styles.wordmark}><i /><b>DALECOM</b><span>HR · Buste Paghe</span></div>
      <div className={styles.topActions}><span className={live ? styles.live : styles.demo}><i />{live ? "Anagrafiche 1C connesse" : "Dati demo locali"}</span><a href="/demo">← Regia principale</a></div>
    </header>

    <section className={`${styles.intro} ${colorStyles.intro}`}>
      <div><small>07 · PERSONALE · HR</small><h1>Dalle ore alla paga.<br /><em>Senza rincorrere tre Excel.</em></h1><p>1C alimenta le anagrafiche e le presenze. HR controlla solo le eccezioni, chiude il mese e ritrova già pronto lo storico retributivo e l’organico annuale equivalente.</p></div>
      <aside className={colorStyles.cycle}><span>CICLO CORRENTE</span><b>Giugno 2026</b><small>{closed ? "Chiuso · pacchetto paghe generato" : "In verifica · 1 eccezione da risolvere"}</small></aside>
    </section>

    <nav className={styles.tabs} aria-label="Aree HR">
      <button className={`${colorStyles.tabMonthly} ${view === "mensile" ? styles.active : ""}`} onClick={() => setView("mensile")}><b>01</b><span>Elaborazione mensile<small>Ore_26_06</small></span></button>
      <button className={`${colorStyles.tabHistory} ${view === "storico" ? styles.active : ""}`} onClick={() => setView("storico")}><b>02</b><span>Storico retribuzioni<small>2021—2026</small></span></button>
      <button className={`${colorStyles.tabUla} ${view === "ula" ? styles.active : ""}`} onClick={() => setView("ula")}><b>03</b><span>Organico annuale (ULA)<small>1 persona/anno = 1 ULA</small></span></button>
    </nav>

    {view === "mensile" && <>
      <section className={styles.kpis}>
        <article className={colorStyles.kpiPeople}><small>DIPENDENTI DA 1C</small><b>{employees.length}</b><span>Anagrafiche sincronizzate</span></article>
        <article className={colorStyles.kpiHours}><small>ORE ELABORATE</small><b>{totals.hours}</b><span>Ordinarie + straordinarie</span></article>
        <article className={colorStyles.kpiMoney}><small>NETTO DEMO</small><b>{money.format(totals.net)}</b><span>Da predisporre per bonifico</span></article>
        <article className={`${colorStyles.kpiWarning} ${totals.warnings ? styles.warnKpi : styles.okKpi}`}><small>ECCEZIONI</small><b>{totals.warnings}</b><span>{totals.warnings ? "Richiede controllo HR" : "Tutto riconciliato"}</span></article>
      </section>

      <section className={styles.workspace}>
        <aside className={`${styles.people} ${colorStyles.people}`}>
          <header><small>ANAGRAFICHE 1C</small><b>Seleziona un dipendente</b></header>
          {employees.map((employee) => {
            const item = demoMetrics[employee.code] || demoMetrics["000000003"];
            return <button key={employee.code} className={selectedCode === employee.code ? styles.selected : ""} onClick={() => setSelectedCode(employee.code)}>
              <span className={`${styles.dot} ${styles[item.status]}`}>{item.status === "ok" ? "✓" : item.status === "warning" ? "!" : "—"}</span>
              <div><b>{employee.name}</b><small>{employee.type} · {employee.department}</small></div><i>→</i>
            </button>;
          })}
          <div className={styles.sourceNote}><i /> I nomi arrivano dall’anagrafica 1C. I valori economici mostrati sono simulati per la demo.</div>
        </aside>

        <article className={`${styles.employeePanel} ${colorStyles.employeePanel}`}>
          <header><div><small>DIPENDENTE · {selected.code}</small><h2>{selected.name}</h2><p>{selected.position} · {selected.department}</p></div><span className={`${styles.status} ${styles[metric.status]}`}>{metric.status === "ok" ? "Pronto paghe" : "Da verificare"}</span></header>
          <div className={styles.payGrid}>
            <div><small>Ore ordinarie</small><b>{metric.ordinary}</b></div><div><small>Straordinarie</small><b>{metric.overtime}</b></div><div><small>Giorni lavorati</small><b>{metric.days}</b></div><div><small>Ticket</small><b>{metric.tickets}</b></div>
          </div>
          <div className={detailStyles.detailGrid}>
            <section><header>ORE, FERIE E PRESENZE</header><div><span>Permessi</span><b>{metric.permits} h</b></div><div><span>Ferie godute nel mese</span><b>{metric.vacationTaken} h</b></div><div><span>Ferie residue</span><b>{metric.vacationBalance} h</b></div><div><span>Sabati lavorati</span><b>{metric.saturdays}</b></div><div><span>Ore totali</span><b>{metric.ordinary + metric.overtime} h</b></div><div><span>Rapportini 1C</span><b className={styles.checkOk}>Acquisiti</b></div></section>
            <section><header>TRASFERTE E INDENNITÀ</header><div><span>Giorni in trasferta</span><b>{metric.travelDays}</b></div><div><span>Pranzi / cene</span><b>{metric.meals}</b></div><div><span>Ticket pasto</span><b>{metric.tickets}</b></div><div><span>Indennità demo</span><b>{money.format(metric.allowance)}</b></div></section>
            <section><header>CEDOLINO E PAGAMENTI</header><div><span>Cedolino</span><b>{money.format(metric.payslip)}</b></div><div><span>Acconto</span><b>{money.format(metric.advance)}</b></div><div><span>Bonifico</span><b>{money.format(metric.transfer)}</b></div><div><span>Da saldare</span><b>{money.format(metric.balance)}</b></div></section>
            <section><header>ACCANTONAMENTI</header><div><span>13ª progressiva</span><b>{money.format(metric.thirteenth)}</b></div><div><span>14ª progressiva</span><b>{money.format(metric.fourteenth)}</b></div><div><span>Categoria ULA</span><b>{metric.category}</b></div><div><span>Tempo pieno</span><b>{Math.round(metric.fte * 100)}%</b></div></section>
          </div>
          <div className={`${styles.alert} ${styles[metric.status]}`}><b>{metric.status === "warning" ? "Eccezione rilevata" : "Controlli completati"}</b><span>{metric.note}</span></div>
        </article>
      </section>

      <section className={styles.flow}>
        <div><b>1</b><span><strong>1C raccoglie</strong>Presenze, rapportini, trasferte</span></div><i>→</i>
        <div><b>2</b><span><strong>Il sistema controlla</strong>Ore, ticket, acconti, anomalie</span></div><i>→</i>
        <div><b>3</b><span><strong>HR approva</strong>Solo eccezioni e dati mancanti</span></div><i>→</i>
        <div><b>4</b><span><strong>Output automatici</strong>Paghe, storico, ULA</span></div>
      </section>
      <div className={styles.closeBar}><div><small>CHIUSURA MENSILE</small><b>{closed ? "Pacchetto paghe demo pronto" : "Risolvi l’eccezione o procedi in modalità demo"}</b></div><button onClick={() => setClosed((value) => !value)}>{closed ? "Riapri simulazione" : "Simula chiusura mese"}</button></div>
    </>}

    {view === "storico" && <div className={`${historyStyles.historyPage} ${colorStyles.historyPage}`}>
      <section className={styles.history}>
        <header><div><small>PROSPETTO RETRIBUZIONI · DATI DIMOSTRATIVI</small><h2>Storico completo, aggiornato a giugno 2026</h2></div><span>18 mensilità elaborate · 3 anagrafiche 1C</span></header>
        <div className={historyStyles.historyKpis}>
          <article><small>ORE GEN—GIU</small><b>{historyTotals.hours.toLocaleString("it-IT")}</b><span>Ordinarie + straordinarie</span></article>
          <article><small>RETRIBUZIONE</small><b>{money.format(historyTotals.gross)}</b><span>Valore progressivo lordo</span></article>
          <article><small>NETTO EFFETTIVO</small><b>{money.format(historyTotals.net)}</b><span>Progressivo dei cedolini</span></article>
          <article><small>BONIFICI</small><b>{money.format(historyTotals.transfers)}</b><span>Al netto degli acconti</span></article>
          <article><small>TICKET</small><b>{historyTotals.tickets}</b><span>Buoni pasto maturati</span></article>
        </div>

        <div className={historyStyles.sectionTitle}><div><small>GENNAIO—GIUGNO 2026</small><h3>Progressivi per dipendente</h3></div><p>Clicca sul nome per aprire il mensile della persona.</p></div>
        <div className={historyStyles.tableScroll}>
          <table className={historyStyles.richTable}>
            <thead><tr><th>Dipendente</th><th>Mesi</th><th>Ore</th><th>Straord.</th><th>Permessi</th><th>Ferie godute</th><th>Ferie residue</th><th>Giorni</th><th>Trasferte</th><th>Ticket</th><th>Retribuzione</th><th>Netto eff.</th><th>Acconti</th><th>Bonifici</th><th>Indennità</th><th>13ª</th><th>14ª</th><th>€/ora</th><th>€/giorno</th><th>Media netto</th></tr></thead>
            <tbody>{historySummary.map((row) => <tr key={row.employee.code}>
              <th><button onClick={() => openMonthly(row.employee.code)}>{row.employee.name}<small>Apri mensile →</small></button></th>
              <td>{row.months}</td><td>{row.hours}</td><td>{row.overtime}</td><td>{row.permits}</td><td>{row.vacationTaken} h</td><td>{row.vacationBalance} h</td><td>{row.days}</td><td>{row.travelDays}</td><td>{row.tickets}</td>
              <td>{money.format(row.gross)}</td><td>{money.format(row.net)}</td><td>{money.format(row.advances)}</td><td>{money.format(row.transfers)}</td><td>{money.format(row.allowances)}</td><td>{money.format(row.thirteenth)}</td><td>{money.format(row.fourteenth)}</td>
              <td>{money.format(row.gross / Math.max(row.hours, 1))}</td><td>{money.format(row.gross / Math.max(row.days, 1))}</td><td>{money.format(row.net / Math.max(row.months, 1))}</td>
            </tr>)}</tbody>
          </table>
        </div>

        <div className={historyStyles.sectionTitle}><div><small>DETTAGLIO MENSILE 2026</small><h3>Ogni cedolino resta tracciabile</h3></div><p>Ore, giorni, trasferte, pagamenti e accantonamenti nello stesso record.</p></div>
        <div className={historyStyles.monthCards}>{included.map((employee) => <article key={employee.code}>
          <button className={historyStyles.employeeLink} onClick={() => openMonthly(employee.code)}><span>{employee.name}</span><small>Vai alla scheda mensile →</small></button>
          <div className={historyStyles.miniTable}>
            <div className={historyStyles.miniHead}><span>Mese</span><span>Ore</span><span>GG</span><span>Ferie god.</span><span>Ferie res.</span><span>Trasf.</span><span>Retrib.</span><span>Netto</span><span>Bonifico</span></div>
            {history2026.filter((record) => record.employeeCode === employee.code).map((record) => <div key={record.month}><b>{record.month}</b><span>{record.ordinary + record.overtime}</span><span>{record.days}</span><span>{record.vacationTaken} h</span><span>{record.vacationBalance} h</span><span>{record.travelDays}</span><span>{money.format(record.gross)}</span><span>{money.format(record.net)}</span><span>{money.format(record.transfer)}</span></div>)}
          </div>
        </article>)}</div>

        <div className={historyStyles.sectionTitle}><div><small>CONFRONTO 2021—2026</small><h3>Andamento annuale attribuito alle tre anagrafiche demo</h3></div><p>Il 2026 rappresenta il progressivo di sei mesi; gli anni precedenti sono completi.</p></div>
        <div className={historyStyles.yearGrid}>{included.map((employee) => {
          const current = historySummary.find((row) => row.employee.code === employee.code);
          const records = [...priorYears.filter((row) => row.employeeCode === employee.code), ...(current ? [{ employeeCode: employee.code, year: 2026, months: current.months, hours: current.hours, days: current.days, gross: current.gross, net: current.net }] : [])];
          const maximum = Math.max(...records.map((record) => record.gross), 1);
          return <article key={employee.code}>
            <button className={historyStyles.employeeLink} onClick={() => openMonthly(employee.code)}><span>{employee.name}</span><small>Apri mensile →</small></button>
            <div className={historyStyles.yearRows}>{records.map((record) => <div key={record.year}><b>{record.year}</b><span>{record.months} mesi</span><span>{record.hours.toLocaleString("it-IT")} h</span><i><em style={{ width: `${Math.max(7, record.gross / maximum * 100)}%` }} /></i><strong>{money.format(record.gross)}</strong><small>{money.format(record.net)} netto</small></div>)}</div>
          </article>;
        })}</div>
        <footer><span>I valori sono dimostrativi ma struttura, campi e controlli derivano dai tre Excel Dalecom.</span><b>Esporta Excel / invia al consulente</b></footer>
      </section>
    </div>}

    {view === "ula" && <section className={`${styles.ula} ${colorStyles.ula}`}>
      <header><div><small>ORGANICO ANNUALE EQUIVALENTE · PREVISIONE 2026</small><h2>Quante persone hanno lavorato, riportate all’anno intero</h2><p>Una persona a tempo pieno per 12 mesi vale 1 ULA. Sei mesi valgono 0,5; un part-time al 50% per tutto l’anno vale 0,5.</p></div><strong>{ulaCurrent.toFixed(2).replace(".", ",")}<small>ULA maturate · demo</small></strong></header>
      <div className={detailStyles.ulaExplain}><b>A cosa serve?</b><span>Trasforma mesi e part-time in un numero confrontabile dell’organico medio annuo. Può essere richiesto per dimensione d’impresa, bandi, agevolazioni e rendicontazioni. Il sistema lo prepara; HR o il consulente lo valida.</span></div>
      <div className={styles.ulaGrid}>
        {included.map((employee) => { const item = demoMetrics[employee.code] || demoMetrics["000000003"]; const ula = item.months * item.fte / 12; return <article key={employee.code}><span>{employee.name}</span><b>{item.months} mesi × {Math.round(item.fte * 100)}%</b><strong>{ula.toFixed(2).replace(".", ",")} ULA</strong><small>Categoria {item.category} · dato dimostrativo</small></article>; })}
      </div>
      <div className={styles.ulaFoot}><b>Controllo annuale, non reinserimento annuale.</b><span>Il sistema accumula i mesi e segnala assunzioni, cessazioni, part-time e classificazioni da validare.</span></div>
    </section>}

    <footer className={styles.footer}><span>DALECOM · Modulo HR Buste Paghe</span><b>Prototipo locale · valori economici simulati, anagrafiche lette da 1C</b></footer>
  </main>;
}
