import styles from "./page.module.css";
import sixStyles from "./six.module.css";

const dalecomPublicUrl = "https://dalecom-preventivo-immediato.denniscumerlato.chatgpt.site";

const tools = [
  {
    number: "01",
    eyebrow: "CLIENTE",
    title: "Preventivo intelligente",
    description: "Dalla richiesta alla proposta personalizzata, con invio immediato dei dati a 1C.",
    action: "Apri il preventivatore",
    href: `${dalecomPublicUrl}/`,
    accent: "orange",
    disabled: false,
  },
  {
    number: "02",
    eyebrow: "MEZZI",
    title: "Flotta in tempo reale",
    description: "Posizioni, attività e telemetria dei mezzi per decidere con dati aggiornati.",
    action: "Apri la flotta",
    href: `${dalecomPublicUrl}/flotta`,
    accent: "cyan",
    disabled: false,
  },
  {
    number: "03",
    eyebrow: "PERSONE",
    title: "Dipendenti e cantieri",
    description: "Ore, presenze e rapportini operativi raccolti direttamente dal campo.",
    action: "Apri la demo operativa",
    href: "/dipendenti",
    accent: "green",
    disabled: false,
  },
  {
    number: "04",
    eyebrow: "DIREZIONE",
    title: "Governance live",
    description: "Un unico quadro per ricavi, costi, marginalità e avanzamento dei lavori.",
    action: "Apri la dashboard",
    href: "/governance",
    accent: "violet",
    disabled: false,
  },
  {
    number: "05",
    eyebrow: "ORGANIZZAZIONE",
    title: "Persone e procedure",
    description: "Organigramma, responsabilità e procedure operative in un unico sistema navigabile.",
    action: "Apri l’organizzazione",
    href: "/organizzazione",
    accent: "yellow",
    disabled: false,
  },
  {
    number: "06",
    eyebrow: "LOGISTICA",
    title: "Logista",
    description: "Calendario mensile drag & drop per coordinare cantieri, macchine, mezzi e squadre.",
    action: "Apri la pianificazione",
    href: "/logistica",
    accent: "red",
    disabled: false,
  },
  {
    number: "07",
    eyebrow: "PERSONALE · HR",
    title: "HR Buste Paghe",
    description: "Presenze, trasferte, indennità e dati economici del personale collegati alle commesse.",
    action: "Apri HR e buste paghe",
    href: "/hr",
    accent: "cyan",
    disabled: false,
  },
  {
    number: "08",
    eyebrow: "SICUREZZA",
    title: "Sicurezza e formazione",
    description: "Corsi, idoneità, DPI, patentini e scadenze per assegnare soltanto personale conforme.",
    action: "Apri Safety Passport",
    href: "/sicurezza",
    accent: "green",
    disabled: false,
  },
  {
    number: "09",
    eyebrow: "OFFICINA",
    title: "Officina e manutenzioni",
    description: "Guasti, ordini di lavoro, ricambi e manutenzioni programmate per ogni macchina e mezzo.",
    action: "",
    href: "",
    accent: "disabled",
    disabled: true,
  },
  {
    number: "10",
    eyebrow: "LOGISTICA",
    title: "Ottimizzazione processi",
    description: "Ottimizzazioni automatiche per l’assegnazione di uomini, mezzi e macchine che ottimizzano la logistica.",
    action: "",
    href: "",
    accent: "disabled",
    disabled: true,
  },
  {
    number: "11",
    eyebrow: "COMPLIANCE",
    title: "Legal",
    description: "Verifica normativa, controllo dei contratti e individuazione automatica delle non conformità.",
    action: "Apri verifica contratti",
    href: "/legal",
    accent: "violet",
    disabled: false,
  },
  {
    number: "12",
    eyebrow: "MARKETING",
    title: "Marketing",
    description: "Campagne, contenuti e opportunità commerciali coordinati con clienti, preventivi e risultati reali.",
    action: "",
    href: "",
    accent: "disabled",
    disabled: true,
  },
  {
    number: "13",
    eyebrow: "SAFETY INTELLIGENCE",
    title: "Dashboard CEO",
    description: "KPI, scadenze, accessi ai cantieri e alert formativi per governare sicurezza e conformità.",
    action: "Apri la dashboard CEO",
    href: "/sicurezza-walter",
    accent: "orange",
    disabled: false,
  },
  {
    number: "14",
    eyebrow: "ENERGIA · ESG",
    title: "Energia e sostenibilità",
    description: "Fotovoltaico, accumulo, consumi, acqua, ricariche e risorse delle sedi controllati in tempo reale.",
    action: "Apri il controllo energetico",
    href: "/energia",
    accent: "green",
    disabled: false,
  },
  {
    number: "15",
    eyebrow: "OPPORTUNITÀ PUBBLICHE",
    title: "Bandi, Gare ed Appalti",
    description: "Ricerca, valutazione e gestione coordinata delle opportunità, dalla pubblicazione all’aggiudicazione.",
    action: "",
    href: "",
    accent: "disabled",
    disabled: true,
  },
  {
    number: "16",
    eyebrow: "SECURITY CONTROL",
    title: "TVCC, allarme, controllo accessi",
    description: "Telecamere, allarmi, drone di verifica, badge digitali, presenze e visitatori in un’unica sala controllo.",
    action: "Apri la sala sicurezza",
    href: "/security-control",
    accent: "orange",
    disabled: false,
  },
] as const;

function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  const content = <>
    <div className={styles.cardTop}>
      <span>{tool.number}</span>
      <small>{tool.eyebrow}</small>
    </div>
    <div>
      <h2>{tool.title}</h2>
      <p>{tool.description}</p>
    </div>
    {tool.disabled ? null : <strong>{tool.action}<b>↗</b></strong>}
  </>;

  if (tool.disabled) {
    return <article className={`${styles.card} ${sixStyles.compact} ${sixStyles.disabledCard}`} aria-disabled="true">{content}</article>;
  }

  return <a className={`${styles.card} ${sixStyles.compact} ${styles[tool.accent] || sixStyles.red} ${tool.number === "07" ? sixStyles.hrActive : ""}`} href={tool.href} target="_blank" rel="noreferrer">{content}</a>;
}

export default function DemoControlRoom() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.wordmark} aria-label="Dalecom">
            <i />
            <b>DALECOM</b>
          </div>
          <span>Regia operativa</span>
        </div>
        <div className={styles.live}><i /> Demo integrata · sistemi connessi</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.kicker}>DALECOM DIGITAL CONTROL ROOM</div>
        <h1>Un solo flusso.<br /><em>Tutto sotto controllo.</em></h1>
        <p>La richiesta entra, il lavoro si organizza e la direzione vede ciò che accade. In tempo reale.</p>
      </section>

      <section className={`${styles.grid} ${sixStyles.gridSix}`} aria-label="Strumenti della demo Dalecom">
        {tools.map((tool) => <ToolCard tool={tool} key={tool.number} />)}
      </section>

      <section className={styles.flow} aria-label="Flusso della dimostrazione">
        <span>Richiesta cliente</span><b>→</b><span>1C coordina</span><b>→</b><span>Il cantiere produce dati</span><b>→</b><span>La direzione decide</span>
      </section>

      <footer className={styles.footer}>
        <b>DALECOM</b>
        <span>Soluzioni integrate per il pompaggio del calcestruzzo</span>
        <small>Demo operativa · dati e disponibilità simulati ove indicato</small>
      </footer>
    </main>
  );
}
