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
  odometerSource: "can_total_distance" | "mileage" | null;
  fuelTelemetryStatus: "available" | "not_transmitted";
  speedAlerts: Array<{
    speedKmh: number;
    occurredAtUtc: string;
    position: { latitude: number; longitude: number } | null;
  }>;
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

const hc605Incident = {
  vehicle: "HC605EZ",
  occurredAt: "2026-09-08T04:03:57.000Z",
  place: "SPV · Barcon, Montebelluna/Fonte (TV)",
  latitude: 45.732837,
  longitude: 12.032931,
  maxSpeedKmh: 173,
  legalSpeedKmh: 130,
  distanceAboveLimitKm: 122.6,
  actualDistanceKm: 173.9,
  alternativeDistanceKm: 125.3,
  actualTollEuro: 23.4,
  alternativeTollEuro: 13.1,
  fuelActualMinL: 12,
  fuelActualMaxL: 12.5,
  fuelAlternativeMinL: 6.6,
  fuelAlternativeMaxL: 8.1,
  avoidableCostMinEuro: 17.8,
  avoidableCostMaxEuro: 19.5,
} as const;

function value(input: number | null, suffix: string) {
  return input === null ? "—" : `${number.format(input)} ${suffix}`;
}

function localTime(input: string | null) {
  if (!input) return "dato non disponibile";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "medium" }).format(new Date(input));
}

function italyTime(input: string | null) {
  if (!input) return "dato non disponibile";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Rome",
  }).format(new Date(input));
}

function mapUrl(position: { latitude: number; longitude: number }) {
  const { latitude, longitude } = position;
  const delta = 0.018;
  const bbox = [longitude - delta, latitude - delta, longitude + delta, latitude + delta]
    .map((coordinate) => coordinate.toFixed(5))
    .join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude.toFixed(4)}%2C${longitude.toFixed(4)}`;
}

function externalMapUrl(position: { latitude: number; longitude: number }) {
  return `https://www.google.com/maps?q=${position.latitude},${position.longitude}`;
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

  const hc605 = data?.vehicles?.find((vehicle) => vehicle.name.toUpperCase().replaceAll(" ", "") === hc605Incident.vehicle);

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
            <span>{view === "vehicles" ? (data?.generatedAt ? `Aggiornato ${localTime(data.generatedAt)}` : data && !data.success ? "Telemetria live non collegata · analisi storica disponibile" : "Collegamento in corso…") : "Anagrafica iniziale · dati live in attesa delle credenziali API"}</span>
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
            <>
              <div className={styles.error}><strong>Telemetria live non disponibile in locale</strong><br />{data?.error}. L’analisi storica verificata resta consultabile.</div>
              <section className={styles.alertPanel} aria-label="Alert velocità HC605EZ">
                <div className={styles.alertHeader}>
                  <div className={styles.alertTitle}>
                    <span>ALERT</span>
                    <div><small>VELOCITÀ CRITICA · EVENTO REALE</small><h2>HC605EZ · {hc605Incident.maxSpeedKmh} km/h</h2></div>
                  </div>
                  <div className={styles.alertExcess}>+{hc605Incident.maxSpeedKmh - hc605Incident.legalSpeedKmh}<small>km/h oltre il limite</small></div>
                </div>
                <div className={styles.alertWhere}>
                  <div><small>DATA E ORA · ITALIA</small><strong>{italyTime(hc605Incident.occurredAt)}</strong></div>
                  <div><small>POSIZIONE</small><strong>{hc605Incident.place}</strong></div>
                  <div><small>OLTRE 130 KM/H</small><strong>{number.format(hc605Incident.distanceAboveLimitKm)} km</strong></div>
                  <a href={externalMapUrl(hc605Incident)} target="_blank" rel="noreferrer">Apri posizione GPS ↗</a>
                </div>
                <div className={styles.costComparison}>
                  <article>
                    <header><small>PERCORSO EFFETTUATO</small><strong>Via Pedemontana</strong></header>
                    <dl>
                      <div><dt>Chilometri Wialon</dt><dd>{number.format(hc605Incident.actualDistanceKm)} km</dd></div>
                      <div><dt>Pedaggi</dt><dd>€ {number.format(hc605Incident.actualTollEuro)}</dd></div>
                      <div><dt>Carburante stimato</dt><dd>{number.format(hc605Incident.fuelActualMinL)}–{number.format(hc605Incident.fuelActualMaxL)} l</dd></div>
                    </dl>
                  </article>
                  <div className={styles.versus}>VS</div>
                  <article className={styles.betterRoute}>
                    <header><small>ALTERNATIVA PIÙ EFFICIENTE</small><strong>Via Venezia · A57/A4</strong></header>
                    <dl>
                      <div><dt>Chilometri</dt><dd>{number.format(hc605Incident.alternativeDistanceKm)} km</dd></div>
                      <div><dt>Pedaggi</dt><dd>€ {number.format(hc605Incident.alternativeTollEuro)}</dd></div>
                      <div><dt>Carburante stimato</dt><dd>{number.format(hc605Incident.fuelAlternativeMinL)}–{number.format(hc605Incident.fuelAlternativeMaxL)} l</dd></div>
                    </dl>
                  </article>
                </div>
                <div className={styles.wasteStrip}>
                  <div><small>STRADA IN PIÙ</small><strong>+{number.format(hc605Incident.actualDistanceKm - hc605Incident.alternativeDistanceKm)} km</strong></div>
                  <div><small>PEDAGGIO IN PIÙ</small><strong>+€ {number.format(hc605Incident.actualTollEuro - hc605Incident.alternativeTollEuro)}</strong></div>
                  <div><small>CARBURANTE NON RISPARMIATO</small><strong>+4,4–5,4 l</strong></div>
                  <div className={styles.totalWaste}><small>COSTO EVITABILE · UN VIAGGIO</small><strong>€ {number.format(hc605Incident.avoidableCostMinEuro)}–{number.format(hc605Incident.avoidableCostMaxEuro)}</strong></div>
                </div>
                <div className={styles.projection}><b>PROIEZIONE DEMO · 20 VIAGGI SIMILI/MESE</b><span>€ 356–390/mese · € 4.270–4.680/anno di costi evitabili</span><em>Carburante stimato a € 1,70/l. Pedaggi verificati sui calcolatori ufficiali.</em></div>
              </section>
            </>
          ) : (
            <>
              <div className={styles.kpis}>
                <div className={styles.kpi}><small>Mezzi online</small><strong>{totals.online}/{data.vehicles?.length || 0}</strong></div>
                <div className={styles.kpi}><small>Km ultime 24 ore</small><strong>{number.format(totals.distance)}</strong></div>
                <div className={styles.kpi}><small>Carburante medio</small><strong>{number.format(totals.averageFuel)}%</strong></div>
                <div className={styles.kpi}><small>Messaggi acquisiti</small><strong>{number.format(totals.messages)}</strong></div>
              </div>
              <section className={styles.alertPanel} aria-label="Alert velocità HC605EZ">
                <div className={styles.alertHeader}>
                  <div className={styles.alertTitle}>
                    <span>ALERT</span>
                    <div><small>VELOCITÀ CRITICA · EVENTO REALE</small><h2>HC605EZ · {hc605Incident.maxSpeedKmh} km/h</h2></div>
                  </div>
                  <div className={styles.alertExcess}>+{hc605Incident.maxSpeedKmh - hc605Incident.legalSpeedKmh}<small>km/h oltre il limite</small></div>
                </div>
                <div className={styles.alertWhere}>
                  <div><small>DATA E ORA · ITALIA</small><strong>{italyTime(hc605Incident.occurredAt)}</strong></div>
                  <div><small>POSIZIONE</small><strong>{hc605Incident.place}</strong></div>
                  <div><small>OLTRE 130 KM/H</small><strong>{number.format(hc605Incident.distanceAboveLimitKm)} km</strong></div>
                  <a href={externalMapUrl(hc605Incident)} target="_blank" rel="noreferrer">Apri posizione GPS ↗</a>
                </div>
                {hc605?.speedAlerts?.length ? (
                  <div className={styles.alertEvents}>
                    <div className={styles.alertEventsTitle}><b>EVENTI DI VELOCITÀ RILEVATI</b><span>Ogni evento conserva data, ora e coordinate</span></div>
                    <div className={styles.alertEventList}>
                      {hc605.speedAlerts.map((alert) => (
                        <div className={styles.alertEvent} key={`${alert.occurredAtUtc}-${alert.speedKmh}`}>
                          <strong>{alert.speedKmh} km/h</strong>
                          <span>{italyTime(alert.occurredAtUtc)}</span>
                          {alert.position ? <a href={externalMapUrl(alert.position)} target="_blank" rel="noreferrer">Posizione ↗</a> : <em>Posizione non disponibile</em>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className={styles.costComparison}>
                  <article>
                    <header><small>PERCORSO EFFETTUATO</small><strong>Via Pedemontana</strong></header>
                    <dl>
                      <div><dt>Chilometri CAN/Wialon</dt><dd>{number.format(hc605Incident.actualDistanceKm)} km</dd></div>
                      <div><dt>Pedaggi</dt><dd>€ {number.format(hc605Incident.actualTollEuro)}</dd></div>
                      <div><dt>Carburante stimato</dt><dd>{number.format(hc605Incident.fuelActualMinL)}–{number.format(hc605Incident.fuelActualMaxL)} l</dd></div>
                    </dl>
                  </article>
                  <div className={styles.versus}>VS</div>
                  <article className={styles.betterRoute}>
                    <header><small>ALTERNATIVA PIÙ EFFICIENTE</small><strong>Via Venezia · A57/A4</strong></header>
                    <dl>
                      <div><dt>Chilometri</dt><dd>{number.format(hc605Incident.alternativeDistanceKm)} km</dd></div>
                      <div><dt>Pedaggi</dt><dd>€ {number.format(hc605Incident.alternativeTollEuro)}</dd></div>
                      <div><dt>Carburante stimato</dt><dd>{number.format(hc605Incident.fuelAlternativeMinL)}–{number.format(hc605Incident.fuelAlternativeMaxL)} l</dd></div>
                    </dl>
                  </article>
                </div>
                <div className={styles.wasteStrip}>
                  <div><small>STRADA IN PIÙ</small><strong>+{number.format(hc605Incident.actualDistanceKm - hc605Incident.alternativeDistanceKm)} km</strong></div>
                  <div><small>PEDAGGIO IN PIÙ</small><strong>+€ {number.format(hc605Incident.actualTollEuro - hc605Incident.alternativeTollEuro)}</strong></div>
                  <div><small>CARBURANTE NON RISPARMIATO</small><strong>+4,4–5,4 l</strong></div>
                  <div className={styles.totalWaste}><small>COSTO EVITABILE · UN VIAGGIO</small><strong>€ {number.format(hc605Incident.avoidableCostMinEuro)}–{number.format(hc605Incident.avoidableCostMaxEuro)}</strong></div>
                </div>
                <div className={styles.projection}><b>PROIEZIONE DEMO · 20 VIAGGI SIMILI/MESE</b><span>€ 356–390/mese · € 4.270–4.680/anno di costi evitabili</span><em>Carburante stimato a € 1,70/l. Pedaggi verificati sui calcolatori ufficiali.</em></div>
              </section>
              <div className={styles.grid}>
                {data.vehicles?.map((vehicle) => (
                  <article className={styles.vehicle} key={vehicle.name}>
                    <div className={styles.vehicleHead}>
                      <h2>{vehicle.name}</h2>
                      <span className={`${styles.status} ${vehicle.online ? "" : styles.offline}`}>{vehicle.online ? "Online" : "Non aggiornato"}</span>
                    </div>
                    <div className={styles.metrics}>
                      <div className={styles.metric}><small>Contachilometri</small><strong>{value(vehicle.odometerCanKm, "km")}</strong>{vehicle.odometerSource ? <em>{vehicle.odometerSource === "mileage" ? "Wialon mileage" : "CAN"}</em> : null}</div>
                      <div className={styles.metric}><small>Percorrenza 24 ore</small><strong>{value(vehicle.distance24hKm, "km")}</strong></div>
                      <div className={styles.metric}><small>Carburante</small><strong>{vehicle.fuelTelemetryStatus === "not_transmitted" ? "Non trasmesso" : value(vehicle.fuelLevelPercent, "%")}</strong></div>
                      <div className={styles.metric}><small>Consumo 24 ore</small><strong>{vehicle.fuelTelemetryStatus === "not_transmitted" ? "Non trasmesso" : value(vehicle.fuelConsumed24hL, "l")}</strong></div>
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
              <div className={styles.privacy}><b>DALECOM · GOVERNANCE OPERATIVA</b><span>{data.privacy}. HC605EZ invia il chilometraggio Wialon ma non trasmette ancora livello o consumo carburante attendibili: le stime dell’alert sono dichiarate e separate dalla telemetria reale.</span></div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
