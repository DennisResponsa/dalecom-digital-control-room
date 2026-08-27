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
};

export default function GovernanceArea() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div><small>Lead CRM</small><strong>{data.kpis?.leads || 0}</strong><span>Potenziale {currency(data.kpis?.leadPotential || 0)}</span></div>
        <div><small>Ordini</small><strong>{data.kpis?.orders || 0}</strong><span>{data.kpis?.postedOrders || 0} registrati · {currency(data.kpis?.orderValue || 0)}</span></div>
        <div><small>Dipendenti</small><strong>{data.kpis?.employees || 0}</strong><span>Anagrafica attiva in 1C</span></div>
        <div><small>Rapportini</small><strong>{data.kpis?.timesheets || 0}</strong><span>{data.kpis?.postedTimesheets || 0} registrati</span></div>
      </div>}
      <div className={gov.dashboardActions}><a className={styles.secondary} href="/demo">Torna alla regia</a><a className={styles.primary} href={oneCUrl} target="_blank" rel="noreferrer">Apri il dettaglio in 1C ↗</a></div>
    </section>
    <div className={styles.note}>La pagina espone soltanto indicatori aggregati. Credenziali e dati identificativi restano sul server.</div>
  </main>;
}
