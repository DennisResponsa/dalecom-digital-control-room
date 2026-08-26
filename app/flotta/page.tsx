"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Vehicle = {
  name: string;
  online: boolean;
  lastMessageUtc: string | null;
  speedKmh: number | null;
  maxSpeed24hKmh: number | null;
  odometerCanKm: number | null;
  distance24hKm: number | null;
  fuelLevelPercent: number | null;
  fuelConsumed24hL: number | null;
  messages24h: number;
  positionedMessages24h: number;
};

type FleetData = {
  success: boolean;
  source?: string;
  generatedAt?: string;
  privacy?: string;
  vehicles?: Vehicle[];
  error?: string;
};

const number = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 });

function value(input: number | null, suffix: string) {
  return input === null ? "—" : `${number.format(input)} ${suffix}`;
}

function localTime(input: string | null) {
  if (!input) return "dato non disponibile";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "medium" }).format(new Date(input));
}

export default function FleetPage() {
  const [data, setData] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wialon/fleet", { cache: "no-store" });
      const body = (await res.json()) as FleetData;
      setData(body);
    } catch {
      setData({ success: false, error: "Impossibile raggiungere il servizio GPS" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 120_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const totals = useMemo(() => {
    const vehicles = data?.vehicles || [];
    return {
      online: vehicles.filter((vehicle) => vehicle.online).length,
      distance: vehicles.reduce((sum, vehicle) => sum + (vehicle.distance24hKm || 0), 0),
      messages: vehicles.reduce((sum, vehicle) => sum + vehicle.messages24h, 0),
      averageFuel: vehicles.length
        ? vehicles.reduce((sum, vehicle) => sum + (vehicle.fuelLevelPercent || 0), 0) / vehicles.length
        : 0,
    };
  }, [data]);

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <img src="/dalecom-logo.png" alt="Dalecom" />
        <a href="/">Preventivo immediato →</a>
      </header>

      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>CONTROLLO OPERATIVO · DATI TOPFLY</div>
          <h1>Flotta in tempo reale.</h1>
          <p>Una vista unica su attività, chilometraggio CAN e carburante dei mezzi Dalecom, pronta per alimentare governance e manutenzione.</p>
        </div>
        <div className={styles.live}><span className={styles.dot} /> Aggiornamento automatico</div>
      </section>

      <section className={styles.shell}>
        <div className={styles.toolbar}>
          <div>
            <strong>Quadro operativo delle ultime 24 ore</strong>
            <span>{data?.generatedAt ? `Aggiornato ${localTime(data.generatedAt)}` : "Collegamento in corso…"}</span>
          </div>
          <button className={styles.refresh} onClick={() => void load()} disabled={loading}>{loading ? "Aggiorno…" : "Aggiorna dati"}</button>
        </div>
        <div className={styles.content}>
          {loading && !data ? <div className={styles.skeleton} /> : !data?.success ? (
            <div className={styles.error}><strong>Dati temporaneamente non disponibili</strong><br />{data?.error}</div>
          ) : (
            <>
              <div className={styles.kpis}>
                <div className={styles.kpi}><small>Mezzi online</small><strong>{totals.online}/{data.vehicles?.length || 0}</strong></div>
                <div className={styles.kpi}><small>Km ultime 24 ore</small><strong>{number.format(totals.distance)}</strong></div>
                <div className={styles.kpi}><small>Carburante medio</small><strong>{number.format(totals.averageFuel)}%</strong></div>
                <div className={styles.kpi}><small>Messaggi acquisiti</small><strong>{number.format(totals.messages)}</strong></div>
              </div>
              <div className={styles.grid}>
                {data.vehicles?.map((vehicle) => (
                  <article className={styles.vehicle} key={vehicle.name}>
                    <div className={styles.vehicleHead}>
                      <h2>{vehicle.name}</h2>
                      <span className={`${styles.status} ${vehicle.online ? "" : styles.offline}`}>{vehicle.online ? "Online" : "Non aggiornato"}</span>
                    </div>
                    <div className={styles.metrics}>
                      <div className={styles.metric}><small>Contachilometri CAN</small><strong>{value(vehicle.odometerCanKm, "km")}</strong></div>
                      <div className={styles.metric}><small>Percorrenza 24 ore</small><strong>{value(vehicle.distance24hKm, "km")}</strong></div>
                      <div className={styles.metric}><small>Carburante</small><strong>{value(vehicle.fuelLevelPercent, "%")}</strong></div>
                      <div className={styles.metric}><small>Consumo 24 ore</small><strong>{value(vehicle.fuelConsumed24hL, "l")}</strong></div>
                      <div className={styles.metric}><small>Velocità attuale</small><strong>{value(vehicle.speedKmh, "km/h")}</strong></div>
                      <div className={styles.metric}><small>Velocità max 24 ore</small><strong>{value(vehicle.maxSpeed24hKmh, "km/h")}</strong></div>
                    </div>
                    <div className={styles.foot}><span>Ultimo dato: {localTime(vehicle.lastMessageUtc)}</span><span>{number.format(vehicle.positionedMessages24h)} posizioni validate</span></div>
                  </article>
                ))}
              </div>
              <div className={styles.privacy}>{data.privacy}. Il chilometraggio utilizza il parametro CAN raccomandato e dovrà essere verificato una volta con il quadro del veicolo.</div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
