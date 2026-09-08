# Dalecom Digital Control Room

Piattaforma dimostrativa Dalecom che riunisce preventivazione, flotta, logistica, personale, sicurezza, manutenzioni, governance e gli altri moduli operativi in un'unica regia digitale.

## Moduli principali

- Preventivatore immediato e acquisizione lead 1C
- Flotta targata e macchine operatrici, con Wialon e Diaboard
- Logistica con pianificazione di cantieri, mezzi, macchine e uomini
- App e rapportini dipendenti
- HR e buste paga
- Sicurezza, Safety Passport e Dalecom Academy
- Magazzino, officina, manutenzioni e lavaggi
- Governance e dashboard CEO
- Legal, energia, marketing, bandi e ottimizzazioni

## Avvio locale

Requisiti: Node.js 22 o superiore e pnpm.

```bash
pnpm install
pnpm dev
```

L'applicazione è disponibile su `http://localhost:3000`.

## Configurazione

Le credenziali non sono incluse nel repository. Le integrazioni server utilizzano variabili d'ambiente, tra cui:

```text
DIABOARD_EMAIL
DIABOARD_PASSWORD
WIALON_TOKEN
```

Le ulteriori variabili richieste dalle integrazioni 1C e dagli ambienti di produzione devono essere configurate nel gestore segreti dell'hosting.

## Verifica

```bash
pnpm test
pnpm build
```

Il progetto include test automatici per le regole economiche del preventivatore, i payload 1C, la pianificazione logistica, la sicurezza e i flussi Academy.

## Sicurezza

Non inserire password, token o chiavi API nel codice o nei commit. Utilizzare esclusivamente segreti d'ambiente lato server.

Progetto Dalecom - powered by Dennis e Thomas.

## Accesso alternativo

GitHub Pages espone un ingresso alternativo alla regia completa. Il backend, le API e i segreti restano nell'ambiente server Dalecom: non vengono duplicati né pubblicati nel repository.
