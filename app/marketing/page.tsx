"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type Section = "control" | "calendar" | "content" | "social" | "catalogues" | "campaigns" | "leads" | "analytics";

const sections: { id: Section; label: string; icon: string }[] = [
  { id: "control", label: "Control center", icon: "⌂" },
  { id: "calendar", label: "Calendario", icon: "□" },
  { id: "content", label: "Contenuti", icon: "▧" },
  { id: "social", label: "Social hub", icon: "◎" },
  { id: "catalogues", label: "Cataloghi", icon: "▤" },
  { id: "campaigns", label: "Campagne", icon: "◇" },
  { id: "leads", label: "Lead", icon: "↗" },
  { id: "analytics", label: "Analytics", icon: "⌁" },
];

const channelData = [
  { name: "Instagram", mark: "IG", status: "Collegato", metric: "18,4k", label: "visualizzazioni", color: "pink" },
  { name: "Facebook", mark: "f", status: "Collegato", metric: "12,8k", label: "copertura", color: "blue" },
  { name: "LinkedIn", mark: "in", status: "Collegato", metric: "414", label: "follower", color: "cyan" },
  { name: "YouTube", mark: "▶", status: "Collegato", metric: "8,9k", label: "minuti visti", color: "red" },
  { name: "TikTok", mark: "♪", status: "Da attivare", metric: "—", label: "nuovo canale", color: "dark" },
];

const libraryItems = [
  { type: "CATALOGO", title: "Grandi opere 2026", meta: "PDF · IT/EN/FR · v4.2", status: "Ufficiale", tone: "green" },
  { type: "CATALOGO", title: "Piccole opere 2026", meta: "PDF · IT/EN · v3.8", status: "Ufficiale", tone: "green" },
  { type: "MACCHINA", title: "Turbosol TB30 Cingolata", meta: "24 foto · 7 video · scheda tecnica", status: "Approvato", tone: "blue" },
  { type: "CANTIERE", title: "Pompaggio in quota · Milano", meta: "18 foto · 3 video · liberatoria OK", status: "Da usare", tone: "orange" },
  { type: "MACCHINA", title: "Putzmeister 2110", meta: "12 foto · scheda da aggiornare", status: "Revisione", tone: "yellow" },
  { type: "CORPORATE", title: "Dalecom · dal 1975", meta: "Presentazione · v6.1", status: "Ufficiale", tone: "green" },
];

const week = [
  { day: "LUN 7", title: "Macchina della settimana", channel: "LinkedIn · Facebook", status: "Programmato", color: "blue" },
  { day: "MAR 8", title: "TB30 in cantiere", channel: "Reel · TikTok", status: "Da approvare", color: "orange" },
  { day: "MER 9", title: "Lo sapevi che?", channel: "Instagram Story", status: "Bozza AI", color: "violet" },
  { day: "GIO 10", title: "Sicurezza in quota", channel: "LinkedIn · Sito", status: "Programmato", color: "green" },
  { day: "VEN 11", title: "Putzmeister 2110", channel: "YouTube Short", status: "Montaggio", color: "red" },
  { day: "SAB 12", title: "Backstage grande opera", channel: "Instagram · Facebook", status: "Materiale pronto", color: "cyan" },
];

const leads = [
  { company: "Costruzioni Nord S.r.l.", interest: "Turbosol TB30", score: 92, source: "LinkedIn", value: "€ 38.500", action: "Richiamare oggi" },
  { company: "Edilpompaggi Veneto", interest: "Noleggio con operatore", score: 84, source: "Google", value: "€ 24.800", action: "Preventivo inviato" },
  { company: "Galleria Centro Italia", interest: "Braccio stazionario", score: 78, source: "YouTube", value: "€ 61.000", action: "Qualificare" },
  { company: "Calcestruzzi Est", interest: "Putzmeister 2110", score: 69, source: "Instagram", value: "€ 17.200", action: "Nuovo lead" },
];

export default function MarketingControlCenter() {
  const [section, setSection] = useState<Section>("control");
  const [notice, setNotice] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("Turbosol TB30 Cingolata");
  const [approved, setApproved] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState(["Instagram", "Facebook", "LinkedIn"]);

  const sectionTitle = useMemo(() => sections.find((item) => item.id === section)?.label ?? "Control center", [section]);

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function toggleChannel(name: string) {
    setSelectedChannels((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  return <main className={styles.page}>
    {notice && <div className={styles.notice}>{notice}</div>}
    <aside className={styles.sidebar}>
      <div className={styles.logo}><img src="/dalecom-logo.png" alt="Dalecom" /><span>Marketing<br />Control Center</span></div>
      <a className={styles.back} href="/demo">← Torna alla regia principale</a>
      <nav>{sections.map((item) => <button key={item.id} className={section === item.id ? styles.active : ""} onClick={() => setSection(item.id)}><i>{item.icon}</i>{item.label}{item.id === "content" && <b>12</b>}{item.id === "leads" && <b>19</b>}</button>)}</nav>
      <div className={styles.sideStatus}><small>INTEGRAZIONI</small><span><i className={styles.ok} />1C · fonte dati</span><span><i className={styles.ok} />Sito Dalecom</span><span><i className={styles.ok} />4 social collegati</span><span><i className={styles.warn} />TikTok da attivare</span></div>
      <footer><b>DALECOM</b><span>Marketing Automation & Digital Asset Management</span></footer>
    </aside>

    <section className={styles.content}>
      <header className={styles.topbar}>
        <div><small>12 · MARKETING AUTOMATION</small><h1>{sectionTitle}</h1></div>
        <div className={styles.topActions}><span><i /> Dati demo · futura fonte 1C + API</span><button onClick={() => setSection("content")}>＋ Nuovo contenuto</button></div>
      </header>

      {section === "control" && <>
        <section className={styles.hero}>
          <div><small>DALECOM MARKETING</small><h2>Un contenuto.<br /><em>Tutti i canali.</em></h2><p>Dati ufficiali dal gestionale, pubblicazione coordinata e risultati collegati a lead, preventivi e fatturato.</p></div>
          <div className={styles.flow}><span><b>1C</b><small>Dati ufficiali</small></span><i>→</i><span><b>SUPERVISORE</b><small>Contenuto master</small></span><i>→</i><span><b>CANALI</b><small>Social · sito · PDF</small></span></div>
        </section>
        <section className={styles.kpis}>
          <article><small>CONTENUTI UFFICIALI</small><b>347</b><span>+28 dai cantieri</span><i style={{ width: "78%" }} /></article>
          <article className={styles.alertKpi}><small>DA APPROVARE</small><b>12</b><span>4 con priorità alta</span><i style={{ width: "42%" }} /></article>
          <article><small>POST PROGRAMMATI</small><b>18</b><span>prossimi 14 giorni</span><i style={{ width: "65%" }} /></article>
          <article className={styles.alertKpi}><small>BROCHURE DA RIGENERARE</small><b>3</b><span>variazione dati 1C</span><i style={{ width: "28%" }} /></article>
          <article><small>LEAD SETTIMANA</small><b>19</b><span>€ 141.500 potenziale</span><i style={{ width: "72%" }} /></article>
          <article><small>ROI CAMPAGNE</small><b>4,8×</b><span>€ 7.860 investiti</span><i style={{ width: "86%" }} /></article>
        </section>
        <section className={styles.dashboardGrid}>
          <article className={`${styles.panel} ${styles.calendarPanel}`}>
            <header><div><small>CALENDARIO EDITORIALE</small><b>Settimana 7–12 settembre</b></div><button onClick={() => setSection("calendar")}>Apri calendario →</button></header>
            <div className={styles.week}>{week.map((item) => <button key={item.day} onClick={() => notify(`${item.title}: scheda editoriale aperta`)}><small>{item.day}</small><i className={styles[item.color]} /><b>{item.title}</b><span>{item.channel}</span><em>{item.status}</em></button>)}</div>
          </article>
          <article className={`${styles.panel} ${styles.performance}`}>
            <header><div><small>CONTENUTO MIGLIORE</small><b>TB30 · getto in quota</b></div><span>+34%</span></header>
            <div className={styles.postVisual}><div><b>TB30</b><span>60 metri di linea.<br />Un solo flusso.</span></div><strong>▶</strong></div>
            <div className={styles.postMetrics}><span><b>38,6k</b><small>views</small></span><span><b>1.284</b><small>interazioni</small></span><span><b>17</b><small>lead</small></span><span><b>€ 61k</b><small>pipeline</small></span></div>
          </article>
          <article className={`${styles.panel} ${styles.channels}`}>
            <header><div><small>SOCIAL HUB</small><b>Canali e rendimento</b></div><button onClick={() => setSection("social")}>Gestisci →</button></header>
            {channelData.map((item) => <div key={item.name}><i className={styles[item.color]}>{item.mark}</i><span><b>{item.name}</b><small>{item.status}</small></span><em><b>{item.metric}</b><small>{item.label}</small></em></div>)}
          </article>
          <article className={`${styles.panel} ${styles.pipeline}`}>
            <header><div><small>DAL CONTENUTO AL FATTURATO</small><b>Pipeline marketing · mese</b></div><button onClick={() => setSection("analytics")}>Dettaglio →</button></header>
            <div className={styles.funnel}><span style={{ width: "100%" }}>125.000 visualizzazioni</span><span style={{ width: "83%" }}>4.300 visite sito</span><span style={{ width: "66%" }}>620 download</span><span style={{ width: "50%" }}>82 richieste</span><span style={{ width: "37%" }}>41 lead qualificati</span><span style={{ width: "24%" }}>8 ordini</span></div>
            <footer><span><small>FATTURATO ATTRIBUITO</small><b>€ 286.400</b></span><span><small>COSTO MARKETING</small><b>€ 38.700</b></span><span><small>CONVERSIONE</small><b>19,5%</b></span></footer>
          </article>
          <article className={`${styles.panel} ${styles.alerts}`}>
            <header><div><small>AI MARKETING TASKS</small><b>Azioni suggerite</b></div><span>5 APERTE</span></header>
            <button onClick={() => notify("Task assegnato al marketing")}><i>!</i><span><b>TB30 non comunicata da 74 giorni</b><small>Prepara un contenuto tecnico usando le 7 nuove foto.</small></span><em>ALTA</em></button>
            <button onClick={() => notify("Aperta selezione contenuti Milano")}><i>✦</i><span><b>6 nuovi video dal cantiere di Milano</b><small>3 adatti a Reel/TikTok, liberatoria cliente verificata.</small></span><em>AI</em></button>
            <button onClick={() => setSection("catalogues")}><i>↻</i><span><b>3 brochure non allineate a 1C</b><small>Tariffa o caratteristica tecnica modificata.</small></span><em>DATI</em></button>
            <button onClick={() => setSection("leads")}><i>↗</i><span><b>4 lead ad alto interesse senza attività</b><small>Assegna al commerciale entro oggi.</small></span><em>CRM</em></button>
          </article>
        </section>
      </>}

      {section === "calendar" && <section className={styles.workspace}>
        <header><div><small>PIANIFICAZIONE MULTICANALE</small><h2>Calendario editoriale · settembre 2026</h2></div><div><button>‹</button><button>Oggi</button><button>›</button></div></header>
        <div className={styles.calendarHead}>{["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"].map((day) => <b key={day}>{day}</b>)}</div>
        <div className={styles.monthGrid}>{Array.from({ length: 35 }, (_, index) => {
          const day = index - 1;
          const item = week.find((_, itemIndex) => itemIndex + 7 === day);
          return <div key={index} className={day < 1 || day > 30 ? styles.blank : ""}><small>{day > 0 && day <= 30 ? day : ""}</small>{item && <button className={styles[item.color]} onClick={() => notify(`${item.title}: dettaglio aperto`)}><b>{item.title}</b><span>{item.channel}</span><em>{item.status}</em></button>}</div>;
        })}</div>
      </section>}

      {section === "content" && <section className={styles.contentWorkspace}>
        <aside><header><small>LIBRERIA UFFICIALE</small><b>Blocchi disponibili</b></header>{["▧ Foto macchina", "▶ Video cantiere", "Dati 1C", "Testo", "Logo Dalecom", "Call to action", "QR dinamico", "Contatto commerciale"].map((block) => <button draggable key={block}>{block}<span>⠿</span></button>)}</aside>
        <article className={styles.builder}>
          <header><div><small>CONTENUTO MASTER</small><b>TB30 Dalecom al lavoro</b></div><select value={selectedMachine} onChange={(event) => setSelectedMachine(event.target.value)}><option>Turbosol TB30 Cingolata</option><option>Putzmeister 2110</option><option>City Pump 24</option></select></header>
          <div className={styles.canvas}><div className={styles.canvasLogo}><img src="/dalecom-logo.png" alt="Dalecom" /></div><div className={styles.machineVisual}><span>TB30</span><strong>GETTO<br />SENZA LIMITI.</strong><small>DATI SINCRONIZZATI DA 1C</small></div><div className={styles.specs}><span><small>PORTATA</small><b>30 m³/h</b></span><span><small>PRESSIONE</small><b>80 bar</b></span><span><small>SVILUPPO</small><b>fino a 120 m</b></span></div></div>
          <footer><span><i /> Foto approvata · dati tecnici 1C · liberatoria verificata</span><button onClick={() => notify("Anteprima generata per ogni canale")}>Genera varianti AI →</button></footer>
        </article>
        <aside className={styles.publishPanel}><header><small>PUBBLICAZIONE</small><b>Canali di destinazione</b></header>{channelData.map((channel) => <label key={channel.name}><input type="checkbox" checked={selectedChannels.includes(channel.name)} onChange={() => toggleChannel(channel.name)} disabled={channel.name === "TikTok"} /><span><b>{channel.name}</b><small>{channel.name === "TikTok" ? "Connessione necessaria" : "Formato adattato automaticamente"}</small></span></label>)}<button onClick={() => { setApproved(true); notify("Contenuto inviato in approvazione"); }}>{approved ? "✓ In approvazione" : "Invia in approvazione"}</button></aside>
      </section>}

      {section === "social" && <section className={styles.cardsWorkspace}><header><div><small>SOCIAL HUB</small><h2>Un messaggio, linguaggi differenti</h2><p>Ogni variante conserva i dati ufficiali e adatta formato, testo e call to action al canale.</p></div></header><div className={styles.socialCards}>{channelData.map((item, index) => <article key={item.name}><header><i className={styles[item.color]}>{item.mark}</i><span><b>{item.name}</b><small>{item.status}</small></span></header><div className={styles.miniVisual}><b>TB30</b><span>{index === 2 ? "La soluzione tecnica per il pompaggio in quota." : index === 3 ? "Come pompare 60 metri senza perdere produttività." : "60 metri. Un risultato concreto."}</span></div><footer><span>{index === 0 ? "REEL · STORY · POST" : index === 3 ? "SHORT · VIDEO" : "POST · VIDEO"}</span><button onClick={() => notify(`Anteprima ${item.name} aperta`)}>Anteprima</button></footer></article>)}</div></section>}

      {section === "catalogues" && <section className={styles.cardsWorkspace}><header><div><small>DIGITAL ASSET MANAGEMENT</small><h2>Cataloghi e documenti ufficiali</h2><p>Una sola versione valida. Quando cambia un dato in 1C, il sistema segnala ogni documento da rigenerare.</p></div><button onClick={() => notify("Controllo coerenza 1C completato: 3 variazioni")}>↻ Verifica con 1C</button></header><div className={styles.libraryGrid}>{libraryItems.map((item) => <article key={item.title}><i className={styles[item.tone]}>{item.type === "CATALOGO" ? "PDF" : item.type.slice(0, 2)}</i><div><small>{item.type}</small><b>{item.title}</b><span>{item.meta}</span></div><em className={styles[item.tone]}>{item.status}</em><button onClick={() => notify(`${item.title}: dettaglio documento aperto`)}>Apri</button></article>)}</div><div className={styles.catalogueRule}><i>QR</i><span><b>Prezzo e disponibilità sempre aggiornati</b><small>Il QR delle brochure cartacee resta invariato e apre la scheda dinamica collegata al gestionale.</small></span><strong>1C → PDF → SITO</strong></div></section>}

      {section === "campaigns" && <section className={styles.cardsWorkspace}><header><div><small>CAMPAIGN MANAGER</small><h2>Campagne collegate alle vendite</h2><p>Budget, lead, preventivi e fatturato attribuito nello stesso quadro.</p></div><button onClick={() => notify("Nuova campagna creata come bozza")}>＋ Nuova campagna</button></header><div className={styles.campaignTable}><div className={styles.tableHead}><span>Campagna</span><span>Canali</span><span>Budget</span><span>Lead</span><span>Pipeline</span><span>ROAS</span></div>{[
        ["TB30 · grandi distanze", "Google · LinkedIn", "€ 2.400", "18", "€ 96.800", "6,4×"],
        ["Noleggio con operatore", "Meta · Google", "€ 1.850", "12", "€ 48.200", "4,1×"],
        ["Pompaggio in quota", "YouTube · LinkedIn", "€ 1.200", "7", "€ 61.000", "7,8×"],
        ["Dalecom recruiting", "Meta · LinkedIn", "€ 980", "23 CV", "—", "—"],
      ].map((row) => <button key={row[0]} onClick={() => notify(`${row[0]}: report campagna aperto`)}>{row.map((cell) => <span key={cell}>{cell}</span>)}</button>)}</div></section>}

      {section === "leads" && <section className={styles.cardsWorkspace}><header><div><small>MARKETING → CRM → COMMERCIALE</small><h2>Lead generati dai contenuti</h2><p>Interesse, fonte, valore potenziale e prossima attività arrivano direttamente al commerciale.</p></div><button onClick={() => notify("Lead sincronizzati con CRM 1C")}>↻ Sincronizza CRM</button></header><div className={styles.leadGrid}>{leads.map((lead) => <article key={lead.company}><header><span><small>INTERESSE</small><b>{lead.interest}</b></span><strong>{lead.score}<small>/100</small></strong></header><h3>{lead.company}</h3><div><span><small>FONTE</small><b>{lead.source}</b></span><span><small>VALORE POTENZIALE</small><b>{lead.value}</b></span></div><footer><em>{lead.action}</em><button onClick={() => notify(`${lead.company}: scheda CRM aperta`)}>Apri nel CRM →</button></footer></article>)}</div></section>}

      {section === "analytics" && <section className={styles.cardsWorkspace}><header><div><small>BUSINESS ANALYTICS</small><h2>Dal contenuto al fatturato</h2><p>Le metriche social diventano risultati commerciali leggibili dalla direzione.</p></div><span className={styles.period}>01–30 settembre 2026</span></header><div className={styles.analyticsKpis}><article><small>VISUALIZZAZIONI</small><b>125.000</b><em>+18,4% vs mese precedente</em></article><article><small>LEAD QUALIFICATI</small><b>41</b><em>19,5% convertiti in ordine</em></article><article><small>PIPELINE GENERATA</small><b>€ 428.600</b><em>24 preventivi aperti</em></article><article><small>FATTURATO ATTRIBUITO</small><b>€ 286.400</b><em>8 ordini confermati</em></article></div><div className={styles.analyticsGrid}><article><header><b>Fatturato attribuito per canale</b><span>€ 286.400</span></header>{[["Google", 86], ["LinkedIn", 72], ["Instagram", 48], ["YouTube", 61], ["Facebook", 34]].map((row) => <label key={row[0]}><span>{row[0]}</span><i><b style={{ width: `${row[1]}%` }} /></i><em>{row[1]}%</em></label>)}</article><article><header><b>Contenuti → ordini</b><span>8 ordini</span></header><div className={styles.bigFunnel}><i>125K<small>views</small></i><i>4.300<small>visite</small></i><i>620<small>download</small></i><i>82<small>richieste</small></i><i>8<small>ordini</small></i></div></article></div></section>}

      <footer className={styles.footer}><span><b>DALECOM</b> · Marketing Automation & Digital Asset Management</span><small>Dati dimostrativi ove indicato · fonte definitiva 1C, sito e API dei canali</small></footer>
    </section>
  </main>;
}
