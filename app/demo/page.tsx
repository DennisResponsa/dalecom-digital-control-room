import styles from "./page.module.css";

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
  },
  {
    number: "02",
    eyebrow: "MEZZI",
    title: "Flotta in tempo reale",
    description: "Posizioni, attività e telemetria dei mezzi per decidere con dati aggiornati.",
    action: "Apri la flotta",
    href: `${dalecomPublicUrl}/flotta`,
    accent: "cyan",
  },
  {
    number: "03",
    eyebrow: "PERSONE",
    title: "Dipendenti e cantieri",
    description: "Ore, presenze e rapportini operativi raccolti direttamente dal campo.",
    action: "Apri la demo operativa",
    href: "/dipendenti",
    accent: "green",
  },
  {
    number: "04",
    eyebrow: "DIREZIONE",
    title: "Governance live",
    description: "Un unico quadro per ricavi, costi, marginalità e avanzamento dei lavori.",
    action: "Apri la dashboard",
    href: "/governance",
    accent: "violet",
  },
  {
    number: "05",
    eyebrow: "ORGANIZZAZIONE",
    title: "Persone e procedure",
    description: "Organigramma, responsabilità e procedure operative in un unico sistema navigabile.",
    action: "Apri l’organizzazione",
    href: "/organizzazione",
    accent: "yellow",
  },
] as const;

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

      <section className={styles.grid} aria-label="Strumenti della demo Dalecom">
        {tools.map((tool) => (
          <a
            className={`${styles.card} ${styles[tool.accent]}`}
            href={tool.href}
            target="_blank"
            rel="noreferrer"
            key={tool.number}
          >
            <div className={styles.cardTop}>
              <span>{tool.number}</span>
              <small>{tool.eyebrow}</small>
            </div>
            <div>
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
            </div>
            <strong>{tool.action}<b>↗</b></strong>
          </a>
        ))}
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
