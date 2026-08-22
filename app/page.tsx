'use client';
import { useMemo, useState } from 'react';

const machines = [
  { name: 'Putzmeister M 36-4', type: 'Pompa autocarrata 36 m', site: 'Bareggio', status: 'Disponibile', qty: 2 },
  { name: 'Schwing S 42 SX', type: 'Pompa autocarrata 42 m', site: 'Padernello', status: 'Disponibile', qty: 1 },
  { name: 'Putzmeister M 47-5', type: 'Pompa autocarrata 47 m', site: 'Bareggio', status: 'In rientro', qty: 1 },
];
const steps = ['Servizio', 'Cantiere', 'Periodo', 'Verifica', 'Preventivo'];

export default function Home() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState('caldo');
  const [city, setCity] = useState('Milano');
  const [date, setDate] = useState('2026-08-26');
  const [days, setDays] = useState('3');
  const [reach, setReach] = useState('36');
  const price = useMemo(() => (service === 'freddo' ? 1450 : service === 'semifreddo' ? 2050 : 2950) * Number(days || 1) + (Number(reach) > 36 ? 780 : 0), [service, days, reach]);
  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return <main>
    <header className="topbar"><div className="brand"><img src="/dalecom-logo.png" alt="Dalecom" /><span>Preventivo immediato</span></div><div className="secure"><i /> Sistema disponibilità in tempo reale</div></header>
    <section className="hero"><div className="eyebrow">NOLEGGIO E POMPAGGIO CALCESTRUZZO</div><h1>La macchina giusta.<br/><em>Quando ti serve.</em></h1><p>Descrivi il lavoro, verifichiamo subito mezzi e squadre disponibili e prepariamo la tua proposta.</p><div className="trust"><span>✓ Risposta immediata</span><span>✓ Disponibilità verificata</span><span>✓ Preventivo su misura</span></div></section>
    <section className="workspace">
      <nav className="stepper">{steps.map((label, i) => <div key={label} className={i === step ? 'active' : i < step ? 'done' : ''}><b>{i < step ? '✓' : i + 1}</b><span>{label}</span></div>)}</nav>
      <div className="panel">
        {step === 0 && <div className="screen"><div className="screen-head"><span>01</span><div><h2>Come possiamo aiutarti?</h2><p>Scegli la formula più adatta al tuo cantiere.</p></div></div><div className="choices">{[
          ['freddo','Noleggio a freddo','Solo macchinario','Pompa o braccio senza operatore Dalecom'],
          ['semifreddo','Noleggio semifreddo','Mezzo + capo squadra','Il tuo personale, coordinato da un nostro esperto'],
          ['caldo','Servizio a caldo','Squadra completa','Macchina, operatori ed esecuzione del pompaggio'],
        ].map(([id,title,kicker,desc]) => <button key={id} className={service === id ? 'choice selected' : 'choice'} onClick={() => setService(id)}><span className="radio"/><small>{kicker}</small><h3>{title}</h3><p>{desc}</p></button>)}</div></div>}
        {step === 1 && <div className="screen"><div className="screen-head"><span>02</span><div><h2>Parlaci del cantiere</h2><p>Pochi dati per individuare il mezzo corretto.</p></div></div><div className="form-grid"><label>Comune del cantiere<input value={city} onChange={e=>setCity(e.target.value)} /></label><label>Altezza / sbraccio richiesto<select value={reach} onChange={e=>setReach(e.target.value)}><option value="28">Fino a 28 metri</option><option value="36">Fino a 36 metri</option><option value="42">Fino a 42 metri</option><option value="47">Fino a 47 metri</option></select></label><label className="wide">Tipo di intervento<select><option>Getto solaio / platea</option><option>Fondazioni</option><option>Opere infrastrutturali</option></select></label><div className="note wide"><b>Accesso verificabile</b><span>Il responsabile Dalecom confermerà ingombri e condizioni di piazzamento.</span></div></div></div>}
        {step === 2 && <div className="screen"><div className="screen-head"><span>03</span><div><h2>Quando ti serve?</h2><p>Controlleremo mezzi, operatori e manutenzioni già pianificate.</p></div></div><div className="form-grid dates"><label>Data di inizio<input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label><label>Durata prevista<select value={days} onChange={e=>setDays(e.target.value)}><option value="1">1 giornata</option><option value="3">3 giornate</option><option value="5">1 settimana lavorativa</option><option value="20">1 mese</option></select></label><div className="availability wide"><div className="pulse"/><div><b>Calendari Dalecom collegati</b><span>4 mezzi compatibili e 3 squadre analizzati sul periodo selezionato</span></div></div></div></div>}
        {step === 3 && <div className="screen"><div className="screen-head"><span>04</span><div><h2>Disponibilità verificata</h2><p>Abbiamo incrociato requisiti, sede, calendario e stato manutentivo.</p></div></div><div className="match"><div><small>MIGLIORE SOLUZIONE</small><h3>{Number(reach)>36?'Schwing S 42 SX':'Putzmeister M 36-4'}</h3><p>Configurazione compatibile con il cantiere di {city}</p></div><strong>98<span>%</span><small>compatibilità</small></strong></div><div className="machine-table">{machines.map((m,i)=><div key={m.name} className={i===0?'recommended':''}><span className="machine-icon">↗</span><div><b>{m.name}</b><small>{m.type} · Polo {m.site}</small></div><span className="qty">{m.qty} unità</span><span className={m.status==='Disponibile'?'tag ok':'tag'}>{m.status}</span></div>)}</div></div>}
        {step === 4 && <div className="screen quote-screen"><div className="success-mark">✓</div><small className="ready">PROPOSTA PRONTA</small><h2>Il tuo cantiere può partire.</h2><p className="lead">Abbiamo riservato temporaneamente la configurazione migliore.</p><div className="quote-card"><div className="quote-title"><div><small>PREVENTIVO INDICATIVO</small><b>DL-2026-0826</b></div><span>Validità 48 ore</span></div><div className="summary"><div><small>Servizio</small><b>{service==='caldo'?'A caldo':service==='semifreddo'?'Semifreddo':'A freddo'}</b></div><div><small>Periodo</small><b>{days} {days==='1'?'giorno':'giorni'}</b></div><div><small>Mezzo</small><b>{Number(reach)>36?'42 m':'36 m'}</b></div></div><div className="total"><span>Importo stimato<small>IVA esclusa · trasferta inclusa</small></span><strong>€ {price.toLocaleString('it-IT')}</strong></div></div><div className="quote-actions"><button className="primary" onClick={()=>window.print()}>Scarica proposta PDF</button><button className="secondary">Parla con un consulente</button></div></div>}
        {step < 4 && <div className="actions"><button className="back" onClick={back} disabled={step===0}>Indietro</button><button className="primary" onClick={next}>{step===2?'Verifica disponibilità':'Continua'} <span>→</span></button></div>}
      </div>
    </section>
    <footer><b>DALECOM</b><span>Soluzioni per il pompaggio del calcestruzzo</span><small>Demo dimostrativa · dati di disponibilità simulati</small></footer>
  </main>;
}
