import styles from "../operational-area.module.css";

const oneCUrl = "https://sharedhosting.cloud2.1c-erp.it/Dalecom/";

export default function GovernanceArea() {
  return <main className={styles.page}>
    <header className={styles.top}>
      <div className={styles.wordmark} aria-label="Dalecom"><i /><b>DALECOM</b></div>
      <a className={styles.back} href="/demo">← Regia principale</a>
    </header>
    <section className={styles.hero}>
      <div className={styles.eyebrow}>GOVERNANCE · CONTROLLO · DECISIONI</div>
      <h1>Tutta l’azienda.<br /><em>In un solo quadro.</em></h1>
      <p>Ricavi, costi, marginalità, mezzi e cantieri diventano indicatori leggibili per decidere mentre il lavoro sta accadendo.</p>
    </section>
    <section className={styles.panel}>
      <div><small>CRUSCOTTO DIREZIONALE</small><h2>Apri la dashboard di governance</h2><p>La dimostrazione prosegue nel cruscotto 1C preparato per la direzione Dalecom.</p></div>
      <div className={styles.actions}><a className={styles.secondary} href="/demo">Torna alla regia</a><a className={styles.primary} href={oneCUrl} target="_blank" rel="noreferrer">Apri 1C ↗</a></div>
    </section>
    <div className={styles.note}>L’ambiente 1C si apre in una nuova scheda: questa pagina rimane disponibile per tornare alla regia.</div>
  </main>;
}
