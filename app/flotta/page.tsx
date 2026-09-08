"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import machineStyles from "./machines.module.css";
import navStyles from "./nav.module.css";

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
  position: { latitude: number; longitude: number } | null;
};

type FleetData = {
  success: boolean;
  source?: string;
  generatedAt?: string;
  privacy?: string;
  vehicles?: Vehicle[];
  error?: string;
};

type FleetView = "vehicles" | "machines";

const operatingMachines = [
  { id: "DA-MEZ-CING-TB30", name: "Turbosol TB30 Cingolata", family: "Pompa per calcestruzzo", source: "Cleve", state: "In attesa token" },
  { id: "DA-MEZ-MASSETTI-TRANSMAT250", name: "Turbosol Transmat 250", family: "Pompa per massetti", source: "Diaboard da verificare", state: "Da associare" },
] as const;

const number = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 });

function value(input: number | null, suffix: string) {
  return input === null ? "—" : `${number.format(input)} ${suffix}`;
}

function localTime(input: string | null) {
  if (!input) return "dato non disponibile";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "medium" }).format(new Date(input));
}

function mapUrl(position: { latitude: number; longitude: number }) {
  const { latitude, longitude } = position;
  const delta = 0.018;
  const bbox = [longitude - delta, latitude - delta, longitude + delta, latitude + delta]
    .map((coordinate) => coordinate.toFixed(5))
    .join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude.toFixed(4)}%2C${longitude.toFixed(4)}`;
}

export default function FleetPage() {
  const [data, setData] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<FleetView>("vehicles");

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

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("vista") === "macchine") setView("machines");
  }, []);

  const changeView = (next: FleetView) => {
    setView(next);
    window.history.replaceState({}, "", next === "machines" ? "/flotta?vista=macchine" : "/flotta");
  };

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
        <div className={styles.brandMark} aria-label="Dalecom"><i /><strong>DALECOM</strong></div>
        <nav className={navStyles.nav} aria-label="Navigazione demo">
          <a href="/demo">← Regia principale</a>
          <a href="/">Preventivo immediato →</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>CONTROLLO OPERATIVO · FLOTTA E ATTREZZATURA 4.0</div>
          <h1>Flotta in tempo reale.</h1>
          <p>Un unico modulo, due viste distinte: mezzi targati su strada e macchine operatrici al lavoro nei cantieri.</p>
        </div>
        <div className={styles.live}><span className={styles.dot} /> Aggiornamento automatico</div>
      </section>

      <section className={styles.shell}>
        <div className={machineStyles.viewTabs} role="tablist" aria-label="Tipo di flotta">
          <button role="tab" aria-selected={view === "vehicles"} className={view === "vehicles" ? machineStyles.activeTab : ""} onClick={() => changeView("vehicles")}><i>01</i><span><b>Mezzi targati</b><small>GPS, chilometri, carburante e viaggi</small></span></button>
          <button role="tab" aria-selected={view === "machines"} className={view === "machines" ? machineStyles.activeTab : ""} onClick={() => changeView("machines")}><i>02</i><span><b>Macchine che lavorano</b><small>Turbosol, telemetria, sensori e allarmi</small></span></button>
        </div>
        <div className={styles.toolbar}>
          <div>
            <strong>{view === "vehicles" ? "Mezzi targati · ultime 24 ore" : "Macchine operatrici · Attrezzatura 4.0"}</strong>
            <span>{view === "vehicles" ? (data?.generatedAt ? `Aggiornato ${localTime(data.generatedAt)}` : "Collegamento in corso…") : "Anagrafica iniziale · dati live in attesa delle credenziali API"}</span>
          </div>
          {view === "vehicles" ? <button className={styles.refresh} onClick={() => void load()} disabled={loading}>{loading ? "Aggiorno…" : "Aggiorna dati"}</button> : <span className={machineStyles.readOnly}>Prima fase · sola lettura</span>}
        </div>
        <div className={styles.content}>
          {view === "machines" ? (
            <>
              <div className={`${styles.kpis} ${machineStyles.machineKpis}`}>
                <div className={styles.kpi}><small>Macchine Turbosol censite</small><strong>{operatingMachines.length}</strong><span>Anagrafica già presente in Dalecom</span></div>
                <div className={styles.kpi}><small>Cleve</small><strong>Pronto</strong><span>In attesa del token aziendale</span></div>
                <div className={styles.kpi}><small>Diaboard</small><strong>Legacy</strong><span>Credenziali API da verificare</span></div>
                <div className={styles.kpi}><small>Collegamento 1C</small><strong>JSON</strong><span>Mappatura normalizzata prevista</span></div>
              </div>
              <div className={machineStyles.machineGrid}>
                {operatingMachines.map((machine) => (
                  <article className={machineStyles.operatingMachine} key={machine.id}>
                    <header><div><small>MACCHINA OPERATRICE</small><h2>{machine.name}</h2><p>{machine.family} · {machine.id}</p></div><span>{machine.state}</span></header>
                    <div className={machineStyles.machineMetrics}>
                      <div><small>Sorgente dati</small><b>{machine.source}</b></div>
                      <div><small>Ultima comunicazione</small><b>Non disponibile</b></div>
                      <div><small>Ore di lavoro</small><b>In attesa API</b></div>
                      <div><small>Posizione macchina</small><b>In attesa API</b></div>
                      <div><small>Telemetria e sensori</small><b>Predisposti</b></div>
                      <div><small>Allarmi e anomalie</small><b>Predisposti</b></div>
                    </div>
                    <footer><span>La macchina verrà associata automaticamente all’identificativo restituito dal portale.</span><a href="/officina">Apri manutenzioni →</a></footer>
                  </article>
                ))}
              </div>
              <div className={machineStyles.integrationFlow}><b>MACCHINA</b><i>→</i><span>Cleve / Diaboard</span><i>→</i><span>Connettore Dalecom</span><i>→</i><span>1C e officina</span><i>→</i><strong>Regia</strong></div>
              <div className={styles.privacy}><b>ATTREZZATURA 4.0</b><span>I valori non vengono simulati come dati live. Appena disponibile il token Cleve, questa vista mostrerà le informazioni effettivamente autorizzate dal portale.</span></div>
            </>
          ) : loading && !data ? <div className={styles.skeleton} /> : !data?.success ? (
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
                    {vehicle.position ? (
                      <div className={styles.mapPanel}>
                        <div className={styles.mapTitle}>
                          <div><small>POSIZIONE GPS</small><strong>Ultima posizione ricevuta</strong></div>
                          <span>{vehicle.position.latitude.toFixed(4)}, {vehicle.position.longitude.toFixed(4)}</span>
                        </div>
                        <iframe
                          title={`Posizione GPS ${vehicle.name}`}
                          src={mapUrl(vehicle.position)}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : null}
                    <div className={styles.foot}><span>Ultimo dato: {localTime(vehicle.lastMessageUtc)}</span><span>{number.format(vehicle.positionedMessages24h)} posizioni validate</span></div>
                  </article>
                ))}
              </div>
              <div className={styles.privacy}><b>DALECOM · GOVERNANCE OPERATIVA</b><span>{data.privacy}. Il chilometraggio utilizza il parametro CAN raccomandato e dovrà essere verificato una volta con il quadro del veicolo.</span></div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
