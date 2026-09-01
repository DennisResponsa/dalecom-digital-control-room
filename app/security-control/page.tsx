"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const cameras = [
  { id: "CAM 01", name: "Ingresso e parcheggio", position: "topLeft", status: "ONLINE", people: 3 },
  { id: "CAM 04", name: "Officina pompe", position: "topRight", status: "ONLINE", people: 6 },
  { id: "CAM 07", name: "Capannone ricambi", position: "bottomLeft", status: "ONLINE", people: 9 },
  { id: "CAM 11", name: "Uffici e tornelli", position: "bottomRight", status: "ONLINE", people: 8 },
] as const;

const presence = [
  { person: "Marco Rossi", role: "Officina", entry: "07:42", area: "Officina", badge: "DLC-018", state: "Presente" },
  { person: "Luca Bianchi", role: "Magazzino", entry: "07:51", area: "Capannone", badge: "DLC-031", state: "Presente" },
  { person: "Anna Ferri", role: "Amministrazione", entry: "08:03", area: "Ufficio", badge: "DLC-006", state: "Presente" },
  { person: "Paolo Rinaldi", role: "Tecnico", entry: "08:11", area: "Officina", badge: "DLC-044", state: "Presente" },
  { person: "Sara Conti", role: "Commerciale", entry: "08:24", area: "Ufficio", badge: "DLC-052", state: "Presente" },
  { person: "Mustapha Sow", role: "Operatore", entry: "08:32", area: "Capannone", badge: "DLC-061", state: "Presente" },
] as const;

const visitors = [
  { name: "Alberto Neri", company: "Enel X", reason: "Verifica colonnine", host: "Walter", in: "09:12", status: "In sede" },
  { name: "Giulia Valli", company: "Tecnoimpianti", reason: "Manutenzione allarme", host: "Marco Rossi", in: "09:44", status: "In sede" },
  { name: "Stefano Riva", company: "Beton Service", reason: "Incontro commerciale", host: "Sara Conti", in: "10:18", status: "In sede" },
] as const;

const movements = [
  ["10:42:18", "Marco Rossi", "Officina → Capannone", "badge"],
  ["10:40:51", "Anna Ferri", "Ingresso uffici", "face"],
  ["10:38:07", "Luca Bianchi", "Capannone → Piazzale", "badge"],
  ["10:35:44", "Alberto Neri", "Reception → Area colonnine", "visitor"],
  ["10:31:22", "Paolo Rinaldi", "Foresteria → Officina", "badge"],
] as const;

export default function SecurityControlRoom() {
  const [tick, setTick] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [alarmDemo, setAlarmDemo] = useState(false);
  const [visitorList, setVisitorList] = useState([...visitors]);
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const now = useMemo(() => new Date(2026, 8, 1, 10, 43, tick % 60).toLocaleTimeString("it-IT"), [tick]);
  const registerVisitor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    if (!name) return;
    setVisitorList((current) => [...current, { name, company: String(data.get("company") || "Visitatore"), reason: String(data.get("reason") || "Visita"), host: String(data.get("host") || "Reception"), in: "10:43", status: "In sede" }]);
    setShowVisitorForm(false);
  };

  return <main className={styles.page}>
    <aside className={styles.sidebar}>
      <div className={styles.logo}><img src="/dalecom-logo.png" alt="Dalecom" /><span>Security Control</span></div>
      <a className={styles.back} href="/demo">← Torna alla regia principale</a>
      <nav><a className={styles.active} href="#control">▦ Sala controllo</a><a href="#tvcc">◉ Telecamere TVCC</a><a href="#drone">⌁ Drone di verifica</a><a href="#accessi">▣ Badge e presenze</a><a href="#movimenti">↗ Movimenti aree</a><a href="#visitatori">♙ Registro visitatori</a><a href="#eventi">! Eventi e allarmi</a></nav>
      <footer><b>DALECOM</b><span>Protezione integrata di persone, sedi e mezzi</span></footer>
    </aside>

    <section className={styles.content} id="control">
      <header className={styles.header}><div><small>16 · PHYSICAL SECURITY CONTROL ROOM</small><h1>TVCC, allarme e controllo accessi</h1><p>Persone, spazi ed eventi sotto controllo. In tempo reale.</p></div><div><span className={styles.time}>{now}</span><span className={styles.live}><i /> Tutti i sistemi operativi</span></div></header>

      <section className={styles.kpis}>
        <article><small>TELECAMERE ONLINE</small><b>12/12</b><em>registrazione continua</em><i style={{width:"100%"}} /></article>
        <article><small>PERSONE IN SEDE</small><b>43</b><em>40 dipendenti · 3 visitatori</em><i style={{width:"72%"}} /></article>
        <article><small>ACCESSI OGGI</small><b>87</b><em>0 badge respinti</em><i style={{width:"81%"}} /></article>
        <article><small>ZONE ALLARME</small><b>28/28</b><em>perimetro inserito</em><i style={{width:"100%"}} /></article>
        <article><small>DRONE SECURITY</small><b>{alarmDemo ? "IN VOLO" : "READY"}</b><em>{alarmDemo ? "verifica evento demo" : "autonomia 34 minuti"}</em><i style={{width:alarmDemo?"48%":"92%"}} /></article>
      </section>

      <section className={styles.controlGrid}>
        <article className={styles.tvcc} id="tvcc">
          <header><div><small>VIDEOSORVEGLIANZA</small><b>Telecamere fisse · Sede di Paese</b></div><span><i /> LIVE</span></header>
          <div className={styles.cameraGrid}>{cameras.map((camera, index) => <button key={camera.id} onClick={() => setSelectedCamera(index)} className={`${styles.camera} ${styles[camera.position]} ${selectedCamera===index?styles.selected:""}`}><span className={styles.cameraImage} /><i className={styles.scanline} /><header><b>{camera.id}</b><em>{camera.status}</em></header><footer><span>{camera.name}</span><small>{camera.people} persone rilevate · {now}</small></footer></button>)}</div>
          <footer><span>Registrazione: 30 giorni</span><span>Analisi movimento attiva</span><span>Privacy mask aree pubbliche</span></footer>
        </article>

        <article className={`${styles.drone} ${alarmDemo?styles.droneActive:""}`} id="drone">
          <header><div><small>DRONE AUTONOMO DI VERIFICA</small><b>{alarmDemo ? "Evento in verifica · Piazzale Nord" : "Presidio aereo in stand-by"}</b></div><span>{alarmDemo ? "ESERCITAZIONE" : "READY"}</span></header>
          <div className={styles.droneRadar}><i className={styles.radarPulse}/><div className={styles.droneIcon}>◆<span>DR-01</span></div>{alarmDemo&&<div className={styles.target}><i/><span>Sagoma rilevata</span></div>}<em>N</em></div>
          <div className={styles.droneMetrics}><span><small>STATO</small><b>{alarmDemo?"Tracking assistito":"Base di ricarica"}</b></span><span><small>DISTANZA SICUREZZA</small><b>≥ 2,5 m</b></span><span><small>BATTERIA</small><b>{alarmDemo?"74%":"92%"}</b></span><span><small>VIDEO</small><b>Live cifrato</b></span></div>
          <div className={styles.waterSystem}><i>≈</i><span><b>Nebulizzazione idrica di deterrenza</b><small>{alarmDemo?"Pronta · attivazione solo con consenso operatore":"Disabilitata in stand-by · interblocco persone attivo"}</small></span><strong>{alarmDemo?"IN ATTESA":"SAFE"}</strong></div>
          <button className={styles.demoButton} onClick={()=>setAlarmDemo((value)=>!value)}>{alarmDemo?"Termina esercitazione":"Simula allarme perimetrale"}</button>
          <p>Il drone verifica e segue l’evento mantenendo la distanza minima. Nessuna azione fisica parte senza conferma umana e controllo dell’area.</p>
        </article>

        <article className={styles.areas} id="movimenti">
          <header><div><small>PRESENZA PER AREA</small><b>Distribuzione persone</b></div><span>43 PRESENTI</span></header>
          <div className={styles.areaMap}><section className={styles.office}><b>UFFICI</b><strong>14</strong><span>12 dip. · 2 visit.</span></section><section className={styles.workshop}><b>OFFICINA</b><strong>8</strong><span>8 dipendenti</span></section><section className={styles.warehouse}><b>CAPANNONE</b><strong>16</strong><span>15 dip. · 1 visit.</span></section><section className={styles.guesthouse}><b>FORESTERIA</b><strong>5</strong><span>5 dipendenti</span></section><i className={styles.movingDot} /><i className={styles.movingDotTwo} /></div>
          <footer><i /> Aggiornamento da badge, varchi e sensori di presenza</footer>
        </article>

        <article className={styles.events} id="eventi">
          <header><div><small>EVENTI DI SICUREZZA</small><b>Ultime 24 ore</b></div><span>0 CRITICI</span></header>
          <div><i className={styles.green}>✓</i><span><b>Perimetro Nord ripristinato</b><small>Verifica automatica completata</small></span><em>10:21</em></div><div><i className={styles.yellow}>!</i><span><b>Porta officina aperta oltre soglia</b><small>Richiusa dopo 2 min 14 sec</small></span><em>09:48</em></div><div><i className={styles.cyan}>◉</i><span><b>Visitatori registrati</b><small>Tre badge temporanei attivi</small></span><em>09:44</em></div><div><i className={styles.green}>✓</i><span><b>Test allarme giornaliero</b><small>28 zone verificate</small></span><em>07:30</em></div>
        </article>

        <article className={styles.accesses} id="accessi">
          <header><div><small>CONTROLLO ACCESSI</small><b>Presenze e timbrature digitali</b></div><span>40 DIPENDENTI IN SEDE</span></header>
          <div className={styles.table}><div className={styles.tableHead}><span>Persona</span><span>Badge</span><span>Ingresso</span><span>Area attuale</span><span>Stato</span></div>{presence.map((item)=><div key={item.badge}><span><i>{item.person.split(" ").map(word=>word[0]).join("")}</i><b>{item.person}</b><small>{item.role}</small></span><span>{item.badge}</span><span>{item.entry}</span><span>{item.area}</span><span><em>{item.state}</em></span></div>)}</div>
          <footer><span>Badge attivi <b>66</b></span><span>Fuori sede <b>26</b></span><span>Timbrature oggi <b>87</b></span><span>Anomalie <b>0</b></span></footer>
        </article>

        <article className={styles.movementLog}>
          <header><div><small>MOVIMENTI INTERNI</small><b>Transiti in tempo reale</b></div><span><i /> LIVE</span></header>
          {movements.map(([time,person,path,type])=><div key={time}><i className={styles[type]}>{type==="badge"?"▣":type==="face"?"◉":"♙"}</i><span><b>{person}</b><small>{path}</small></span><em>{time}</em></div>)}
        </article>

        <article className={styles.visitors} id="visitatori">
          <header><div><small>REGISTRO VISITATORI</small><b>Ospiti presenti in sede</b></div><button onClick={()=>setShowVisitorForm((value)=>!value)}>{showVisitorForm?"Annulla":"+ Registra visitatore"}</button></header>
          {showVisitorForm&&<form className={styles.visitorForm} onSubmit={registerVisitor}><input name="name" placeholder="Nome e cognome *" required/><input name="company" placeholder="Azienda"/><input name="reason" placeholder="Motivo della visita"/><input name="host" placeholder="Referente Dalecom"/><button type="submit">Registra ingresso</button></form>}
          <div>{visitorList.map((visitor)=><section key={visitor.name}><i>{visitor.name.split(" ").map(word=>word[0]).join("")}</i><span><b>{visitor.name}</b><small>{visitor.company} · {visitor.reason}</small></span><em><small>REFERENTE</small>{visitor.host}</em><em><small>INGRESSO</small>{visitor.in}</em><strong>IN SEDE</strong></section>)}</div>
          <footer>Badge visitatori con scadenza automatica all’uscita o alle ore 19:00.</footer>
        </article>
      </section>

      <footer className={styles.disclaimer}><b>DEMO OPERATIVA</b><span>Feed, presenze ed eventi sono simulati. Le fonti definitive saranno TVCC, centrale allarme, controllo accessi, badge digitali, sensori e registro visitatori.</span></footer>
    </section>
  </main>;
}
