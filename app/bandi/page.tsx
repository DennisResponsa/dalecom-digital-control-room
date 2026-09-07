"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";
import verifiedStyles from "./verified.module.css";

type Area = "radar" | "dalecom" | "clienti" | "gare" | "documenti" | "leads";
type Opportunity = {
  id: string;
  title: string;
  issuer: string;
  region: string;
  type: "Bando" | "Gara" | "Appalto" | "Incentivo";
  audience: "Dalecom" | "Cliente" | "Entrambi";
  deadline: string;
  days: number;
  value: string;
  returnValue: string;
  score: number;
  status: "Nuovo" | "In analisi" | "Qualificato" | "Documenti";
  tags: string[];
  summary: string;
  dalecomUse: string;
  customerPitch: string;
  requirements: string[];
  documents: string[];
  verified?: boolean;
  sourceUrl?: string;
};

const opportunities: Opportunity[] = [
  { id: "REAL-MIMIT-NS26", title: "Nuova Sabatini · beni strumentali", issuer: "Ministero delle Imprese e del Made in Italy", region: "Italia", type: "Incentivo", audience: "Entrambi", deadline: "Misura attiva · rifinanziata 2026–2027", days: 999, value: "€ 650 mln rifinanziati", returnValue: "Contributo su finanziamento/leasing", score: 96, status: "Qualificato", tags: ["Macchinari", "Attrezzature", "Software", "Green"], summary: "Misura nazionale attiva per facilitare l’accesso al credito delle PMI che acquistano o acquisiscono in leasing macchinari, impianti, attrezzature, hardware, software e tecnologie digitali.", dalecomUse: "Dalecom può valutare il finanziamento di nuove macchine, attrezzature, hardware e software collegati al programma di investimento.", customerPitch: "Quando il cliente valuta l’acquisto o il leasing di una macchina ammissibile, Dalecom può accompagnare l’offerta con una scheda preliminare dell’agevolazione.", requirements: ["Impresa qualificabile come PMI", "Beni nuovi e ad uso produttivo", "Finanziamento o leasing conforme", "Regolarità dell’impresa e copertura catastrofale se applicabile"], documents: ["Domanda Nuova Sabatini", "Delibera finanziamento/leasing", "Offerta e scheda tecnica bene", "Dichiarazioni PMI", "Fatture e quietanze", "Dichiarazione ultimazione"], verified: true, sourceUrl: "https://www.mimit.gov.it/it/incentivi/agevolazioni-per-gli-investimenti-delle-pmi-in-beni-strumentali-nuova-sabatini" },
  { id: "REAL-MIMIT-IP26", title: "Nuovo Piano Transizione 5.0 · Iperammortamento", issuer: "MIMIT · piattaforma GSE", region: "Italia", type: "Incentivo", audience: "Entrambi", deadline: "Investimenti fino al 30 settembre 2028", days: 754, value: "Investimenti fino a € 20 mln", returnValue: "Maggiorazione fino al 180%", score: 95, status: "Qualificato", tags: ["Beni interconnessi", "Fotovoltaico", "Accumulo", "Digitale"], summary: "Misura attiva dal 2026 che maggiora fiscalmente il costo dei beni strumentali nuovi tecnologicamente avanzati e degli impianti per autoproduzione di energia rinnovabile destinata all’autoconsumo.", dalecomUse: "Potenziale per beni interconnessi, supervisore, automazione, fotovoltaico e accumulo, previa verifica tecnica e fiscale dei requisiti.", customerPitch: "Per una macchina nuova e interconnessa, Dalecom può fornire schede tecniche e dati necessari alla valutazione del beneficio fiscale del cliente.", requirements: ["Bene nuovo incluso negli allegati applicabili", "Interconnessione al sistema aziendale", "Comunicazioni tramite GSE", "Perizia asseverata e certificazione contabile"], documents: ["Comunicazione preventiva GSE", "Ordine e acconto 20%", "Scheda tecnica e interconnessione", "Perizia asseverata", "Certificazione contabile", "Comunicazione di completamento"], verified: true, sourceUrl: "https://www.mimit.gov.it/it/incentivi/nuovo-piano-transizione-5-0-iperammortamento" },
  { id: "REAL-INAIL-ISI25", title: "Bando ISI 2025 · fase documentale 2026", issuer: "INAIL", region: "Italia", type: "Bando", audience: "Dalecom", deadline: "9 settembre / 15 ottobre 2026", days: 2, value: "€ 600 mln complessivi", returnValue: "Fondo perduto · secondo asse", score: 83, status: "Documenti", tags: ["Sicurezza", "Rischi", "Macchine", "DVR"], summary: "Il bando è nella fase di completamento documentale: non è una nuova finestra di domanda. È utilizzabile da Dalecom soltanto se una domanda risulta già negli elenchi cronologici pubblicati.", dalecomUse: "Verifica immediata dell’eventuale domanda Dalecom negli elenchi e, se presente, completamento del fascicolo entro la scadenza applicabile.", customerPitch: "Per clienti già ammessi, Dalecom può predisporre offerta, schede macchina e documentazione tecnica richiesta dal progetto.", requirements: ["Domanda già presente negli elenchi INAIL", "Punteggio e asse coerenti", "Progetto collegato al rischio presente nel DVR", "Caricamento documenti entro la scadenza assegnata"], documents: ["Modulo A", "DVR o relazione rischio", "Progetto e preventivi", "Documenti macchina", "DURC e dichiarazioni", "Allegati specifici dell’asse"], verified: true, sourceUrl: "https://www.inail.it/portale/prevenzione-e-sicurezza/it/prevenzione-e-sicurezza/finanziamenti-per-la-sicurezza/incentivi-alle-imprese/bando-isi-2025.html" },
  { id: "BD-2026-184", title: "Transizione energetica dei processi produttivi", issuer: "Regione Veneto", region: "Veneto", type: "Bando", audience: "Entrambi", deadline: "28 settembre 2026", days: 21, value: "€ 4,5 mln", returnValue: "fino al 45%", score: 94, status: "Qualificato", tags: ["Fotovoltaico", "Macchinari", "PMI"], summary: "Contributo per impianti, macchine efficienti e riduzione dei consumi nei processi produttivi.", dalecomUse: "Efficientamento officina, accumulo e sostituzione di attrezzature energivore.", customerPitch: "Il cliente può finanziare parte della macchina e dei servizi Dalecom inseriti nel progetto di efficientamento.", requirements: ["PMI con sede operativa in Veneto", "Riduzione misurabile dei consumi", "Spese avviate dopo la domanda", "Regolarità contributiva"], documents: ["Visura camerale", "DURC", "Bilanci 2024–2025", "Relazione tecnica", "Preventivi fornitori", "DNSH e dichiarazioni"] },
  { id: "INC-2026-092", title: "Credito d’imposta Transizione 5.0", issuer: "MIMIT · GSE", region: "Italia", type: "Incentivo", audience: "Cliente", deadline: "31 dicembre 2026", days: 115, value: "Variabile", returnValue: "fino al 45%", score: 91, status: "In analisi", tags: ["Macchinari", "5.0", "Energia"], summary: "Agevolazione per investimenti che producono una riduzione certificata dei consumi energetici.", dalecomUse: "Non prioritario come beneficiario diretto nella demo.", customerPitch: "Proposta Dalecom accompagnata da simulazione del credito e documenti tecnici della macchina.", requirements: ["Investimento in beni ammissibili", "Riduzione consumi 3% struttura o 5% processo", "Certificazione ex ante ed ex post", "Interconnessione del bene"], documents: ["Offerta Dalecom", "Scheda tecnica macchina", "Relazione energetica", "Dichiarazione interconnessione", "Fatture e pagamenti"] },
  { id: "GA-2026-441", title: "Servizio di pompaggio calcestruzzo · Lotto Nord Est", issuer: "Consorzio Infrastrutture Nord", region: "Veneto · FVG", type: "Gara", audience: "Dalecom", deadline: "19 settembre 2026", days: 12, value: "€ 680.000", returnValue: "Valore appalto", score: 88, status: "Documenti", tags: ["Pompaggio", "Accordo quadro", "36 mesi"], summary: "Accordo quadro triennale per servizi di pompaggio, assistenza e disponibilità programmata.", dalecomUse: "Partecipazione diretta con flotta, personale qualificato e referenze grandi opere.", customerPitch: "Non applicabile: opportunità diretta Dalecom.", requirements: ["Fatturato specifico triennale", "Certificazioni sicurezza", "Elenco mezzi disponibili", "Referenze analoghe", "Garanzia provvisoria"], documents: ["DGUE", "Visura e DURC", "Polizza provvisoria", "Referenze", "Elenco flotta", "Offerta tecnica", "Offerta economica"] },
  { id: "BD-2026-210", title: "Innovazione e digitalizzazione delle PMI", issuer: "Regione Lombardia", region: "Lombardia", type: "Bando", audience: "Entrambi", deadline: "14 ottobre 2026", days: 37, value: "€ 7 mln", returnValue: "50% · max € 100.000", score: 86, status: "Nuovo", tags: ["Software", "IoT", "AI"], summary: "Contributo per digitalizzazione, sistemi gestionali, IoT, automazione e intelligenza artificiale.", dalecomUse: "Piattaforma integrata, sensoristica e supervisore collegato a 1C.", customerPitch: "Possibile supporto ai clienti che inseriscono servizi digitali e tracciabilità di cantiere nel progetto.", requirements: ["Sede in Lombardia", "Progetto minimo € 25.000", "Fornitori qualificati", "Conclusione entro 12 mesi"], documents: ["Domanda firmata", "Progetto digitale", "Quadro economico", "Preventivi", "Dichiarazione de minimis"] },
  { id: "AP-2026-731", title: "Opere speciali e consolidamento galleria", issuer: "Stazione Unica Appaltante", region: "Piemonte", type: "Appalto", audience: "Cliente", deadline: "6 ottobre 2026", days: 29, value: "€ 12,8 mln", returnValue: "Subfornitura stimata € 310k", score: 82, status: "Nuovo", tags: ["Galleria", "Spritzbeton", "Grandi opere"], summary: "Lavori di consolidamento con fabbisogno di pompaggio, spritzbeton e assistenza continuativa.", dalecomUse: "Opportunità indiretta: partnership o subfornitura tecnica.", customerPitch: "Dalecom prepara disponibilità mezzi, metodologia e quotazione per rafforzare l’offerta dell’impresa partecipante.", requirements: ["SOA categorie indicate", "Piano sicurezza", "Capacità tecnica", "Cronoprogramma", "Sopralluogo obbligatorio"], documents: ["Capitolato", "Computo metrico", "Relazione Dalecom", "Schede macchine", "Preventivo servizio", "Referenze analoghe"] },
  { id: "BD-2026-055", title: "Sicurezza e formazione nei cantieri", issuer: "INAIL", region: "Italia", type: "Bando", audience: "Dalecom", deadline: "30 novembre 2026", days: 84, value: "€ 130 mln", returnValue: "65%", score: 79, status: "In analisi", tags: ["Sicurezza", "Formazione", "DPI"], summary: "Finanziamento per interventi che migliorano salute e sicurezza sul lavoro.", dalecomUse: "DPI evoluti, formazione specialistica e sistemi uomo a terra.", customerPitch: "Il servizio sicurezza Dalecom può diventare parte qualificante della fornitura.", requirements: ["Miglioramento documentato del rischio", "Regolarità contributiva", "Progetto e preventivi", "Soglia minima di punteggio"], documents: ["DVR", "Relazione rischio", "Preventivi", "DURC", "Dichiarazioni aiuti"] },
];

const nav: { id: Area; label: string; icon: string; badge?: number }[] = [
  { id: "radar", label: "Radar opportunità", icon: "⌁", badge: 24 },
  { id: "dalecom", label: "Per Dalecom", icon: "D", badge: 7 },
  { id: "clienti", label: "Per i clienti", icon: "C", badge: 11 },
  { id: "gare", label: "Gare e appalti", icon: "G", badge: 6 },
  { id: "documenti", label: "Documentazione", icon: "▤", badge: 9 },
  { id: "leads", label: "Lead ufficio acquisti", icon: "↗", badge: 8 },
];

const leadSeed = [
  { id: "LA-048", title: "Gara pompaggio · Nord Est", owner: "Ufficio acquisti", value: "€ 680.000", stage: "Calcolo costi", due: "oggi · 16:00" },
  { id: "LA-047", title: "Galleria Piemonte · partnership", owner: "Acquisti + Tecnico", value: "€ 310.000", stage: "Richiesta quotazione", due: "domani" },
  { id: "LA-044", title: "Digitalizzazione PMI · Dalecom", owner: "Direzione", value: "€ 100.000", stage: "Studio ammissibilità", due: "11 settembre" },
];

export default function BandiControlCenter() {
  const [area, setArea] = useState<Area>("radar");
  const [selectedId, setSelectedId] = useState(opportunities[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tutti");
  const [notice, setNotice] = useState("");
  const [leads, setLeads] = useState(leadSeed);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const selected = opportunities.find((item) => item.id === selectedId) ?? opportunities[0];
  const visible = useMemo(() => opportunities.filter((item) => {
    const matchesArea = area === "radar" || area === "documenti" || area === "leads" || (area === "dalecom" && item.audience !== "Cliente") || (area === "clienti" && item.audience !== "Dalecom") || (area === "gare" && (item.type === "Gara" || item.type === "Appalto"));
    const matchesFilter = filter === "Tutti" || item.type === filter || item.region === filter;
    const haystack = `${item.title} ${item.issuer} ${item.region} ${item.tags.join(" ")}`.toLowerCase();
    return matchesArea && matchesFilter && haystack.includes(query.toLowerCase());
  }), [area, filter, query]);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function createLead(item: Opportunity) {
    if (leads.some((lead) => lead.title.includes(item.title.slice(0, 16)))) {
      flash("Lead già presente nell’ufficio acquisti.");
      return;
    }
    setLeads((current) => [{ id: `LA-${50 + current.length}`, title: item.title, owner: "Ufficio acquisti", value: item.value, stage: "Nuovo · calcolo da avviare", due: "entro 24 ore" }, ...current]);
    flash("Lead creato e inviato all’ufficio acquisti.");
  }

  const pageTitle = nav.find((item) => item.id === area)?.label ?? "Radar opportunità";

  return <main className={styles.page}>
    {notice && <div className={styles.notice}>{notice}</div>}
    <aside className={styles.sidebar}>
      <div className={styles.logo}><img src="/dalecom-logo.png" alt="Dalecom" /><span>Bandi, gare<br />e appalti</span></div>
      <a className={styles.back} href="/demo">← Torna alla regia principale</a>
      <nav>{nav.map((item) => <button key={item.id} className={area === item.id ? styles.active : ""} onClick={() => setArea(item.id)}><i>{item.icon}</i><span>{item.label}</span>{item.badge && <b>{item.id === "leads" ? leads.length : item.badge}</b>}</button>)}</nav>
      <section className={styles.sources}><small>FONTI MONITORATE</small><span><i />ANAC · BDNCP</span><span><i />TED Europa</span><span><i />Incentivi.gov.it</span><span><i />Regioni e Camere Commercio</span><span><i />Portali stazioni appaltanti</span><em>Dati demo · connessioni da attivare</em></section>
      <footer><b>DALECOM</b><span>Tender & Incentive Intelligence</span></footer>
    </aside>

    <section className={styles.content}>
      <header className={styles.topbar}>
        <div><small>15 · BANDI, GARE E APPALTI</small><h1>{pageTitle}</h1></div>
        <div><span className={styles.live}><i /> Ricerca automatica attiva</span><button onClick={() => flash("Scansione completata: 3 nuove opportunità da qualificare.")}>↻ Cerca ora</button></div>
      </header>

      {(area === "radar" || area === "dalecom" || area === "clienti" || area === "gare") && <>
        <section className={verifiedStyles.verifiedStrip}>
          <header><div><small>OPPORTUNITÀ REALI · FONTI UFFICIALI</small><b>Subito visibili per Dalecom</b></div><span>Verificate il 7 settembre 2026</span></header>
          <div>{opportunities.filter((item) => item.verified).map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)}><i>✓</i><span><small>{item.issuer}</small><b>{item.title}</b><em>{item.deadline}</em></span><strong>{item.returnValue}<small>Apri scheda →</small></strong></button>)}</div>
        </section>
        <section className={styles.kpis}>
          <article><small>OPPORTUNITÀ ATTIVE</small><b>24</b><span>+3 oggi</span><i style={{ width: "82%" }} /></article>
          <article><small>PER DALECOM</small><b>7</b><span>€ 1,24 mln potenziale</span><i style={{ width: "58%" }} /></article>
          <article><small>DA PROPORRE AI CLIENTI</small><b>11</b><span>6 ad alta compatibilità</span><i style={{ width: "74%" }} /></article>
          <article className={styles.warningKpi}><small>SCADENZA ENTRO 15 GG</small><b>4</b><span>2 richiedono azione oggi</span><i style={{ width: "36%" }} /></article>
          <article><small>PRATICHE IN PREPARAZIONE</small><b>9</b><span>completezza media 73%</span><i style={{ width: "73%" }} /></article>
          <article><small>LEAD ACQUISTI</small><b>{leads.length}</b><span>€ 1,09 mln in analisi</span><i style={{ width: "67%" }} /></article>
        </section>

        <section className={styles.searchbar}>
          <label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca settore, territorio, macchina, servizio…" /></label>
          {["Tutti", "Bando", "Gara", "Appalto", "Incentivo", "Veneto", "Italia"].map((item) => <button key={item} className={filter === item ? styles.filterActive : ""} onClick={() => setFilter(item)}>{item}</button>)}
        </section>

        <section className={styles.workspace}>
          <div className={styles.opportunityList}>
            <header><div><small>RISULTATI QUALIFICATI</small><b>{visible.length} opportunità mostrate</b></div><span>Ordina: compatibilità ↓</span></header>
            <div>{visible.map((item) => <button key={item.id} className={selected.id === item.id ? styles.selected : ""} onClick={() => setSelectedId(item.id)}>
              <div className={styles.itemTop}><span className={styles[item.type.toLowerCase()]}>{item.type}</span><small>{item.id}</small>{item.verified && <b className={verifiedStyles.officialBadge}>FONTE UFFICIALE</b>}<em>{item.status}</em></div>
              <h2>{item.title}</h2><p>{item.issuer} · {item.region}</p>
              <div className={styles.tags}>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <footer><span><small>SCADENZA</small><b>{item.deadline}</b></span><span><small>BENEFICIO / VALORE</small><b>{item.returnValue}</b></span><strong>{item.score}<small>/100</small></strong></footer>
            </button>)}</div>
          </div>

          <article className={styles.detail}>
            <header><div><small>{selected.id} · {selected.type.toUpperCase()} {selected.verified ? "· VERIFICATO" : "· SCENARIO DEMO"}</small><h2>{selected.title}</h2><p>{selected.issuer} · {selected.region}</p>{selected.sourceUrl && <a className={verifiedStyles.officialLink} href={selected.sourceUrl} target="_blank" rel="noreferrer">Apri la fonte ufficiale ↗</a>}</div><div className={styles.score}><b>{selected.score}</b><span>compatibilità</span></div></header>
            <div className={styles.deadline}><span><small>SCADENZA</small><b>{selected.deadline}</b></span><strong>{selected.days} giorni</strong><span><small>DOTAZIONE / VALORE</small><b>{selected.value}</b></span><span><small>AGEVOLAZIONE</small><b>{selected.returnValue}</b></span></div>
            <p className={styles.summary}>{selected.summary}</p>
            <section className={styles.twoPaths}>
              <article className={selected.audience === "Cliente" ? styles.muted : ""}><header><i>D</i><span><small>PERCORSO 1</small><b>Dalecom beneficiaria</b></span></header><p>{selected.dalecomUse}</p><footer>{selected.audience === "Cliente" ? "NON PRIORITARIO" : "COMPATIBILE"}</footer></article>
              <article className={selected.audience === "Dalecom" ? styles.muted : ""}><header><i>C</i><span><small>PERCORSO 2</small><b>Opportunità per il cliente</b></span></header><p>{selected.customerPitch}</p><footer>{selected.audience === "Dalecom" ? "NON APPLICABILE" : "PRONTA DA PROPORRE"}</footer></article>
            </section>
            <section className={styles.detailColumns}>
              <div><header><b>Requisiti principali</b><span>{selected.requirements.length}</span></header>{selected.requirements.map((item) => <p key={item}><i>✓</i>{item}</p>)}</div>
              <div><header><b>Documenti richiesti</b><span>{selected.documents.length}</span></header>{selected.documents.slice(0, 5).map((item, index) => <p key={item}><i className={index < 3 ? styles.ready : ""}>{index < 3 ? "✓" : "!"}</i>{item}</p>)}</div>
            </section>
            <footer className={styles.detailActions}><button onClick={() => { setArea("documenti"); flash("Fascicolo aperto: documenti mancanti evidenziati."); }}>Prepara documentazione</button><button onClick={() => { setArea("clienti"); flash("Scheda consulenza cliente generata."); }}>Genera consiglio cliente</button><button className={styles.primary} onClick={() => createLead(selected)}>Crea lead acquisti ↗</button></footer>
          </article>
        </section>
      </>}

      {area === "documenti" && <section className={styles.documentWorkspace}>
        <header><div><small>FASCICOLO AUTOMATICO</small><h2>{selected.title}</h2><p>{selected.id} · scadenza {selected.deadline}</p></div><div className={styles.completion}><b>{Math.round(selected.documents.filter((document) => checkedDocs[`${selected.id}-${document}`]).length / selected.documents.length * 100)}%</b><span>completezza</span></div></header>
        <div className={styles.docGrid}>
          <section><header><b>Documenti di gara o bando</b><span>{selected.documents.length} richiesti</span></header>{selected.documents.map((document, index) => { const key = `${selected.id}-${document}`; const checked = Boolean(checkedDocs[key]); return <button key={document} onClick={() => setCheckedDocs((current) => ({ ...current, [key]: !checked }))}><i className={checked ? styles.checked : ""}>{checked ? "✓" : index < 3 ? "1C" : "+"}</i><span><b>{document}</b><small>{checked ? "Verificato e inserito nel fascicolo" : index < 3 ? "Disponibile da anagrafica 1C" : "Da generare o richiedere"}</small></span><em>{checked ? "PRONTO" : "APRI"}</em></button>;})}</section>
          <section className={styles.autoDocs}><header><b>Generazione automatica</b><span>bozze editabili</span></header>{["Domanda di partecipazione", "Relazione tecnica Dalecom", "Quadro economico", "Dichiarazioni amministrative", "Checklist firma e invio"].map((document, index) => <article key={document}><i>{index + 1}</i><span><b>{document}</b><small>{index < 2 ? "Bozza già preparata dai dati 1C" : "Generabile quando il fascicolo è completo"}</small></span><button onClick={() => flash(`${document}: bozza aperta e modificabile`)}>{index < 2 ? "Modifica" : "Genera"}</button></article>)}<div className={styles.audit}><i>✓</i><span><b>Controllo formale prima dell’invio</b><small>Scadenze, firme, allegati, importi e requisiti vengono verificati senza sostituire la validazione umana finale.</small></span></div></section>
        </div>
        <footer><button onClick={() => flash("Richieste inviate ai responsabili dei documenti mancanti.")}>Richiedi mancanti</button><button onClick={() => flash("Pacchetto di verifica generato.")}>Genera pacchetto di verifica</button><button className={styles.primary} onClick={() => createLead(selected)}>Invia ad acquisti per calcolo ↗</button></footer>
      </section>}

      {area === "leads" && <section className={styles.leadWorkspace}>
        <header><div><small>PIPELINE BANDI E GARE</small><h2>Lead ufficio acquisti</h2><p>Ogni opportunità qualificata diventa un’attività economica con responsabile, scadenza e valore.</p></div><button onClick={() => flash("Pipeline sincronizzata con 1C.")}>↻ Sincronizza 1C</button></header>
        <div className={styles.leadFlow}><span><b>NUOVI</b><strong>{leads.length}</strong><small>Da prendere in carico</small></span><i>→</i><span><b>CALCOLO COSTI</b><strong>3</strong><small>Uomini · mezzi · materiali</small></span><i>→</i><span><b>VALIDAZIONE</b><strong>2</strong><small>Margine e requisiti</small></span><i>→</i><span><b>OFFERTA</b><strong>1</strong><small>Pronta per invio</small></span></div>
        <div className={styles.leadTable}><div className={styles.tableHead}><span>Lead / opportunità</span><span>Responsabile</span><span>Valore</span><span>Stato</span><span>Scadenza attività</span><span></span></div>{leads.map((lead) => <button key={lead.id} onClick={() => flash(`${lead.id}: scheda calcolo acquisti aperta`)}><span><b>{lead.title}</b><small>{lead.id}</small></span><span>{lead.owner}</span><span><b>{lead.value}</b></span><span><em>{lead.stage}</em></span><span>{lead.due}</span><span>Apri →</span></button>)}</div>
        <section className={styles.costModel}><header><small>CALCOLO ECONOMICO COLLEGATO</small><b>Cosa riceve l’ufficio acquisti</b></header><div>{["Requisiti e scadenze", "Quantità e lavorazioni", "Uomini e ore", "Mezzi e macchine", "Trasporti e trasferte", "Materiali e ricambi", "Garanzie e polizze", "Margine minimo"].map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}</div><footer>Il risultato torna al fascicolo come <b>PARTECIPARE / NON PARTECIPARE</b> con motivazione e margine previsto.</footer></section>
      </section>}

      <footer className={styles.footer}><span><b>DALECOM</b> · Tender & Incentive Intelligence</span><small>Dati dimostrativi. Le fonti definitive saranno portali pubblici, API autorizzate e gestionale 1C.</small></footer>
    </section>
  </main>;
}
