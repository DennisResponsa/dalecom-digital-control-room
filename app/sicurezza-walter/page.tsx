"use client";

import { useEffect, useState } from "react";
import { employeeOverallLevel, safetyEmployees } from "../safety-data";
import styles from "./page.module.css";
import interactions from "./interactions.module.css";
import economics from "./economics.module.css";
import harmony from "./harmony.module.css";

const expiring = [
  { when: "OGGI", person: "Marconato Ermens", item: "Idoneità sanitaria scaduta", level: "red" },
  { when: "7 GG", person: "Loriato Flavio", item: "Abilitazione pompa in scadenza", level: "yellow" },
  { when: "15 GG", person: "Kaci Ilirjan", item: "Aggiornamento DPI III categoria", level: "yellow" },
  { when: "30 GG", person: "Mustapha Sow", item: "Rinnovo accesso portale cliente", level: "green" },
];

const staticMap = { zoom: 6, width: 518, height: 666, centerLat: 41.9, centerLon: 12.6 };
const mapSites = [
  { city: "Bareggio", site: "MI Nord Ovest", lat: 45.4777, lon: 8.996, level: "red" },
  { city: "Milano", site: "Cantieri Area B/C", lat: 45.4642, lon: 9.19, level: "yellow" },
  { city: "Mantova", site: "Cantiere attivo", lat: 45.1564, lon: 10.7914, level: "green" },
  { city: "Modena", site: "Vera Costruzioni", lat: 44.6471, lon: 10.9252, level: "green" },
  { city: "Bologna", site: "SEAF", lat: 44.4949, lon: 11.3426, level: "yellow" },
  { city: "Padernello", site: "Sede operativa", lat: 45.68383, lon: 12.12375, level: "green" },
  { city: "Vicenza", site: "EdilDesign", lat: 45.5455, lon: 11.5354, level: "green" },
  { city: "Cittadella", site: "Noleggio", lat: 45.65, lon: 11.783333, level: "green" },
  { city: "Marghera", site: "Cantiere", lat: 45.475811, lon: 12.224781, level: "yellow" },
  { city: "Trieste", site: "Piccola Sicilia", lat: 45.6495, lon: 13.7768, level: "red" },
  { city: "Roma", site: "ColaBeton", lat: 41.9028, lon: 12.4964, level: "green" },
] as const;

const worldPixel = (latitude: number, longitude: number) => {
  const size = 256 * 2 ** staticMap.zoom;
  const latitudeRadians = latitude * Math.PI / 180;
  return {
    x: ((longitude + 180) / 360) * size,
    y: ((1 - Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI) / 2) * size,
  };
};
const mapCenter = worldPixel(staticMap.centerLat, staticMap.centerLon);
const mapOrigin = { x: mapCenter.x - staticMap.width / 2, y: mapCenter.y - staticMap.height / 2 };
const mapTiles = Array.from({ length: Math.ceil((mapOrigin.y + staticMap.height) / 256) - Math.floor(mapOrigin.y / 256) }, (_, row) =>
  Array.from({ length: Math.ceil((mapOrigin.x + staticMap.width) / 256) - Math.floor(mapOrigin.x / 256) }, (_, column) => ({
    x: Math.floor(mapOrigin.x / 256) + column,
    y: Math.floor(mapOrigin.y / 256) + row,
  })),
).flat();
const mapPosition = (latitude: number, longitude: number) => ({
  left: `${((worldPixel(latitude, longitude).x - mapOrigin.x) / staticMap.width) * 100}%`,
  top: `${((worldPixel(latitude, longitude).y - mapOrigin.y) / staticMap.height) * 100}%`,
});
const tilePosition = (x: number, y: number) => ({
  left: `${((x * 256 - mapOrigin.x) / staticMap.width) * 100}%`,
  top: `${((y * 256 - mapOrigin.y) / staticMap.height) * 100}%`,
  width: `${(256 / staticMap.width) * 100}%`,
  height: `${(256 / staticMap.height) * 100}%`,
});

export default function WalterDashboard() {
  const [liveAlerts, setLiveAlerts] = useState<{ id: string; person: string; site: string; level: "red" | "yellow"; detail: string; createdAt: string }[]>([]);
  useEffect(() => {
    try { setLiveAlerts(JSON.parse(window.localStorage.getItem("dalecom-safety-alerts-v1") || "[]")); } catch { setLiveAlerts([]); }
  }, []);
  const go = (url: string) => { window.location.href = url; };
  const counts = safetyEmployees.reduce((value, employee) => ({ ...value, [employeeOverallLevel(employee)]: value[employeeOverallLevel(employee)] + 1 }), { green: 0, yellow: 0, red: 0 });
  return <main className={`${styles.page} ${interactions.clickable} ${harmony.harmonized}`}>
    <aside className={styles.sidebar}><div className={harmony.logo}><img src="/dalecom-logo.png" alt="Dalecom" /><span>Digital Control Room</span></div><a className={harmony.back} href="/demo">← Torna alla regia principale</a><nav><a className={styles.active}>▦ Dashboard</a><a href="/sicurezza?section=passport">♙ Safety Passport</a><a href="/sicurezza?section=academy">▤ Formazione</a><a href="/sicurezza?section=passport">✓ Idoneità e documenti</a><a href="/sicurezza?section=access">⌁ Accessi cliente</a><a href="/logistica">□ Calendario logista</a><a href="/sicurezza?section=onboarding">↗ Onboarding</a><a href="/sicurezza?section=nearMiss">⚑ Near miss</a><a href="/organizzazione">⌘ Organigramma</a><a href="/organizzazione?view=mansionari">☷ Mansionari</a></nav><footer><b>CEO</b><span>Vista direzionale integrata</span></footer></aside>
    <section className={styles.content}>
      <header className={economics.ceoHeader}><div><small>13 · CONTROL ROOM · CEO</small><h1>Dashboard direzionale</h1><p>Dalecom Tecnologies; AI, Tokenizzazione, BTC-EUR-C e tanto ma tanto altro...</p></div><div><span>31/08/2026</span><a href="/organizzazione">Organigramma</a><a href="/demo">Regia principale</a></div></header>
      <section className={styles.filters}><button>Tutte le sedi⌄</button><button>Tutti i cantieri⌄</button><button>Tutto il personale⌄</button><span><i /> Dati demo aggiornati ora</span></section>

      <section className={economics.sectionHead}><div><small>ECONOMIA E PERFORMANCE</small><b>Controllo economico in tempo reale</b></div><span>Dati demo · fonte futura 1C</span></section>
      <section className={economics.economicKpis}>
        <article role="link" tabIndex={0} onClick={() => go("/governance")}><small>FATTURATO MESE</small><b>€ 1.850.000</b><em>↑ 12,5% vs mese precedente</em><span>DEMO · FONTE FUTURA 1C</span></article>
        <article role="link" tabIndex={0} onClick={() => go("/governance")}><small>EBITDA MESE</small><b>€ 326.000</b><em>17,6% del fatturato</em><span>DEMO · FONTE FUTURA 1C</span></article>
        <article role="link" tabIndex={0} onClick={() => go("/governance")}><small>MARGINALITÀ MEDIA</small><b>24,7%</b><em>↓ 1,3% vs mese precedente</em><span>DEMO · FONTE FUTURA 1C</span></article>
        <article role="link" tabIndex={0} onClick={() => go("/governance")}><small>COSTI RICORRENTI</small><b>€ 496.000</b><em>27% del fatturato mensile</em><span>DEMO · FONTE FUTURA 1C</span></article>
        <article role="link" tabIndex={0} onClick={() => go("/hr")}><small>COSTO ORA AZIENDA</small><b>€ 41,80</b><em>media ponderata del personale</em><span>DEMO · FONTE FUTURA 1C</span></article>
        <article role="link" tabIndex={0} onClick={() => go("/governance")}><small>CASSA E BANCA</small><b>€ 1.125.000</b><em>copertura 2,3 mesi costi ricorrenti</em><span>DEMO · FONTE FUTURA 1C</span></article>
      </section>
      <section className={economics.economicDetails}>
        <article><header><b>COSTI RICORRENTI MENSILI</b><a href="/governance">Apri controllo economico →</a></header><div className={economics.costRows}><span><b>Personale</b><i><em style={{width:"78%"}} /></i><strong>€ 286.000</strong></span><span><b>Leasing e noleggi</b><i><em style={{width:"42%"}} /></i><strong>€ 94.000</strong></span><span><b>Sedi, energia e utenze</b><i><em style={{width:"30%"}} /></i><strong>€ 48.000</strong></span><span><b>Assicurazioni</b><i><em style={{width:"19%"}} /></i><strong>€ 21.000</strong></span><span><b>Software e servizi</b><i><em style={{width:"17%"}} /></i><strong>€ 18.000</strong></span><span><b>Altri costi ricorrenti</b><i><em style={{width:"23%"}} /></i><strong>€ 29.000</strong></span></div><footer>Dati demo · conti, centri di costo e consuntivi saranno alimentati da 1C</footer></article>
        <article><header><b>EFFICIENZA DEL LAVORO</b><a href="/hr">Apri HR →</a></header><div className={economics.hourCost}><div><small>COSTO ORA DIRETTO</small><b>€ 29,40</b><span>retribuzione + oneri</span></div><div><small>COSTO ORA AZIENDA</small><b>€ 41,80</b><span>inclusi costi indiretti</span></div><div><small>RICAVO MEDIO/ORA</small><b>€ 68,20</b><span>servizi e noleggio a caldo</span></div><div><small>MARGINE MEDIO/ORA</small><b>€ 26,40</b><span>38,7% sul ricavo medio</span></div></div><footer>Dati demo · ore, costo lavoro e commesse saranno riconciliati da 1C</footer></article>
        <article><header><b>PIPELINE E COPERTURA</b><a href="/governance">Apri ordini →</a></header><div className={economics.pipeline}><span><small>PREVENTIVI APERTI</small><b>€ 5.480.000</b></span><span><small>ORDINI ACQUISITI</small><b>€ 2.210.000</b></span><span><small>BACKLOG</small><b>€ 4.350.000</b></span><span><small>COPERTURA COSTI FISSI</small><b>8,7 mesi</b></span></div><footer>Dati demo · fonte futura CRM, ordini e commesse 1C</footer></article>
      </section>

      <section className={harmony.mapSection}>
        <header><div><small>MAPPA OPERATIVA NAZIONALE</small><b>Cantieri, sedi e squadre sul territorio</b></div><div><span><i className={harmony.live} /> 11 posizioni demo</span><a href="/logistica">Apri calendario logista →</a></div></header>
        <div className={harmony.mapLayout}>
          <div className={harmony.mapFrame}>
            <div className={harmony.mapTiles} role="img" aria-label="Carta geografica fissa dei cantieri Dalecom in Italia">
              {mapTiles.map((tile) => <img key={`${tile.x}-${tile.y}`} className={harmony.mapTile} src={`https://tile.openstreetmap.org/${staticMap.zoom}/${tile.x}/${tile.y}.png`} style={tilePosition(tile.x, tile.y)} alt="" draggable={false} />)}
            </div>
            {mapSites.map((location) => <a key={location.city} href="/logistica" className={`${harmony.flag} ${harmony[location.level]}`} style={mapPosition(location.lat, location.lon)} title={`${location.city} · ${location.site}`}><i>⚑</i><span><b>{location.city}</b><small>{location.site}</small></span></a>)}
            <div className={harmony.mapLegend}><span><i className={harmony.green} />Operativo</span><span><i className={harmony.yellow} />Attenzione</span><span><i className={harmony.red} />Critico</span></div>
            <a className={harmony.mapAttribution} href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
          </div>
          <aside className={harmony.sitePanel} aria-label="Elenco delle posizioni operative">
            <header><small>POSIZIONI VISIBILI</small><b>Dettaglio operativo</b></header>
            <div>{mapSites.map((location) => <a key={location.city} href="/logistica"><i className={harmony[location.level]} /><span><b>{location.city}</b><small>{location.site}</small></span><em>Apri →</em></a>)}</div>
            <footer>Seleziona una posizione per aprire la pianificazione nel calendario del logista.</footer>
          </aside>
        </div>
        <footer>Mappa e posizioni dimostrative · fonte futura: cantieri, commesse e coordinate da 1C; mezzi e telemetria da sistema GPS.</footer>
      </section>

      <section className={economics.sectionHead}><div><small>PERSONE, SICUREZZA E FORMAZIONE</small><b>Prontezza operativa e conformità</b></div><span>Dati demo · fonte futura 1C e moduli HSE</span></section>
      <section className={styles.kpis}>
        <article role="link" tabIndex={0} onClick={() => go("/sicurezza?section=passport")}><small>DOCUMENTAZIONE COMPLETA</small><b>82,6%</b><em>Obiettivo &gt;98%</em><div><i style={{width:"82.6%"}} /></div></article>
        <article role="link" tabIndex={0} onClick={() => go("/sicurezza?section=passport")}><small>DIPENDENTI READY</small><b>{counts.green}</b><em className={styles.up}>↑ assegnabili subito</em><div className={styles.spark}><i/><i/><i/><i/><i/><i/></div></article>
        <article role="link" tabIndex={0} onClick={() => go("/sicurezza?section=passport")}><small>DOCUMENTI SCADUTI</small><b>{counts.red}</b><em className={styles.down}>Obiettivo 0</em><div className={styles.sparkRed}><i/><i/><i/><i/><i/><i/></div></article>
        <article role="link" tabIndex={0} onClick={() => go("/sicurezza?section=academy")}><small>FORMAZIONE NEI TERMINI</small><b>91%</b><em>Obiettivo 100%</em><div><i style={{width:"91%"}} /></div></article>
        <article role="link" tabIndex={0} onClick={() => go("/sicurezza?section=access")}><small>ACCESSI CLIENTE PRONTI</small><b>88%</b><em>Obiettivo &gt;95%</em><div><i style={{width:"88%"}} /></div></article>
      </section>

      <section className={styles.grid}>
        <article className={styles.readiness}><header><b>READINESS DEL PERSONALE</b><a href="/sicurezza">Vedi fascicoli →</a></header><div className={styles.donut}><div><b>{safetyEmployees.length}</b><span>dipendenti</span></div></div><ul><li><i className={styles.g}/><span>Cantiere ready</span><b>{counts.green}</b></li><li><i className={styles.y}/><span>In attenzione</span><b>{counts.yellow}</b></li><li><i className={styles.r}/><span>Non assegnabili</span><b>{counts.red}</b></li></ul></article>
        <article className={styles.training}><header><b>PIANO FORMAZIONE · PROSSIMI 90 GIORNI</b><span>42 attività</span></header><div className={styles.bars}><label>Formazione specifica <i><b style={{width:"76%"}} /></i><em>12</em></label><label>Abilitazioni pompe <i><b style={{width:"58%"}} /></i><em>9</em></label><label>DPI III categoria <i><b style={{width:"44%"}} /></i><em>7</em></label><label>Preposti <i><b style={{width:"31%"}} /></i><em>5</em></label><label>Emergenze <i><b style={{width:"56%"}} /></i><em>9</em></label></div></article>
        <article className={styles.alerts}><header><b>{liveAlerts.length ? "ALERT DAL LOGISTA" : "SCADENZE E AZIONI"}</b><span>{liveAlerts.length ? `${liveAlerts.length} eventi registrati` : "Priorità automatica"}</span></header>{(liveAlerts.length ? liveAlerts.slice(0,4).map((item) => ({ when: "ORA", person: item.person, item: `${item.site} · ${item.detail}`, level: item.level })) : expiring).map((item) => <div key={item.person+item.item} role="link" tabIndex={0} onClick={() => go(`/organizzazione?employee=${encodeURIComponent(item.person)}`)}><i className={styles[item.level]}>!</i><span><b>{item.person}</b><small>{item.item}</small></span><em>{item.when}</em></div>)}</article>

        <article className={styles.gate}><header><b>CONTROLLO ACCESSI CANTIERE</b><span>Prossime partenze</span></header><div role="link" tabIndex={0} onClick={() => go("/sicurezza?section=access")}><strong>VARNA</strong><span>4 operatori</span><b className={styles.blocked}>1 BLOCCATO</b></div><div role="link" tabIndex={0} onClick={() => go("/sicurezza?section=access")}><strong>MODENA</strong><span>3 operatori</span><b className={styles.ready}>READY</b></div><div role="link" tabIndex={0} onClick={() => go("/sicurezza?section=access")}><strong>ROMA</strong><span>3 operatori</span><b className={styles.warning}>1 ATTENZIONE</b></div><footer><a href="/logistica">Apri calendario logista →</a></footer></article>
        <article className={styles.effectiveness}><header><b>EFFICACIA DELLA FORMAZIONE</b><span>Ultimi 6 mesi</span></header><div className={styles.metrics}><div role="link" tabIndex={0} onClick={() => go("/sicurezza?section=academy")}><small>TEST AL PRIMO TENTATIVO</small><b>87%</b><span>↑ 6%</span></div><div role="link" tabIndex={0} onClick={() => go("/sicurezza?section=nearMiss")}><small>NEAR MISS FORMATIVI</small><b>3</b><span>↓ 40%</span></div><div role="link" tabIndex={0} onClick={() => go("/sicurezza?section=academy")}><small>FORMAZIONE INTERNA</small><b>64%</b><span>↑ 18%</span></div><div role="link" tabIndex={0} onClick={() => go("/sicurezza?section=onboarding")}><small>ONBOARDING → READY</small><b>8 gg</b><span>− 11 giorni</span></div></div></article>
        <article className={styles.flow}><header><b>AUTOMAZIONI ATTIVE</b><span>Safety → Logistica → CEO</span></header><ol><li><i>1</i><span>Scadenza rilevata</span></li><li><i>2</i><span>Alert HSE e CEO</span></li><li><i>3</i><span>Blocco assegnazione</span></li><li><i>4</i><span>Corso o documento</span></li><li><i>5</i><span>Rilascio automatico</span></li></ol></article>
      </section>
    </section>
  </main>;
}
