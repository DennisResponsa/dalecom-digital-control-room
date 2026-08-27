"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../operational-area.module.css";
import gov from "./page.module.css";

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
    service: string;
  }>;
};

export default function GovernanceArea() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeads, setShowLeads] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/one-c/dashboard", { cache: "no-store" });
      setData((await response.json()) as DashboardData);
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
        <button type="button" className={gov.leadKpi} onClick={() => setShowLeads((visible) => !visible)} aria-expanded={showLeads}>
          <small>Lead CRM · clicca per aprire</small><strong>{data.kpis?.leads || 0}</strong><span>Potenziale {currency(data.kpis?.leadPotential || 0)}</span><em>{showLeads ? "Chiudi schede ↑" : "Vedi schede lead →"}</em>
        </button>
        <div><small>Ordini già presenti in 1C</small><strong>{data.kpis?.orders || 0}</strong><span>{data.kpis?.postedOrders || 0} registrati · {currency(data.kpis?.orderValue || 0)}</span></div>
        <div><small>Dipendenti</small><strong>{data.kpis?.employees || 0}</strong><span>Anagrafica attiva in 1C</span></div>
        <div><small>Rapportini</small><strong>{data.kpis?.timesheets || 0}</strong><span>{data.kpis?.postedTimesheets || 0} registrati</span></div>
      </div>}
      {data?.success && showLeads && <section className={gov.leadPanel} aria-label="Schede lead CRM">
        <div className={gov.leadPanelHead}><div><small>PIPELINE COMMERCIALE</small><h3>Schede lead per cliente</h3></div><span>{data.kpis?.leads || 0} lead · {currency(data.kpis?.leadPotential || 0)}</span></div>
        <div className={gov.customerGroups}>
          {Object.entries(leadGroups).map(([customer, leads]) => <article className={gov.customerGroup} key={customer}>
            <header><div><small>CLIENTE</small><h4>{customer}</h4></div><div><b>{leads.length}</b><span>lead · {currency(leads.reduce((sum, lead) => sum + lead.potential, 0))}</span></div></header>
            <div className={gov.leadCards}>
              {leads.map((lead) => <div className={gov.leadCard} key={lead.code}>
                <div className={gov.leadCardTop}><b>{lead.quoteReference}</b><span>{currency(lead.potential)}</span></div>
                <p>{lead.service}</p>
                <footer><span>Lead {lead.code}</span><time>{lead.created ? new Date(lead.created).toLocaleDateString("it-IT") : "Data non disponibile"}</time></footer>
              </div>)}
            </div>
          </article>)}
        </div>
      </section>}
      <div className={gov.dashboardActions}><a className={styles.secondary} href="/demo">Torna alla regia</a><a className={styles.primary} href={oneCUrl} target="_blank" rel="noreferrer">Apri il dettaglio in 1C ↗</a></div>
    </section>
    <div className={styles.note}>Le schede mostrano solo dati commerciali essenziali. Credenziali, email, telefoni e nominativi dei referenti restano sul server.</div>
  </main>;
}
