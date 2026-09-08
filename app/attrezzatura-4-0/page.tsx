"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Machine = {
  id: string;
  name: string;
  family: string;
  source: "Cleve" | "Diaboard da verificare";
  status: "In attesa token" | "Da associare";
  description: string;
};

const machines: Machine[] = [
  {
    id: "DA-MEZ-CING-TB30",
    name: "Turbosol TB30 Cingolata",
    family: "Pompa per calcestruzzo",
    source: "Cleve",
    status: "In attesa token",
    description: "Macchina già presente nel preventivatore Dalecom. L’identificativo del portale verrà associato alla prima sincronizzazione.",
  },
  {
    id: "DA-MEZ-MASSETTI-TRANSMAT250",
    name: "Turbosol Transmat 250",
    family: "Pompa per massetti",
    source: "Diaboard da verificare",
    status: "Da associare",
    description: "Macchina già presente nel preventivatore Dalecom. Portale e codice macchina saranno confermati dai dati API.",
  },
];

const capabilities = [
  ["Posizione", "Coordinate, velocità, altitudine e data GPS"],
  ["Telemetria", "Valori macchina e storico sensori"],
  ["Eventi", "Stato operativo e comunicazioni ricevute"],
  ["Allarmi", "Anomalie attive, soglie e durata"],
  ["Attività", "Task assegnati e stato di esecuzione"],
  ["Manutenzione", "Ore macchina e segnali utili all’officina"],
] as const;

export default function EquipmentFourZeroPage() {
  const [selectedId, setSelectedId] = useState(machines[0].id);
  const selected = machines.find((machine) => machine.id === selectedId) || machines[0];

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand} aria-label="Dalecom"><i /><strong>DALECOM</strong><span>Attrezzatura 4.0</span></div>
        <nav><a href="/demo">← Regia principale</a><a href="/officina">Officina e manutenzione →</a></nav>
      </header>

      <section className={styles.hero}>
        <div><small>MODULO 17 · MACCHINE CONNESSE</small><h1>Le Turbosol entrano<br /><em>nella regia Dalecom.</em></h1><p>Una vista unica per collegare anagrafica, posizione, telemetria, sensori, allarmi e manutenzione. I dati live si attiveranno con le credenziali API Dalecom.</p></div>
        <div className={styles.connection}><i /><span><b>Collegamento predisposto</b><small>Nessun dato simulato come live</small></span></div>
      </section>

      <section className={styles.kpis}>
        <article><small>TURBOSOL CENSITE</small><strong>{machines.length}</strong><span>Anagrafica iniziale Dalecom</span></article>
        <article><small>SORGENTI DISPONIBILI</small><strong>2</strong><span>Cleve · Diaboard</span></article>
        <article className={styles.pending}><small>DATI LIVE</small><strong>In attesa</strong><span>Serve token Cleve Dalecom</span></article>
        <article><small>INTEGRAZIONE</small><strong>1C</strong><span>JSON normalizzato previsto</span></article>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.machineList}>
          <header><small>PARCO TURBOSOL</small><b>Seleziona una macchina</b></header>
          {machines.map((machine) => (
            <button className={machine.id === selected.id ? styles.selected : ""} key={machine.id} onClick={() => setSelectedId(machine.id)}>
              <i>TS</i><span><b>{machine.name}</b><small>{machine.family}</small></span><em>›</em>
            </button>
          ))}
          <footer><i>+</i><span><b>Sincronizzazione automatica</b><small>Le altre Turbosol compariranno dal portale senza essere inserite a mano.</small></span></footer>
        </aside>

        <div className={styles.detail}>
          <header className={styles.detailHead}>
            <div><small>ATTREZZATURA SELEZIONATA</small><h2>{selected.name}</h2><p>{selected.family} · codice Dalecom {selected.id}</p></div>
            <span>{selected.status}</span>
          </header>
          <div className={styles.sourceStrip}><div><small>SORGENTE PREVISTA</small><b>{selected.source}</b></div><div><small>ULTIMA COMUNICAZIONE</small><b>Non disponibile</b></div><div><small>POSIZIONE</small><b>In attesa dei dati API</b></div></div>
          <p className={styles.machineNote}>{selected.description}</p>
          <div className={styles.capabilityGrid}>
            {capabilities.map(([title, description]) => <article key={title}><i>{title.slice(0, 1)}</i><div><b>{title}</b><span>{description}</span></div><small>Pronto</small></article>)}
          </div>
        </div>
      </section>

      <section className={styles.apiFlow}>
        <header><div><small>FLUSSO DATI PREDISPOSTO</small><h2>Dalla macchina alla decisione.</h2></div><span>Solo lettura nella prima fase</span></header>
        <div><article><b>01</b><span><strong>Turbosol</strong><small>Cleve / Diaboard</small></span></article><i>→</i><article><b>02</b><span><strong>Connettore Dalecom</strong><small>Normalizzazione JSON</small></span></article><i>→</i><article><b>03</b><span><strong>1C</strong><small>Anagrafiche e manutenzioni</small></span></article><i>→</i><article><b>04</b><span><strong>Regia</strong><small>Stati, allarmi e storico</small></span></article></div>
      </section>

      <footer className={styles.footer}><b>DALECOM</b><span>Modulo 17 · Attrezzatura 4.0</span><small>Stato API dichiarato esplicitamente · nessun dato macchina inventato</small></footer>
    </main>
  );
}
