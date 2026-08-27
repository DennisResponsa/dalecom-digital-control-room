"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../operational-area.module.css";
import gov from "./page.module.css";
import { reconciliationKpis, reconciledTimesheets } from "../reporting-demo";

const oneCUrl = "https://sharedhosting.cloud2.1c-erp.it/Dalecom/";

type DashboardData = {
  success: boolean;
  generatedAt?: string;
  error?: string;
  kpis?: {
    leads: number;
    leadPotential: number;
    orders: number;
    orderValue: number;
    employees: number;
    timesheets: number;
    postedOrders: number;
    postedTimesheets: number;
  };
  leadCards?: Array<{
    code: string;
    created: string | null;
    potential: number;
    customer: string;
    quoteReference: string;
    contactName: string;
    email: string;
    phone: string;
    service: string;
    job: string;
    equipment: string;
    location: string;
    duration: string;
  }>;
  orderCards?: Array<{
    number: string;
    date: string | null;
    amount: number;
    customer: string;
    responsible: string;
    status: string;
    posted: boolean;
    closed: boolean;
    comment: string;
  }>;
  employeeCards?: Array<{
    code: string;
    name: string;
    type: string;
    position: string;
    department: string;
  }>;
  timesheetCards?: Array<{
    number: string;
    date: string | null;
    period: string | null;
    posted: boolean;
    status: string;
    people: number;
    hours: number;
    comment: string;
  }>;
};

type FleetData = {
  success: boolean;
  error?: string;
  vehicles?: Array<{
    name: string;
    online: boolean;
    lastMessageUtc: string | null;
    speedKmh: number;
    distance24hKm: number;
    fuelLevelPercent: number | null;
    position: { latitude: number; longitude: number } | null;
  }>;
};

type Panel = "leads" | "orders" | "employees" | "timesheets" | "fleet" | null;

export default function GovernanceArea() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [fleet, setFleet] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<Panel>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const refreshKey = Date.now();
      const [dashboardResult, fleetResult] = await Promise.allSettled([
        fetch(`/api/one-c/dashboard?refresh=${refreshKey}`, { cache: "no-store" }).then((response) => response.json() as Promise<DashboardData>),
        fetch(`/api/wialon/fleet?refresh=${refreshKey}`, { cache: "no-store" }).then((response) => response.json() as Promise<FleetData>),
      ]);
      setData(dashboardResult.status === "fulfilled" ? dashboardResult.value : { success: false, error: "Impossibile raggiungere 1C" });
      setFleet(fleetResult.status === "fulfilled" ? fleetResult.value : { success: false, error: "Impossibile raggiungere la flotta" });
    } catch {
      setData({ success: false, error: "Impossibile raggiungere 1C" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const currency = (value: number) => new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

  const leadGroups = (data?.leadCards || []).reduce<Record<string, NonNullable<DashboardData["leadCards"]>>>((groups, lead) => {
    (groups[lead.customer] ||= []).push(lead);
    return groups;
  }, {});
  const orderGroups = (data?.orderCards || []).reduce<Record<string, NonNullable<DashboardData["orderCards"]>>>((groups, order) => {
    (groups[order.customer] ||= []).push(order);
    return groups;
  }, {});
  const togglePanel = (panel: Exclude<Panel, null>) => setActivePanel((current) => current === panel ? null : panel);
  const oneCTimesheetNumbers = new Set((data?.timesheetCards || []).map((item) => item.number));
  const demoTimesheets = reconciledTimesheets.filter((item) => !oneCTimesheetNumbers.has(item.number));
  const reconciledNumbers = new Set(reconciledTimesheets.map((item) => item.number));
  const oneCOnlyTimesheets = (data?.timesheetCards || []).filter((item) => !reconciledNumbers.has(item.number));
  const totalTimesheets = (data?.kpis?.timesheets || 0) + demoTimesheets.length;
  const registeredTimesheets = (data?.kpis?.postedTimesheets || 0) + demoTimesheets.length;

  return <main className={styles.page}>
    <header className={styles.top}>
      <div className={styles.wordmark} aria-label="Dalecom"><i /><b>DALECOM</b></div>
      <a className={styles.back} href="/demo">← Regia principale</a>
    </header>
    <section className={styles.hero}>
      <div className={styles.eyebrow}>GOVERNANCE · CONTROLLO · DECISIONI</div>
      <h1>Tutta l’azienda.<br /><em>In un solo quadro.</em></h1>
      <p>Ricavi, attività commerciali e persone diventano indicatori aggiornati leggendo direttamente il gestionale 1C.</p>
    </section>
    <section className={gov.dashboard}>
      <div className={gov.dashboardHead}>
        <div><small>1C ERP · DATI LIVE</small><h2>Governance aggiornata adesso</h2><p>{data?.generatedAt ? `Ultima lettura ${new Date(data.generatedAt).toLocaleTimeString("it-IT")}` : "Collegamento al gestionale…"}</p></div>
        <button className={gov.refresh} onClick={() => void load()} disabled={loading}>{loading ? "Aggiorno…" : "Aggiorna dati"}</button>
      </div>
      {!data?.success ? <div className={gov.dataError}>{loading ? "Lettura dei dati 1C in corso…" : data?.error}</div> : <div className={gov.liveGrid}>
        <button type="button" className={gov.leadKpi} onClick={() => togglePanel("leads")} aria-expanded={activePanel === "leads"}>
          <small>Lead CRM · apri</small><strong>{data.kpis?.leads || 0}</strong><span>Potenziale {currency(data.kpis?.leadPotential || 0)}</span><em>{activePanel === "leads" ? "Chiudi schede ↑" : "Vedi lead →"}</em>
        </button>
        <button type="button" className={gov.leadKpi} onClick={() => togglePanel("orders")} aria-expanded={activePanel === "orders"}>
          <small>Ordini 1C · apri</small><strong>{data.kpis?.orders || 0}</strong><span>{data.kpis?.postedOrders || 0} registrati · {currency(data.kpis?.orderValue || 0)}</span><em>{activePanel === "orders" ? "Chiudi schede ↑" : "Vedi ordini →"}</em>
        </button>
        <button type="button" className={gov.leadKpi} onClick={() => togglePanel("employees")} aria-expanded={activePanel === "employees"}>
          <small>Dipendenti · apri</small><strong>{data.kpis?.employees || 0}</strong><span>Anagrafica attiva in 1C</span><em>{activePanel === "employees" ? "Chiudi schede ↑" : "Vedi persone →"}</em>
        </button>
        <button type="button" className={gov.leadKpi} onClick={() => togglePanel("timesheets")} aria-expanded={activePanel === "timesheets"}>
          <small>Rapportini · 1C + controllo</small><strong>{totalTimesheets}</strong><span>{registeredTimesheets} ricevuti · {reconciliationKpis.discrepancies} incongruenza</span><em>{activePanel === "timesheets" ? "Chiudi schede ↑" : "Vedi rapportini →"}</em>
        </button>
        <button type="button" className={gov.leadKpi} onClick={() => togglePanel("fleet")} aria-expanded={activePanel === "fleet"}>
          <small>Flotta GPS · apri</small><strong>{fleet?.vehicles?.length || 0}</strong><span>{fleet?.vehicles?.filter((vehicle) => vehicle.online).length || 0} mezzi online</span><em>{activePanel === "fleet" ? "Chiudi schede ↑" : "Vedi mezzi →"}</em>
        </button>
      </div>}
      {data?.success && activePanel === "leads" && <section className={gov.leadPanel} aria-label="Schede lead CRM">
        <div className={gov.leadPanelHead}><div><small>PIPELINE COMMERCIALE</small><h3>Schede lead per cliente</h3></div><span>{data.kpis?.leads || 0} lead · {currency(data.kpis?.leadPotential || 0)}</span></div>
        <div className={gov.customerGroups}>
          {Object.entries(leadGroups).map(([customer, leads]) => <article className={gov.customerGroup} key={customer}>
            <header><div><small>CLIENTE</small><h4>{customer}</h4></div><div><b>{leads.length}</b><span>lead · {currency(leads.reduce((sum, lead) => sum + lead.potential, 0))}</span></div></header>
            <div className={gov.leadCards}>
              {leads.map((lead) => <div className={gov.leadCard} key={lead.code}>
                <div className={gov.leadCardTop}><b>{lead.quoteReference}</b><span>{currency(lead.potential)}</span></div>
                <div className={gov.leadTags}><span>{lead.service}</span>{lead.duration && <span>{lead.duration}</span>}</div>
                <h5>{lead.job}</h5>
                <dl>
                  {lead.equipment && <div><dt>Macchina</dt><dd>{lead.equipment}</dd></div>}
                  {lead.location && <div><dt>Cantiere</dt><dd>{lead.location}</dd></div>}
                  <div><dt>Referente</dt><dd>{lead.contactName}</dd></div>
                  <div><dt>Contatti</dt><dd>{lead.email}<br />{lead.phone}</dd></div>
                </dl>
                <footer><span>Lead {lead.code}</span><time>{lead.created ? new Date(lead.created).toLocaleDateString("it-IT") : "Data non disponibile"}</time></footer>
              </div>)}
            </div>
          </article>)}
        </div>
      </section>}
      {data?.success && activePanel === "orders" && <section className={gov.leadPanel} aria-label="Schede ordini 1C">
        <div className={gov.leadPanelHead}><div><small>PORTAFOGLIO ORDINI</small><h3>Ordini per cliente</h3></div><span>{data.kpis?.orders || 0} ordini · {currency(data.kpis?.orderValue || 0)}</span></div>
        <div className={gov.customerGroups}>
          {Object.entries(orderGroups).map(([customer, orders]) => <article className={gov.customerGroup} key={customer}>
            <header><div><small>CLIENTE</small><h4>{customer}</h4></div><div><b>{orders.length}</b><span>ordini · {currency(orders.reduce((sum, order) => sum + order.amount, 0))}</span></div></header>
            <div className={gov.leadCards}>{orders.map((order) => <div className={gov.leadCard} key={order.number}>
              <div className={gov.leadCardTop}><b>Ordine {order.number}</b><span>{currency(order.amount)}</span></div>
              <div className={gov.leadTags}><span>{order.status}</span><span>{order.posted ? "Registrato" : "Bozza"}</span></div>
              <dl><div><dt>Responsabile</dt><dd>{order.responsible}</dd></div>{order.comment && <div><dt>Nota</dt><dd>{order.comment}</dd></div>}</dl>
              <footer><span>{order.closed ? "Chiuso" : "Aperto"}</span><time>{order.date ? new Date(order.date).toLocaleDateString("it-IT") : "Data non disponibile"}</time></footer>
            </div>)}</div>
          </article>)}
        </div>
      </section>}
      {data?.success && activePanel === "employees" && <section className={gov.leadPanel} aria-label="Schede dipendenti 1C">
        <div className={gov.leadPanelHead}><div><small>PERSONE E ORGANIZZAZIONE</small><h3>Anagrafica dipendenti</h3></div><span>{data.kpis?.employees || 0} persone attive</span></div>
        <div className={gov.leadCards}>{(data.employeeCards || []).map((employee) => <div className={gov.leadCard} key={employee.code}>
          <div className={gov.leadCardTop}><b>{employee.name}</b><span>{employee.code}</span></div>
          <div className={gov.leadTags}><span>{employee.type}</span></div>
          <dl><div><dt>Ruolo</dt><dd>{employee.position}</dd></div><div><dt>Reparto</dt><dd>{employee.department}</dd></div></dl>
          <footer><span>Anagrafica 1C</span><span>Attiva</span></footer>
        </div>)}</div>
      </section>}
      {data?.success && activePanel === "timesheets" && <section className={gov.leadPanel} aria-label="Schede rapportini 1C">
        <div className={gov.leadPanelHead}><div><small>ORE E ATTIVITÀ · CONTROLLO INCROCIATO</small><h3>Rapportini dipendenti</h3></div><span>{totalTimesheets} documenti · {reconciliationKpis.congruent} congruo · {reconciliationKpis.warnings} da completare · {reconciliationKpis.discrepancies} incongruenza</span></div>
        <div className={gov.leadCards}>{reconciledTimesheets.map((timesheet) => <a className={gov.leadCard} href="/dipendenti" style={{ color: "inherit", textDecoration: "none" }} key={timesheet.number}>
          <div className={gov.leadCardTop}><b>{timesheet.employee}</b><span>{timesheet.hours.toLocaleString("it-IT", { maximumFractionDigits: 2 })} h</span></div>
          <div className={gov.leadTags}><span>{timesheet.status}</span><span>{timesheet.role}</span></div>
          <dl><div><dt>Confronto</dt><dd>{timesheet.source} ⇄ {timesheet.thirdParty}</dd></div><div><dt>Esito</dt><dd>{timesheet.note}</dd></div></dl>
          <footer><span>{timesheet.number}</span><time>{new Date(timesheet.date).toLocaleDateString("it-IT")}</time></footer>
        </a>)}{oneCOnlyTimesheets.map((timesheet) => <div className={gov.leadCard} key={`1c-${timesheet.number}`}>
          <div className={gov.leadCardTop}><b>Rapportino {timesheet.number}</b><span>{timesheet.hours.toLocaleString("it-IT")} h</span></div>
          <div className={gov.leadTags}><span>{timesheet.status}</span><span>{timesheet.people} persone</span></div>
          {timesheet.comment && <dl><div><dt>Nota</dt><dd>{timesheet.comment}</dd></div></dl>}
          <footer><span>{timesheet.period ? new Date(timesheet.period).toLocaleDateString("it-IT") : "Periodo da definire"}</span><time>{timesheet.date ? new Date(timesheet.date).toLocaleDateString("it-IT") : "—"}</time></footer>
        </div>)}</div>
      </section>}
      {data?.success && activePanel === "fleet" && <section className={gov.leadPanel} aria-label="Schede flotta GPS">
        <div className={gov.leadPanelHead}><div><small>FLOTTA IN TEMPO REALE</small><h3>Stato operativo dei mezzi</h3></div><span>{fleet?.vehicles?.filter((vehicle) => vehicle.online).length || 0}/{fleet?.vehicles?.length || 0} online</span></div>
        {!fleet?.success ? <div className={gov.emptyState}><b>Dati flotta momentaneamente non disponibili</b><span>{fleet?.error || "Il collegamento GPS verrà riprovato al prossimo aggiornamento."}</span></div> : <div className={gov.leadCards}>{(fleet.vehicles || []).map((vehicle) => <div className={gov.leadCard} key={vehicle.name}>
          <div className={gov.leadCardTop}><b>{vehicle.name}</b><span>{vehicle.online ? "ONLINE" : "OFFLINE"}</span></div>
          <div className={gov.leadTags}><span>{vehicle.speedKmh.toLocaleString("it-IT")} km/h</span><span>{vehicle.distance24hKm.toLocaleString("it-IT")} km oggi</span></div>
          <dl><div><dt>Carburante</dt><dd>{vehicle.fuelLevelPercent == null ? "Dato non disponibile" : `${vehicle.fuelLevelPercent.toLocaleString("it-IT")} %`}</dd></div>{vehicle.position && <div><dt>Posizione demo</dt><dd>{vehicle.position.latitude.toFixed(4)}, {vehicle.position.longitude.toFixed(4)}</dd></div>}</dl>
          <footer><span>Wialon live</span><time>{vehicle.lastMessageUtc ? new Date(vehicle.lastMessageUtc).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : "—"}</time></footer>
        </div>)}</div>}
      </section>}
      <div className={gov.dashboardActions}><a className={styles.secondary} href="/demo">Torna alla regia</a><a className={styles.primary} href={oneCUrl} target="_blank" rel="noreferrer">Apri il dettaglio in 1C ↗</a></div>
    </section>
    <div className={styles.note}>Ambiente demo collegato a 1C e Wialon: ogni scheda si aggiorna automaticamente quando vengono aggiunti nuovi dati.</div>
  </main>;
}
