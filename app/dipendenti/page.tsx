import styles from "../operational-area.module.css";

const oneCUrl = "https://sharedhosting.cloud2.1c-erp.it/Dalecom/";

export default function EmployeesArea() {
  return <main className={styles.page}>
    <header className={styles.top}>
      <div className={styles.wordmark} aria-label="Dalecom"><i /><b>DALECOM</b></div>
      <a className={styles.back} href="/demo">← Regia principale</a>
    </header>
    <section className={styles.hero}>
      <div className={styles.eyebrow}>PERSONE · CANTIERI · RAPPORTINI</div>
      <h1>Il lavoro sul campo<br /><em>diventa dato.</em></h1>
      <p>Ore, attività e rapportini confluiscono nel sistema gestionale per eliminare passaggi manuali e doppie registrazioni.</p>
    </section>
    <section className={styles.panel}>
      <div><small>DEMO OPERATIVA</small><h2>Apri l’ambiente dipendenti</h2><p>La dimostrazione prosegue nell’ambiente 1C predisposto per la presentazione.</p></div>
      <div className={styles.actions}><a className={styles.secondary} href="/demo">Torna alla regia</a><a className={styles.primary} href={oneCUrl} target="_blank" rel="noreferrer">Apri 1C ↗</a></div>
    </section>
    <div className={styles.note}>L’ambiente 1C si apre in una nuova scheda: questa pagina rimane disponibile per tornare alla regia.</div>
  </main>;
}
