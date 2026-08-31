"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { employeeOverallLevel, nearMisses, onboardingCases, safetyCheck, safetyEmployees, siteAccesses, trainingCourses, type SafetyLevel } from "../safety-data";
import styles from "./page.module.css";
import extra from "./sections.module.css";

const levelLabel: Record<SafetyLevel, string> = { green: "Cantiere ready", yellow: "In attenzione", red: "Non assegnabile" };

export default function SafetyPage() {
  const [selectedName, setSelectedName] = useState(safetyEmployees[0].name);
  const [filter, setFilter] = useState<"all" | SafetyLevel>("all");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<"passport" | "academy" | "access" | "onboarding" | "nearMiss">("passport");
  const [courseActions, setCourseActions] = useState<Record<string, string>>({});
  const [accessSent, setAccessSent] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("section");
    if (["passport", "academy", "access", "onboarding", "nearMiss"].includes(requested || "")) setSection(requested as typeof section);
  }, []);
  const selected = safetyEmployees.find((item) => item.name === selectedName) || safetyEmployees[0];
  const shown = useMemo(() => safetyEmployees.filter((employee) => {
    const matchesLevel = filter === "all" || employeeOverallLevel(employee) === filter;
    return matchesLevel && employee.name.toLowerCase().includes(search.toLowerCase());
  }), [filter, search]);
  const counts = safetyEmployees.reduce((value, employee) => ({ ...value, [employeeOverallLevel(employee)]: value[employeeOverallLevel(employee)] + 1 }), { green: 0, yellow: 0, red: 0 });

  return <main className={styles.page}>
    <header className={styles.top}><div className={styles.brand}><i /><b>DALECOM</b><span>Safety & Training 4.0</span></div><nav><a href="/demo">Regia principale</a><a href="/organizzazione">Organigramma</a><a href="/logistica">Calendario logista</a><a href="/sicurezza-walter">Dashboard CEO</a></nav></header>

    <section className={styles.heading}><div><small>08 · SICUREZZA E FORMAZIONE</small><h1>Ogni persona pronta.<br /><em>Prima del cantiere.</em></h1><p>Documenti, formazione, abilitazioni e accessi cliente in un solo Safety Passport.</p></div><aside><span>RESPONSABILE OPERATIVO</span><b>HSE · Codice 17</b><small>Eccezioni, scadenze e autorizzazioni</small></aside></section>

    <section className={styles.kpis}>
      <article><small>ANAGRAFICHE</small><b>{safetyEmployees.length}</b><span>fascicoli digitali</span></article>
      <article className={styles.green}><small>CANTIERE READY</small><b>{counts.green}</b><span>assegnabili subito</span></article>
      <article className={styles.yellow}><small>IN ATTENZIONE</small><b>{counts.yellow}</b><span>scadenze da gestire</span></article>
      <article className={styles.red}><small>BLOCCATI</small><b>{counts.red}</b><span>drag & drop disabilitato</span></article>
      <article><small>DOCUMENTI COMPLETI</small><b>82,6%</b><span>obiettivo &gt;98%</span></article>
    </section>

    <nav className={extra.sectionNav} aria-label="Aree sicurezza">{([
      ["passport", "Safety Passport", String(safetyEmployees.length)], ["academy", "Dalecom Academy", "4"], ["access", "Accessi cliente", "4"], ["onboarding", "Onboarding", "3"], ["nearMiss", "Near miss", "3"],
    ] as const).map(([value, label, count]) => <button key={value} className={section === value ? extra.active : ""} onClick={() => setSection(value)}><span>{label}</span><b>{count}</b></button>)}</nav>

    {section === "passport" && <section className={styles.workspace}>
      <aside className={styles.roster}>
        <header><div><small>SAFETY PASSPORT</small><b>Tutto il personale</b></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cerca dipendente" /></header>
        <div className={styles.filters}>{(["all", "green", "yellow", "red"] as const).map((value) => <button className={filter === value ? styles.active : ""} onClick={() => setFilter(value)} key={value}>{value === "all" ? "Tutti" : levelLabel[value]}</button>)}</div>
        <div className={styles.people}>{shown.map((employee) => { const level = employeeOverallLevel(employee); return <button key={employee.name} onClick={() => setSelectedName(employee.name)} className={`${styles.person} ${selectedName === employee.name ? styles.selected : ""}`}><i className={styles[level]} /><div><b>{employee.name}</b><small>{employee.role} · {employee.branch}</small></div><span className={styles[level]}>{levelLabel[level]}</span></button>; })}</div>
      </aside>

      <article className={styles.passport}>
        <header><div className={styles.avatar}>{selected.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div><small>FASCICOLO DIGITALE DIPENDENTE</small><h2>{selected.name}</h2><p>{selected.role} · sede {selected.branch}</p></div><span className={styles[employeeOverallLevel(selected)]}>{levelLabel[employeeOverallLevel(selected)]}</span></header>
        {!selected.detailed && <div className={styles.demoNote}>Anagrafica acquisita · dettaglio documentale dimostrativo in attesa della sincronizzazione completa da 1C.</div>}
        <section className={styles.requirements}>{selected.requirements.map((item) => <article key={item.id}><i className={styles[item.status]}>{item.status === "green" ? "✓" : item.status === "yellow" ? "!" : "×"}</i><div><small>{item.category}</small><b>{item.label}</b><span>{item.expires}</span></div><em className={styles[item.status]}>{item.status === "green" ? "Valido" : item.status === "yellow" ? "In scadenza" : "Bloccante"}</em></article>)}</section>
        <footer><div><small>REGOLA LOGISTICA</small><b>{employeeOverallLevel(selected) === "red" ? "Il dipendente non può essere assegnato a un cantiere" : employeeOverallLevel(selected) === "yellow" ? "Assegnazione consentita con alert preventivo al CEO" : "Dipendente assegnabile ai cantieri compatibili"}</b></div><div className={extra.passportLinks}><a href={`/organizzazione?employee=${encodeURIComponent(selected.name)}`}>Organigramma e mansionario</a><a href="/logistica">Verifica nel calendario →</a></div></footer>
      </article>
    </section>}

    {section === "academy" && <section className={extra.operational}>
      <header><div><small>DALECOM ACADEMY</small><h2>Formazione pianificata, tracciata e verificata</h2><p>Microlearning, aula, addestramento pratico e test finale in un unico percorso.</p></div><button onClick={() => setCourseActions((value) => ({ ...value, new: "Nuova sessione predisposta per il 06/10/2026" }))}>+ Programma sessione</button></header>
      {courseActions.new && <div className={extra.success}>{courseActions.new}</div>}
      <div className={extra.courseGrid}>{trainingCourses.map((course) => <article key={course.id}><header><span>{course.id}</span><em>{course.status}</em></header><h3>{course.title}</h3><p>{course.date} · {course.hours} ore · {course.mode}</p><div><span><small>FORMATORE</small><b>{course.trainer}</b></span><span><small>ISCRITTI</small><b>{course.enrolled}/{course.seats}</b></span></div><footer><button onClick={() => setCourseActions((value) => ({ ...value, [course.id]: "Inviti e promemoria inviati" }))}>{courseActions[course.id] || "Invia convocazioni"}</button><button>Apri registro</button></footer></article>)}</div>
      <div className={extra.academyBottom}><article><small>TEST AL PRIMO TENTATIVO</small><b>87%</b><span>Monitoraggio per corso, formatore e mansione</span></article><article><small>FORMAZIONE INTERNA</small><b>64%</b><span>Obiettivo: aumento progressivo</span></article><article><small>ORE DA RECUPERARE</small><b>28 h</b><span>7 dipendenti da ripianificare</span></article><article><small>EFFICACIA A 90 GIORNI</small><b>Buona</b><span>3 verifiche sul campo aperte</span></article></div>
    </section>}

    {section === "access" && <section className={extra.operational}>
      <header><div><small>SITE ACCESS AUTOMATION</small><h2>Autorizzazioni concluse prima della partenza</h2><p>Il sistema incrocia dipendente, documenti, formazione, abilitazioni e portale del cliente.</p></div><a href="/logistica">Apri pianificazione →</a></header>
      <div className={extra.accessGrid}>{siteAccesses.map((access) => { const checks = access.people.map((name) => ({ name, ...safetyCheck(name, access.site) })); const blocked = checks.filter((item) => item.level === "red"); const warnings = checks.filter((item) => item.level === "yellow"); const ready = !blocked.length; return <article key={access.site}><header><div><small>PARTENZA {access.departure}</small><h3>{access.site}</h3><p>{access.customer}</p></div><b className={ready ? extra.ready : extra.blocked}>{ready ? warnings.length ? "ATTENZIONE" : "READY" : `${blocked.length} BLOCCATI`}</b></header><div>{checks.map((check) => <span key={check.name}><i className={extra[check.level]}>{check.level === "green" ? "✓" : check.level === "yellow" ? "!" : "×"}</i><b>{check.name}</b><small>{check.level === "red" ? check.missing.join(", ") : check.level === "yellow" ? check.warnings.join(", ") : "Requisiti conformi"}</small></span>)}</div><footer><button disabled={!ready} onClick={() => setAccessSent((value) => ({ ...value, [access.site]: true }))}>{!ready ? "Invio bloccato" : accessSent[access.site] ? "✓ Documenti inviati" : "Invia documenti al cliente"}</button><button>Apri checklist</button></footer></article>; })}</div>
    </section>}

    {section === "onboarding" && <section className={extra.operational}>
      <header><div><small>ASSUNZIONE → CANTIERE READY</small><h2>Onboarding guidato senza passaggi persi</h2><p>HR e Sicurezza vedono responsabilità, tempi e prossimo blocco da risolvere.</p></div><button>+ Avvia onboarding</button></header>
      <div className={extra.onboarding}>{onboardingCases.map((item) => <article key={item.name}><div className={extra.progressRing} style={{"--progress":`${item.progress}%`} as CSSProperties}><b>{item.progress}%</b></div><div><small>INIZIO {item.start} · TARGET {item.target}</small><h3>{item.name}</h3><p>Prossima azione: <b>{item.missing}</b></p><span>Responsabile: {item.owner}</span></div><button>Apri percorso →</button></article>)}</div>
      <div className={extra.flow}><span><i>1</i>Anagrafica 1C</span><b>→</b><span><i>2</i>Visita medica</span><b>→</b><span><i>3</i>Formazione</span><b>→</b><span><i>4</i>DPI e addestramento</span><b>→</b><span><i>5</i>Portali cliente</span><b>→</b><span><i>6</i>Cantiere ready</span></div>
    </section>}

    {section === "nearMiss" && <section className={extra.operational}>
      <header><div><small>SAFETY INTELLIGENCE</small><h2>Near miss collegati alla formazione</h2><p>Ogni evento genera azione, verifica dell’efficacia e aggiornamento dei contenuti formativi.</p></div><button>+ Registra near miss</button></header>
      <div className={extra.nearGrid}>{nearMisses.map((item) => <article key={item.id}><header><span>{item.id} · {item.date}</span><em>{item.status}</em></header><small>{item.site}</small><h3>{item.title}</h3><p><b>Causa:</b> {item.cause}</p><p><b>Azione:</b> {item.action}</p><footer><button>Apri analisi</button><button>Verifica efficacia</button></footer></article>)}</div>
      <div className={extra.nearStats}><article><b>−40%</b><span>near miss riconducibili a formazione</span></article><article><b>6 giorni</b><span>tempo medio chiusura azione</span></article><article><b>100%</b><span>azioni con responsabile assegnato</span></article></div>
    </section>}
  </main>;
}
