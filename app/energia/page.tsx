"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const loads = [
  { name: "Uffici", value: 24.8, color: "cyan" },
  { name: "Capannone", value: 68.2, color: "orange" },
  { name: "Officina", value: 39.1, color: "violet" },
  { name: "7 colonne auto", value: 52.4, color: "green" },
  { name: "Carrello elevatore", value: 18.6, color: "yellow" },
] as const;

const chargePoints = [
  { id: "C01", status: "In carica", vehicle: "Tesla Model Y", power: "11,0 kW", energy: "31,4 kWh", level: "green" },
  { id: "C02", status: "In carica", vehicle: "Fiat E-Doblò", power: "7,4 kW", energy: "18,7 kWh", level: "green" },
  { id: "C03", status: "Prenotata", vehicle: "Flotta Dalecom", power: "—", energy: "ore 15:30", level: "yellow" },
  { id: "C04", status: "Disponibile", vehicle: "—", power: "0 kW", energy: "libera", level: "cyan" },
  { id: "C05", status: "In carica", vehicle: "Volvo EX30", power: "11,0 kW", energy: "22,9 kWh", level: "green" },
  { id: "C06", status: "In carica", vehicle: "Ospite", power: "11,0 kW", energy: "15,2 kWh", level: "green" },
  { id: "C07", status: "Disponibile", vehicle: "—", power: "0 kW", energy: "libera", level: "cyan" },
] as const;

const productionBars = [31, 42, 55, 68, 77, 86, 91, 96, 89, 78, 61, 38];

export default function EnergyControlRoom() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 3500);
    return () => window.clearInterval(timer);
  }, []);

  const live = useMemo(() => {
    const wave = Math.sin(tick * 0.72);
    const solar = 486.4 + wave * 9.6;
    const consumption = loads.reduce((sum, load, index) => sum + load.value + Math.sin(tick * .46 + index) * 1.4, 0);
    const battery = 42.0 + Math.cos(tick * .55) * 3.2;
    return { solar, consumption, battery, grid: solar - consumption - battery };
  }, [tick]);

  return <main className={styles.page}>
    <aside className={styles.sidebar}>
      <div className={styles.logo}><img src="/dalecom-logo.png" alt="Dalecom" /><span>Energy Control</span></div>
      <a className={styles.back} href="/demo">← Torna alla regia principale</a>
      <nav>
        <a className={styles.active} href="#sintesi">▦ Sintesi energetica</a>
        <a href="#fotovoltaico">☀ Fotovoltaico</a>
        <a href="#consumi">ϟ Consumi elettrici</a>
        <a href="#ricariche">▣ Ricariche</a>
        <a href="#acqua">≈ Acqua e recupero</a>
        <a href="#fluidi">◉ Gasolio e AdBlue</a>
        <a href="#alert">! Alert e automazioni</a>
      </nav>
      <footer><b>DALECOM</b><span>Controllo energetico e sostenibilità</span></footer>
    </aside>

    <section className={styles.content}>
      <header className={styles.header}>
        <div><small>14 · ENERGY & SUSTAINABILITY</small><h1>Controllo energetico e sostenibilità</h1><p>Produzione, consumi e risorse. Un solo quadro per decidere.</p></div>
        <div><span className={styles.source}>DATI DEMO · FUTURA FONTE CONTATORI + 1C</span><span className={styles.live}><i /> Aggiornamento live</span></div>
      </header>

      <section className={styles.kpis} id="sintesi">
        <article className={styles.solar}><small>PRODUZIONE FOTOVOLTAICA</small><b>{live.solar.toFixed(1)} kW</b><em>su 800 kWp installati</em><div><i style={{ width: `${live.solar / 8}%` }} /></div></article>
        <article className={styles.demand}><small>CONSUMO ISTANTANEO</small><b>{live.consumption.toFixed(1)} kW</b><em>tutte le utenze Dalecom</em><div><i style={{ width: `${live.consumption / 4}%` }} /></div></article>
        <article className={styles.storage}><small>ACCUMULO 120 kWh</small><b>78%</b><em>93,6 kWh disponibili</em><div><i style={{ width: "78%" }} /></div></article>
        <article className={styles.gridKpi}><small>SCAMBIO CON ENEL</small><b>+{live.grid.toFixed(1)} kW</b><em>immissione istantanea in rete</em><div><i style={{ width: "68%" }} /></div></article>
        <article className={styles.self}><small>AUTOCONSUMO OGGI</small><b>81,4%</b><em>obiettivo mensile ≥ 78%</em><div><i style={{ width: "81.4%" }} /></div></article>
        <article className={styles.co2}><small>CO₂ EVITATA · ANNO</small><b>418 t</b><em>1.126 MWh prodotti</em><div><i style={{ width: "73%" }} /></div></article>
      </section>

      <section className={styles.energyFlow} aria-label="Flusso energetico istantaneo">
        <div className={styles.flowSource}><i>☀</i><span><small>FOTOVOLTAICO</small><b>{live.solar.toFixed(1)} kW</b></span></div><strong>→</strong>
        <div><i>⌂</i><span><small>CONSUMI DALECOM</small><b>{live.consumption.toFixed(1)} kW</b></span></div><strong>→</strong>
        <div><i>▥</i><span><small>ACCUMULO</small><b>+{live.battery.toFixed(1)} kW</b></span></div><strong>→</strong>
        <div className={styles.flowGrid}><i>ϟ</i><span><small>RETE ENEL</small><b>+{live.grid.toFixed(1)} kW</b></span></div>
      </section>

      <section className={styles.mainGrid}>
        <article className={`${styles.panel} ${styles.production}`} id="fotovoltaico">
          <header><div><small>FOTOVOLTAICO · 800 kWp</small><b>Produzione e resa odierna</b></div><span className={styles.good}>IMPIANTO REGOLARE</span></header>
          <div className={styles.productionTop}><div><small>PRODOTTO OGGI</small><b>3.842 kWh</b><em>+8,7% rispetto alla previsione</em></div><div><small>RESA SPECIFICA</small><b>4,80 kWh/kWp</b><em>target 4,42</em></div><div><small>PREVISIONE FINE GIORNO</small><b>5.126 kWh</b><em>meteo favorevole</em></div></div>
          <div className={styles.chart}>{productionBars.map((height, index) => <i key={index} style={{ height: `${height}%` }}><span>{index + 7}</span></i>)}</div>
          <footer><span>07:00</span><span>Produzione oraria · kWh</span><span>18:00</span></footer>
        </article>

        <article className={`${styles.panel} ${styles.cleaning}`}>
          <header><div><small>ANALISI PRESTAZIONI</small><b>Pulizia pannelli</b></div><span className={styles.warning}>AZIONE CONSIGLIATA</span></header>
          <div className={styles.cleanScore} style={{ position: "relative" }}><div><b>89%</b><span>indice di pulizia stimato</span></div></div>
          <ul><li><span>Resa attesa con irraggiamento attuale</span><b>534 kW</b></li><li><span>Resa effettiva normalizzata</span><b>475 kW</b></li><li><span>Perdita stimata per sporco</span><b className={styles.orangeText}>−11,0%</b></li><li><span>Ultimo lavaggio registrato</span><b>38 giorni fa</b></li></ul>
          <div className={styles.recommendation}><i>!</i><span><b>Lavaggio consigliato entro 5 giorni</b><small>Priorità calcolata da resa, meteo e costo dell’energia.</small></span></div>
        </article>

        <article className={`${styles.panel} ${styles.loads}`} id="consumi">
          <header><div><small>CARICHI ELETTRICI</small><b>Consumo istantaneo per area</b></div><span>{live.consumption.toFixed(1)} kW TOTALI</span></header>
          <div>{loads.map((load, index) => {
            const value = load.value + Math.sin(tick * .46 + index) * 1.4;
            return <label key={load.name}><span><b>{load.name}</b><em>{value.toFixed(1)} kW</em></span><i><b className={styles[load.color]} style={{ width: `${Math.min(value / 0.82, 100)}%` }} /></i></label>;
          })}</div>
          <footer><span>Picco odierno <b>286,7 kW</b></span><span>Costo energia oggi <b>€ 486</b></span><span>Prelievo rete <b>0 kW</b></span></footer>
        </article>

        <article className={`${styles.panel} ${styles.charging}`} id="ricariche">
          <header><div><small>MOBILITÀ ELETTRICA</small><b>7 colonne esterne</b></div><span className={styles.good}>4 IN CARICA</span></header>
          <div className={styles.chargeSummary}><span><small>EROGATO OGGI</small><b>186,4 kWh</b></span><span><small>POTENZA ATTUALE</small><b>40,4 kW</b></span><span><small>SESSIONI</small><b>11</b></span></div>
          <div className={styles.chargeList}>{chargePoints.map((point) => <div key={point.id}><i className={styles[point.level]}>{point.id}</i><span><b>{point.status}</b><small>{point.vehicle}</small></span><em>{point.power}<small>{point.energy}</small></em></div>)}</div>
          <div className={styles.forklift}><i>▣</i><span><b>Carrello elevatore · batteria 72%</b><small>18,6 kW · fine ricarica prevista 15:42 · pronto per il turno</small></span><strong>1 h 18 min</strong></div>
        </article>

        <article className={`${styles.panel} ${styles.water}`} id="acqua">
          <header><div><small>RECUPERO ACQUA PIOVANA</small><b>Vasca di accumulo</b></div><span className={styles.good}>VALVOLA CHIUSA</span></header>
          <div className={styles.waterBody}><div className={styles.tank}><div style={{ height: `${218 / 2.6}%` }}><i /><span>218 m³</span></div><b>260 m³ MAX</b></div><div className={styles.waterMetrics}><div><small>LIVELLO ATTUALE</small><b>83,8%</b><span>42 m³ disponibili</span></div><div><small>CONSUMO GIORNALIERO</small><b>3,0 m³</b><span>2 irrigazione + 1 lavaggio</span></div><div><small>AUTONOMIA SENZA PIOGGIA</small><b>72 giorni</b><span>al consumo attuale</span></div><div><small>APPORTO PREVISTO 48H</small><b>+18 m³</b><span>previsione meteo demo</span></div></div></div>
          <div className={styles.valve}><i>↯</i><span><b>Automazione valvola di sicurezza</b><small>Apertura automatica a 260 m³ · chiusura al rientro sotto 245 m³.</small></span><strong>PRONTA</strong></div>
        </article>

        <article className={`${styles.panel} ${styles.fluids}`} id="fluidi">
          <header><div><small>SCORTE OPERATIVE</small><b>Gasolio e AdBlue</b></div><span>DATI DEMO · FUTURA FONTE 1C</span></header>
          <div className={styles.fluidGrid}>
            <section><header><b>PAESE</b><small>Sede principale</small></header><div><span><i className={styles.diesel} style={{ height: "62%" }} /></span><p><small>GASOLIO</small><b>12.400 L</b><em>su 20.000 L · autonomia 16 gg</em></p></div><div><span><i className={styles.adblue} style={{ height: "63%" }} /></span><p><small>ADBLUE</small><b>1.260 L</b><em>su 2.000 L · autonomia 24 gg</em></p></div></section>
            <section><header><b>PADERNELLO</b><small>Sede operativa</small></header><div><span><i className={styles.diesel} style={{ height: "52%" }} /></span><p><small>GASOLIO</small><b>7.850 L</b><em>su 15.000 L · autonomia 12 gg</em></p></div><div><span><i className={styles.adblue} style={{ height: "54%" }} /></span><p><small>ADBLUE</small><b>810 L</b><em>su 1.500 L · autonomia 19 gg</em></p></div></section>
          </div>
          <footer>Prossimo rifornimento suggerito: <b>Padernello · gasolio · entro 6 giorni</b></footer>
        </article>

        <article className={`${styles.panel} ${styles.alerts}`} id="alert">
          <header><div><small>CONTROLLO AUTOMATICO</small><b>Alert e azioni suggerite</b></div><span>4 EVENTI</span></header>
          <div><i className={styles.yellow}>!</i><span><b>Pulizia pannelli</b><small>Perdita resa stimata 11% · programma intervento entro 5 giorni.</small></span><em>ALTA</em></div>
          <div><i className={styles.green}>✓</i><span><b>Vasca acqua piovana</b><small>Livello regolare · automazione scarico pronta a 260 m³.</small></span><em>OK</em></div>
          <div><i className={styles.cyan}>ϟ</i><span><b>Scambio ENEL favorevole</b><small>Immissione superiore alla previsione per le prossime 3 ore.</small></span><em>INFO</em></div>
          <div><i className={styles.orange}>◉</i><span><b>Gasolio Padernello</b><small>Inserire ordine pianificato prima del raggiungimento del 35%.</small></span><em>MEDIA</em></div>
        </article>
      </section>

      <footer className={styles.disclaimer}><span><i /> Simulazione operativa Dalecom</span><p>I valori istantanei e storici sono dimostrativi. Le fonti definitive saranno inverter fotovoltaico, BMS accumulo, contatori, colonnine, sensori IoT, telemetria serbatoi e gestionale 1C.</p></footer>
    </section>
  </main>;
}
