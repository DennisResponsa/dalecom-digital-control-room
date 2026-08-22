'use client';
import { useMemo, useState } from 'react';

type Place = { name:string; km:number };
const areas: Record<string, Record<string, Place[]>> = {
  Veneto: {
    Treviso:[{name:'Paese',km:0},{name:'Treviso',km:12},{name:'Montebelluna',km:21},{name:'Castelfranco Veneto',km:31},{name:'Conegliano',km:47}],
    Venezia:[{name:'Venezia',km:46},{name:'Mestre',km:39},{name:'Mirano',km:40},{name:'San Donà di Piave',km:62}],
    Padova:[{name:'Padova',km:56},{name:'Cittadella',km:42},{name:'Este',km:88}],
    Vicenza:[{name:'Vicenza',km:76},{name:'Bassano del Grappa',km:54},{name:'Schio',km:92}],
    Verona:[{name:'Verona',km:132},{name:'Legnago',km:129}],
  },
  Lombardia: {
    Milano:[{name:'Milano',km:282},{name:'Bareggio',km:291},{name:'Rho',km:287},{name:'Sesto San Giovanni',km:278}],
    Bergamo:[{name:'Bergamo',km:226},{name:'Treviglio',km:246}],
    Brescia:[{name:'Brescia',km:183},{name:'Desenzano del Garda',km:158}],
    Monza:[{name:'Monza',km:270},{name:'Vimercate',km:261}],
  },
  EmiliaRomagna: {
    Bologna:[{name:'Bologna',km:176},{name:'Imola',km:208}],
    Modena:[{name:'Modena',km:188},{name:'Carpi',km:205}],
    Ferrara:[{name:'Ferrara',km:117},{name:'Cento',km:151}],
  },
  Piemonte: { Torino:[{name:'Torino',km:417},{name:'Moncalieri',km:424}], Novara:[{name:'Novara',km:336}] },
  Lazio: { Roma:[{name:'Roma',km:548},{name:'Fiumicino',km:579}] },
};

const equipmentOptions = [
  ['autopompa','Autopompa carrata','Per getti con braccio direttamente dal mezzo','820'],
  ['city','City pump','Compatta per centri urbani e accessi stretti','380'],
  ['carrellata','Pompa carrellata / cingolata','Per lunghe distanze e cantieri complessi','460'],
  ['braccio','Braccio stazionario','Per cantieri verticali o di lunga durata','720'],
  ['malte','Pompa per malte / intonaci','Per sottofondi, malte e materiali speciali','190'],
  ['accessori','Attrezzature e accessori','Tubazioni, compressori e dotazioni di supporto','80'],
];
const assetsByEquipment: Record<string,{name:string;type:string;site:string;qty:number;status:string}[]> = {
  autopompa:[{name:'Putzmeister M20 · GJ584JY',type:'Autopompa carrata',site:'Paese',qty:2,status:'Disponibile'},{name:'MAN TGA 26.4 · GY967NP',type:'Autopompa carrata',site:'Bareggio',qty:1,status:'In rientro'}],
  city:[{name:'Mecbo City Pump · HA095NA',type:'City pump compatta',site:'Paese',qty:1,status:'Disponibile'},{name:'Scania City Pump · GY915DK',type:'City pump urbana',site:'Bareggio',qty:1,status:'Disponibile'}],
  carrellata:[{name:'Putzmeister P715 TD',type:'Pompa carrellata · 17,4 m³/h',site:'Paese',qty:1,status:'Disponibile'},{name:'Turbosol TB30 Cingolata',type:'Pompa carrellata · 30 m³/h',site:'Bareggio',qty:3,status:'Disponibile'}],
  braccio:[{name:'Putzmeister MX28',type:'Braccio stazionario 28 m',site:'Paese',qty:1,status:'Disponibile'},{name:'Putzmeister MX36-4',type:'Braccio stazionario 36 m',site:'Bareggio',qty:1,status:'Manutenzione programmata'}],
  malte:[{name:'Putzmeister SP 11 LMR',type:'Pompa per malte',site:'Paese',qty:1,status:'Disponibile'},{name:'Turbosol Transmat 250',type:'Pompa per massetti',site:'Bareggio',qty:1,status:'Disponibile'}],
  accessori:[{name:'Atlas Copco XAS 58',type:'Compressore 3.000 L/min',site:'Paese',qty:2,status:'Disponibile'},{name:'Kit tubazioni ferro/gomma',type:'Accessori pompaggio',site:'Paese',qty:18,status:'Disponibile'}],
};
const steps=['Servizio','Cantiere','Periodo','Verifica','Preventivo'];

function logisticsFor(km:number){
  if(km<=50)return {band:'Fino a 50 km',oneWay:2600};
  if(km<=150)return {band:'Da 50 a 150 km',oneWay:3640};
  if(km<=300)return {band:'Da 150 a 300 km',oneWay:4680};
  if(km<=500)return {band:'Da 300 a 500 km',oneWay:5720};
  if(km<=650)return {band:'Da 500 a 650 km',oneWay:6760};
  return {band:'Oltre 650 km / isole',oneWay:9100};
}

export default function Home(){
  const [step,setStep]=useState(0); const [service,setService]=useState('caldo'); const [equipment,setEquipment]=useState('autopompa');
  const [region,setRegion]=useState('Veneto'); const [province,setProvince]=useState('Treviso'); const [city,setCity]=useState('Treviso');
  const [volume,setVolume]=useState('80'); const [reach,setReach]=useState('36'); const [access,setAccess]=useState('standard');
  const [date,setDate]=useState('2026-08-26'); const [duration,setDuration]=useState('3'); const [shift,setShift]=useState('diurno');
  const provinces=Object.keys(areas[region]); const towns=areas[region][province]; const place=towns.find(x=>x.name===city)??towns[0];
  const selectedEquipment=equipmentOptions.find(x=>x[0]===equipment)??equipmentOptions[0]; const logistics=logisticsFor(place.km);
  const matchedAssets=assetsByEquipment[equipment];
  const quote=useMemo(()=>{
    const rental=Number(selectedEquipment[3])*Number(duration);
    const crew=service==='freddo'?0:service==='semifreddo'?630*Number(duration):1116*Number(duration);
    const extras=(shift==='notturno'?450:0)+(access==='difficile'?380:0);
    return {rental,crew,extras,transport:logistics.oneWay*2,total:rental+crew+extras+logistics.oneWay*2};
  },[selectedEquipment,service,duration,shift,access,logistics]);
  const chooseRegion=(v:string)=>{setRegion(v);const p=Object.keys(areas[v])[0];setProvince(p);setCity(areas[v][p][0].name)};
  const chooseProvince=(v:string)=>{setProvince(v);setCity(areas[region][v][0].name)};
  return <main>
    <header className="topbar"><div className="brand"><img src="/dalecom-logo.png" alt="Dalecom"/><span>Preventivo immediato</span></div><div className="secure"><i/> Sistema disponibilità in tempo reale</div></header>
    <section className="hero"><div className="eyebrow">NOLEGGIO E POMPAGGIO CALCESTRUZZO</div><h1>La macchina giusta.<br/><em>Quando ti serve.</em></h1><p>Configura il lavoro, verifichiamo mezzi e squadre e prepariamo una proposta trasparente.</p><div className="trust"><span>✓ Risposta immediata</span><span>✓ Disponibilità verificata</span><span>✓ Costi di trasporto calcolati</span></div></section>
    <section className="workspace"><nav className="stepper" aria-label="Fasi del preventivo">{steps.map((x,i)=><button type="button" key={x} disabled={i>step} onClick={()=>i<=step&&setStep(i)} className={i===step?'active':i<step?'done':''} aria-current={i===step?'step':undefined}><b>{i<step?'✓':i+1}</b><span>{x}</span></button>)}</nav><div className="panel">
      {step===0&&<div className="screen"><div className="screen-head"><span>01</span><div><h2>Che cosa ti serve?</h2><p>Scegli formula e famiglia di macchina. Potrai affinare i requisiti dopo.</p></div></div><h4 className="group-title">Formula operativa</h4><div className="service-pills">{[['freddo','A freddo','Solo mezzo'],['semifreddo','Semifreddo','Mezzo + preposto'],['caldo','A caldo','Squadra completa']].map(x=><button key={x[0]} className={service===x[0]?'selected':''} onClick={()=>setService(x[0])}><b>{x[1]}</b><small>{x[2]}</small></button>)}</div><h4 className="group-title">Macchina o attrezzatura</h4><div className="equipment-grid">{equipmentOptions.map(x=><button key={x[0]} className={equipment===x[0]?'selected':''} onClick={()=>setEquipment(x[0])}><span className="radio"/><h3>{x[1]}</h3><p>{x[2]}</p></button>)}</div></div>}
      {step===1&&<div className="screen"><div className="screen-head"><span>02</span><div><h2>Dove e che lavoro dobbiamo fare?</h2><p>La località determina la distanza stradale dalla sede Dalecom di Paese (TV).</p></div></div><div className="form-grid location-grid"><label>Regione<select value={region} onChange={e=>chooseRegion(e.target.value)}>{Object.keys(areas).map(x=><option key={x} value={x}>{x==='EmiliaRomagna'?'Emilia-Romagna':x}</option>)}</select></label><label>Provincia<select value={province} onChange={e=>chooseProvince(e.target.value)}>{provinces.map(x=><option key={x}>{x}</option>)}</select></label><label>Comune<select value={city} onChange={e=>setCity(e.target.value)}>{towns.map(x=><option key={x.name}>{x.name}</option>)}</select></label><label>Distanza stimata da Paese<input readOnly value={`${place.km} km`} /></label><label>Volume indicativo (m³)<input type="number" min="1" value={volume} onChange={e=>setVolume(e.target.value)}/></label><label>Sbraccio / altezza<select value={reach} onChange={e=>setReach(e.target.value)}><option value="0">Non applicabile</option><option value="20">Fino a 20 m</option><option value="28">Fino a 28 m</option><option value="36">Fino a 36 m</option><option value="42">Oltre 36 m</option></select></label><label>Accessibilità del piazzamento<select value={access} onChange={e=>setAccess(e.target.value)}><option value="standard">Standard · accesso carrabile</option><option value="stretto">Spazio ristretto / centro urbano</option><option value="difficile">Difficile · sopralluogo necessario</option></select></label><label>Tipo di intervento<select><option>Solaio / platea</option><option>Fondazioni</option><option>Pareti e strutture verticali</option><option>Galleria / opera infrastrutturale</option><option>Massetti, malte o intonaci</option></select></label><div className="route-card wide"><span>PAESE (TV)</span><i>→ {place.km} km →</i><b>{city.toUpperCase()}</b><small>Fascia listino: {logistics.band}</small></div></div></div>}
      {step===2&&<div className="screen"><div className="screen-head"><span>03</span><div><h2>Quando e per quanto tempo?</h2><p>Controlliamo contemporaneamente mezzo, operatori e blocchi manutentivi.</p></div></div><div className="form-grid dates"><label>Data di inizio<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Durata<select value={duration} onChange={e=>setDuration(e.target.value)}><option value="1">1 giornata</option><option value="3">3 giornate</option><option value="5">1 settimana lavorativa</option><option value="20">1 mese</option></select></label><label>Fascia operativa<select value={shift} onChange={e=>setShift(e.target.value)}><option value="diurno">Diurna feriale</option><option value="notturno">Notturna / festiva</option></select></label><label>Flessibilità data<select><option>Data tassativa</option><option>± 1 giorno</option><option>± 3 giorni</option></select></label><div className="availability wide"><div className="pulse"/><div><b>Verifica combinata pronta</b><span>Mezzi, squadre, manutenzioni, trasferimenti e sede di partenza</span></div></div></div></div>}
      {step===3&&<div className="screen"><div className="screen-head"><span>04</span><div><h2>Soluzione trovata</h2><p>Compatibilità verificata per {volume} m³ a {city}, dal {new Date(date).toLocaleDateString('it-IT')}.</p></div></div><div className="match"><div><small>MIGLIORE CONFIGURAZIONE</small><h3>{selectedEquipment[1]}</h3><p>{service==='caldo'?'Squadra completa':service==='semifreddo'?'Mezzo e preposto Dalecom':'Noleggio senza personale'} · {logistics.band}</p></div><strong>96<span>%</span><small>compatibilità</small></strong></div><div className="machine-table">{matchedAssets.map((m,i)=><div key={m.name} className={i===0?'recommended':''}><span className="machine-icon">↗</span><div><b>{m.name}</b><small>{m.type} · Polo {m.site}</small></div><span className="qty">{m.qty} unità</span><span className={m.status==='Disponibile'?'tag ok':'tag'}>{m.status}</span></div>)}</div><div className="warning-line"><b>Alternativa automatica:</b> se la prima macchina viene impegnata, la richiesta resta evasa e parte un alert al responsabile noleggi.</div></div>}
      {step===4&&<div className="screen quote-screen"><div className="success-mark">✓</div><small className="ready">PROPOSTA PRONTA</small><h2>Il tuo cantiere può partire.</h2><p className="lead">Configurazione e disponibilità riservate per 48 ore.</p><div className="quote-card"><div className="quote-title"><div><small>PREVENTIVO INDICATIVO</small><b>DL-2026-0826</b></div><span>Validità 48 ore</span></div><div className="summary four"><div><small>Servizio</small><b>{service==='caldo'?'A caldo':service==='semifreddo'?'Semifreddo':'A freddo'}</b></div><div><small>Attrezzatura</small><b>{selectedEquipment[1]}</b></div><div><small>Località</small><b>{city} · {place.km} km</b></div><div><small>Periodo</small><b>{duration} gg</b></div></div><div className="cost-lines"><div><span>Noleggio attrezzatura</span><b>€ {quote.rental.toLocaleString('it-IT')}</b></div>{quote.crew>0&&<div><span>Personale operativo</span><b>€ {quote.crew.toLocaleString('it-IT')}</b></div>}<div><span>Allestimento cantiere · {logistics.band}</span><b>€ {logistics.oneWay.toLocaleString('it-IT')}</b></div><div><span>Disallestimento e rientro</span><b>€ {logistics.oneWay.toLocaleString('it-IT')}</b></div>{quote.extras>0&&<div><span>Maggiorazioni operative</span><b>€ {quote.extras.toLocaleString('it-IT')}</b></div>}</div><div className="total"><span>Totale indicativo<small>IVA esclusa · conferma tecnica soggetta a sopralluogo</small></span><strong>€ {quote.total.toLocaleString('it-IT')}</strong></div></div><div className="quote-actions"><button className="back-link" onClick={()=>setStep(3)}>← Modifica le scelte</button><button className="primary" onClick={()=>window.print()}>Scarica proposta PDF</button><button className="secondary">Richiedi conferma definitiva</button></div></div>}
      {step<4&&<div className="actions"><button className="back" onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0}>Indietro</button><button className="primary" onClick={()=>setStep(Math.min(4,step+1))}>{step===2?'Verifica disponibilità':'Continua'} <span>→</span></button></div>}
    </div></section><footer><b>DALECOM</b><span>Soluzioni per il pompaggio del calcestruzzo</span><small>Demo dimostrativa · disponibilità simulate, fasce economiche dal listino Dalecom</small></footer>
  </main>;
}
