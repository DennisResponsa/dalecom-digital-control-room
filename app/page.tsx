"use client";
import { useMemo, useState } from "react";

type Place = { name: string; km: number };
type Asset = {
  name: string;
  type: string;
  site: string;
  qty: number;
  status: string;
  specs: string[];
  maxAggregate: number;
};
const areas: Record<string, Record<string, Place[]>> = {
  Veneto: {
    Treviso: [
      { name: "Paese", km: 0 },
      { name: "Treviso", km: 12 },
      { name: "Montebelluna", km: 21 },
      { name: "Castelfranco Veneto", km: 31 },
      { name: "Conegliano", km: 47 },
    ],
    Venezia: [
      { name: "Venezia", km: 46 },
      { name: "Mestre", km: 39 },
      { name: "Mirano", km: 40 },
      { name: "San Donà di Piave", km: 62 },
    ],
    Padova: [
      { name: "Padova", km: 56 },
      { name: "Cittadella", km: 42 },
      { name: "Este", km: 88 },
    ],
    Vicenza: [
      { name: "Vicenza", km: 76 },
      { name: "Bassano del Grappa", km: 54 },
      { name: "Schio", km: 92 },
    ],
    Verona: [
      { name: "Verona", km: 132 },
      { name: "Legnago", km: 129 },
    ],
  },
  Lombardia: {
    Milano: [
      { name: "Milano", km: 282 },
      { name: "Bareggio", km: 291 },
      { name: "Rho", km: 287 },
      { name: "Sesto San Giovanni", km: 278 },
    ],
    Bergamo: [
      { name: "Bergamo", km: 226 },
      { name: "Treviglio", km: 246 },
    ],
    Brescia: [
      { name: "Brescia", km: 183 },
      { name: "Desenzano del Garda", km: 158 },
    ],
    Monza: [
      { name: "Monza", km: 270 },
      { name: "Vimercate", km: 261 },
    ],
  },
  EmiliaRomagna: {
    Bologna: [
      { name: "Bologna", km: 176 },
      { name: "Imola", km: 208 },
    ],
    Modena: [
      { name: "Modena", km: 188 },
      { name: "Carpi", km: 205 },
    ],
    Ferrara: [
      { name: "Ferrara", km: 117 },
      { name: "Cento", km: 151 },
    ],
  },
  Piemonte: {
    Torino: [
      { name: "Torino", km: 417 },
      { name: "Moncalieri", km: 424 },
    ],
    Novara: [{ name: "Novara", km: 336 }],
  },
  Lazio: {
    Roma: [
      { name: "Roma", km: 548 },
      { name: "Fiumicino", km: 579 },
    ],
  },
};

const equipmentOptions = [
  [
    "autopompa",
    "Autopompa carrata",
    "Per getti con braccio direttamente dal mezzo",
    "820",
  ],
  ["city", "City pump", "Compatta per centri urbani e accessi stretti", "380"],
  [
    "carrellata",
    "Pompa carrellata / cingolata",
    "Per lunghe distanze e cantieri complessi",
    "460",
  ],
  [
    "malte",
    "Pompa per malte / intonaci",
    "Per sottofondi, malte e materiali speciali",
    "190",
  ],
];
const assetsByEquipment: Record<string, Asset[]> = {
  autopompa: [
    {
      name: "Putzmeister M20 · GJ584JY",
      type: "Autopompa carrata",
      site: "Paese",
      qty: 2,
      status: "Disponibile",
      maxAggregate: 32,
      specs: [
        "Braccio verticale 20 m",
        "Ingombro compatto",
        "Ideale per solai e fondazioni",
      ],
    },
    {
      name: "MAN TGA 26.4 · GY967NP",
      type: "Autopompa carrata",
      site: "Bareggio",
      qty: 1,
      status: "Disponibile",
      maxAggregate: 32,
      specs: [
        "Braccio verticale 36 m",
        "Portata elevata",
        "Per getti strutturali complessi",
      ],
    },
  ],
  city: [
    {
      name: "Mecbo City Pump · HA095NA",
      type: "City pump compatta",
      site: "Paese",
      qty: 1,
      status: "Disponibile",
      maxAggregate: 32,
      specs: ["Larghezza ridotta", "Radiocomando", "Accessi urbani e cortili"],
    },
    {
      name: "Scania City Pump · GY915DK",
      type: "City pump urbana",
      site: "Bareggio",
      qty: 1,
      status: "Disponibile",
      maxAggregate: 32,
      specs: [
        "Elevata manovrabilità",
        "Tubazione modulare",
        "Cantieri urbani e spazi stretti",
      ],
    },
  ],
  carrellata: [
    {
      name: "Putzmeister P715 TD",
      type: "Pompa carrellata · 17,4 m³/h",
      site: "Paese",
      qty: 1,
      status: "Disponibile",
      maxAggregate: 16,
      specs: ["Portata 17,4 m³/h", "Trainabile", "Lunghe distanze orizzontali"],
    },
    {
      name: "Turbosol TB30 Cingolata",
      type: "Pompa carrellata · 30 m³/h",
      site: "Bareggio",
      qty: 3,
      status: "Disponibile",
      maxAggregate: 35,
      specs: [
        "Portata 30 m³/h",
        "Sottocarro cingolato",
        "Terreni difficili e gallerie",
      ],
    },
  ],
  braccio: [
    {
      name: "Putzmeister MX28",
      type: "Braccio stazionario 28 m",
      site: "Paese",
      qty: 1,
      status: "Disponibile",
      maxAggregate: 32,
      specs: [
        "Sbraccio 28 m",
        "Installazione su colonna",
        "Edifici multipiano",
      ],
    },
    {
      name: "Putzmeister MX36-4",
      type: "Braccio stazionario 36 m",
      site: "Bareggio",
      qty: 1,
      status: "Disponibile",
      maxAggregate: 32,
      specs: ["Sbraccio 36 m", "Quattro sezioni", "Grandi cantieri verticali"],
    },
  ],
  malte: [
    {
      name: "Putzmeister SP 11 LMR",
      type: "Pompa per malte",
      site: "Paese",
      qty: 1,
      status: "Disponibile",
      maxAggregate: 8,
      specs: [
        "Malte, intonaci e boiacche",
        "Miscelatore integrato",
        "Pompaggio continuo",
      ],
    },
    {
      name: "Turbosol Transmat 250",
      type: "Pompa per massetti",
      site: "Bareggio",
      qty: 1,
      status: "Disponibile",
      maxAggregate: 8,
      specs: [
        "Massetti sabbia-cemento",
        "Trasporto pneumatico",
        "Miscelazione da 250 l",
      ],
    },
  ],
  accessori: [
    {
      name: "Atlas Copco XAS 58",
      type: "Compressore 3.000 L/min",
      site: "Paese",
      qty: 2,
      status: "Disponibile",
      maxAggregate: 32,
      specs: [
        "Portata aria 3.000 l/min",
        "Trainabile",
        "Pulizia tubazioni e servizi aria",
      ],
    },
    {
      name: "Kit tubazioni ferro/gomma",
      type: "Accessori pompaggio",
      site: "Paese",
      qty: 18,
      status: "Disponibile",
      maxAggregate: 32,
      specs: [
        "Tratte modulari",
        "Curve e raccordi inclusi",
        "Configurazione su misura",
      ],
    },
  ],
};
const interventions: Record<string, string[]> = {
  autopompa: ["Solaio / platea", "Fondazioni", "Pareti e strutture verticali"],
  city: [
    "Solaio / platea in spazio ristretto",
    "Fondazioni in centro urbano",
    "Piccoli getti strutturali",
  ],
  carrellata: [
    "Galleria / opera infrastrutturale",
    "Getto a lunga distanza",
    "Fondazioni con accesso difficile",
  ],
  braccio: [
    "Edificio multipiano",
    "Pareti e strutture verticali",
    "Grande solaio in quota",
  ],
  malte: [
    "Intonaci interni o esterni",
    "Massetti e sottofondi",
    "Malte, boiacche o materiali speciali",
  ],
  accessori: [
    "Prolungamento linea di pompaggio",
    "Pulizia tubazioni ad aria",
    "Dotazioni accessorie di cantiere",
  ],
};
const steps = ["Servizio", "Cantiere", "Periodo", "Verifica", "Preventivo"];
const aggregateOptions: Record<string, number[]> = {
  autopompa: [8, 16, 20, 25, 32],
  city: [8, 16, 20, 25, 32],
  carrellata: [8, 16, 20, 25, 32],
  malte: [8],
};

function logisticsFor(km: number) {
  if (km <= 50) return { band: "Fino a 50 km", oneWay: 2600 };
  if (km <= 150) return { band: "Da 50 a 150 km", oneWay: 3640 };
  if (km <= 300) return { band: "Da 150 a 300 km", oneWay: 4680 };
  if (km <= 500) return { band: "Da 300 a 500 km", oneWay: 5720 };
  if (km <= 650) return { band: "Da 500 a 650 km", oneWay: 6760 };
  return { band: "Oltre 650 km / isole", oneWay: 9100 };
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState("caldo");
  const [equipment, setEquipment] = useState("autopompa");
  const [region, setRegion] = useState("Veneto");
  const [province, setProvince] = useState("Treviso");
  const [city, setCity] = useState("Treviso");
  const [volume, setVolume] = useState("80");
  const [totalVolume, setTotalVolume] = useState("400");
  const [weeklyPours, setWeeklyPours] = useState("2");
  const [reach, setReach] = useState("36");
  const [access, setAccess] = useState("standard");
  const [granulometry, setGranulometry] = useState("D20");
  const [lineDistance, setLineDistance] = useState("30");
  const [elevation, setElevation] = useState("0");
  const [needBoom, setNeedBoom] = useState("no");
  const [needCompressor, setNeedCompressor] = useState("no");
  const [floors, setFloors] = useState("1");
  const [date, setDate] = useState("2026-08-26");
  const [duration, setDuration] = useState("3");
  const [shift, setShift] = useState("diurno");
  const [intervention, setIntervention] = useState(interventions.autopompa[0]);
  const [assetIndex, setAssetIndex] = useState(0);
  const [detailsIndex, setDetailsIndex] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [client, setClient] = useState({
    company: "",
    vat: "",
    name: "",
    email: "",
    phone: "",
    privacy: false,
  });
  const provinces = Object.keys(areas[region]);
  const towns = areas[region][province];
  const place = towns.find((x) => x.name === city) ?? towns[0];
  const selectedEquipment =
    equipmentOptions.find((x) => x[0] === equipment) ?? equipmentOptions[0];
  const logistics = logisticsFor(place.km);
  const aggregateSize = Number(granulometry.replace("D", ""));
  const matchedAssets = assetsByEquipment[equipment].filter(
    (asset) => aggregateSize <= asset.maxAggregate,
  );
  const selectedAsset = matchedAssets[assetIndex] ?? matchedAssets[0];
  const lineMeters =
    Math.max(0, Number(lineDistance) || 0) + Math.abs(Number(elevation) || 0);
  const tubeCount = Math.max(1, Math.ceil(lineMeters / 3));
  const rubberTubes = 1;
  const ironTubes = Math.max(0, tubeCount - rubberTubes);
  const curveCount =
    2 +
    Math.ceil(Math.abs(Number(elevation) || 0) / 12) +
    (needBoom === "si" ? 1 : 0);
  const kitCount = Math.max(1, Math.ceil(Number(floors) || 1));
  const tubeRates =
    Number(duration) <= 1
      ? { iron: 10, rubber: 10 }
      : Number(duration) <= 7
        ? { iron: 20, rubber: 40 }
        : { iron: 30, rubber: 80 };
  const tubeCost = ironTubes * tubeRates.iron + rubberTubes * tubeRates.rubber;
  const boomCost =
    needBoom === "si" && equipment !== "braccio" ? 720 * Number(duration) : 0;
  const durationDays = Number(duration);
  const durationLabel =
    durationDays === 20
      ? "1 mese"
      : durationDays === 1
        ? "1 giornata"
        : `${durationDays} giornate`;
  const rentalWeeks = Math.max(1, Math.ceil(durationDays / 5));
  const crewDays = Math.min(
    durationDays,
    Math.max(1, Number(weeklyPours) || 1) * rentalWeeks,
  );
  const clientValid =
    client.company.trim().length > 1 &&
    client.name.trim().length > 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email) &&
    client.phone.trim().length > 5 &&
    client.privacy;
  const quote = useMemo(() => {
    const rental = Number(selectedEquipment[3]) * Number(duration);
    const crew =
      service === "freddo"
        ? 0
        : service === "semifreddo"
          ? 630 * crewDays
          : 1116 * crewDays;
    const extras =
      (shift === "notturno" ? 450 : 0) + (access === "difficile" ? 380 : 0);
    return {
      rental,
      crew,
      extras,
      tubes: tubeCost,
      boom: boomCost,
      transport: logistics.oneWay * 2,
      total:
        rental + crew + extras + tubeCost + boomCost + logistics.oneWay * 2,
    };
  }, [
    selectedEquipment,
    service,
    duration,
    crewDays,
    shift,
    access,
    logistics,
    tubeCost,
    boomCost,
  ]);
  const chooseRegion = (v: string) => {
    setRegion(v);
    const p = Object.keys(areas[v])[0];
    setProvince(p);
    setCity(areas[v][p][0].name);
  };
  const chooseProvince = (v: string) => {
    setProvince(v);
    setCity(areas[region][v][0].name);
  };
  const chooseEquipment = (v: string) => {
    setEquipment(v);
    if (!aggregateOptions[v].includes(Number(granulometry.replace("D", "")))) {
      setGranulometry(`D${aggregateOptions[v][0]}`);
    }
    setIntervention(interventions[v][0]);
    setAssetIndex(0);
    setDetailsIndex(null);
  };
  const updateClient = (field: string, value: string | boolean) => {
    setConfirmed(false);
    setClient((c) => ({ ...c, [field]: value }));
  };
  const submitLead = () => {
    if (!clientValid) return;
    setConfirmed(true);
    const subject = `Richiesta preventivo Dalecom · ${client.company} · DL-2026-0826`;
    const body = [
      `Nuovo lead dal configuratore Dalecom`,
      ``,
      `Azienda: ${client.company}`,
      `P. IVA/C.F.: ${client.vat || "Non indicata"}`,
      `Referente: ${client.name}`,
      `Email: ${client.email}`,
      `Telefono: ${client.phone}`,
      ``,
      `Lavorazione: ${intervention}`,
      `Macchina: ${selectedAsset.name}`,
      `Volume indicativo per getto: ${volume} m³`,
      `Volume totale: ${totalVolume} m³`,
      `Numero getti settimanali: ${weeklyPours}`,
      `Granulometria: ${granulometry.replace("D", "Dmax ")} mm`,
      `Linea: ${lineMeters} m (${ironTubes} tubi ferro + ${rubberTubes} gomma, ${curveCount} curve, ${kitCount} kit)`,
      `Quota getto: ${elevation} m · Edificio: ${floors} piani`,
      `Braccio aggiuntivo: ${needBoom === "si" ? "Sì" : "No"}`,
      `Compressore: ${needCompressor === "si" ? "Richiesto" : "Non richiesto"}`,
      `Cantiere: ${city} (${place.km} km da Paese)`,
      `Periodo: ${durationLabel} dal ${new Date(date).toLocaleDateString("it-IT")}`,
      `Giornate personale previste: ${service === "freddo" ? 0 : crewDays}`,
      `Tubazioni: € ${tubeCost.toLocaleString("it-IT")}`,
      `Totale indicativo: € ${quote.total.toLocaleString("it-IT")}`,
      ``,
      `Riferimento: DL-2026-0826`,
    ].join("\n");
    window.location.href = `mailto:dennis.cumerlato@gmail.com?cc=${encodeURIComponent("riolfatti.thomas76@gmail.com")}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <img src="/dalecom-logo.png" alt="Dalecom" />
          <span>Preventivo immediato</span>
        </div>
        <div className="secure">
          <i /> Sistema disponibilità in tempo reale
        </div>
      </header>
      <section className="hero">
        <div className="eyebrow">NOLEGGIO E POMPAGGIO CALCESTRUZZO</div>
        <h1>
          La macchina giusta.
          <br />
          <em>Quando ti serve.</em>
        </h1>
        <p>
          Configura il lavoro, verifichiamo mezzi e squadre e prepariamo una
          proposta trasparente.
        </p>
        <div className="trust">
          <span>✓ Risposta immediata</span>
          <span>✓ Disponibilità verificata</span>
          <span>✓ Costi di trasporto calcolati</span>
        </div>
      </section>
      <section className="workspace">
        <nav className="stepper" aria-label="Fasi del preventivo">
          {steps.map((x, i) => (
            <button
              type="button"
              key={x}
              disabled={i > step}
              onClick={() => {
                if (i <= step) {
                  if (i < 4) setConfirmed(false);
                  setStep(i);
                }
              }}
              className={i === step ? "active" : i < step ? "done" : ""}
              aria-current={i === step ? "step" : undefined}
            >
              <b>{i < step ? "✓" : i + 1}</b>
              <span>{x}</span>
            </button>
          ))}
        </nav>
        <div className="panel">
          {step === 0 && (
            <div className="screen">
              <div className="screen-head">
                <span>01</span>
                <div>
                  <h2>Che cosa ti serve?</h2>
                  <p>
                    Scegli formula, famiglia di macchina e indica subito se
                    serve anche un braccio stazionario.
                  </p>
                </div>
              </div>
              <h4 className="group-title">Formula operativa</h4>
              <div className="service-pills">
                {[
                  ["freddo", "A freddo", "Solo mezzo"],
                  ["semifreddo", "Semifreddo", "Mezzo + preposto"],
                  ["caldo", "A caldo", "Squadra completa"],
                ].map((x) => (
                  <button
                    key={x[0]}
                    className={service === x[0] ? "selected" : ""}
                    onClick={() => setService(x[0])}
                  >
                    <b>{x[1]}</b>
                    <small>{x[2]}</small>
                  </button>
                ))}
              </div>
              <h4 className="group-title">Macchina principale</h4>
              <div className="equipment-grid">
                {equipmentOptions.map((x) => (
                  <button
                    key={x[0]}
                    className={equipment === x[0] ? "selected" : ""}
                    onClick={() => chooseEquipment(x[0])}
                  >
                    <span className="radio" />
                    <h3>{x[1]}</h3>
                    <p>{x[2]}</p>
                  </button>
                ))}
              </div>
              <div className="boom-question">
                <div>
                  <b>Serve anche un braccio stazionario?</b>
                  <span>
                    Indicalo ora: incide sulla configurazione e sulla distinta
                    del cantiere.
                  </span>
                </div>
                <div>
                  <button
                    className={needBoom === "no" ? "selected" : ""}
                    onClick={() => setNeedBoom("no")}
                  >
                    No
                  </button>
                  <button
                    className={needBoom === "si" ? "selected" : ""}
                    onClick={() => setNeedBoom("si")}
                  >
                    Sì, serve
                  </button>
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="screen">
              <div className="screen-head">
                <span>02</span>
                <div>
                  <h2>Dove e che lavoro dobbiamo fare?</h2>
                  <p>
                    Inserisci geometria e calcestruzzo: calcoliamo linea, tubi,
                    curve e kit.
                  </p>
                </div>
              </div>
              <div className="form-grid location-grid">
                <label>
                  Regione
                  <select
                    value={region}
                    onChange={(e) => chooseRegion(e.target.value)}
                  >
                    {Object.keys(areas).map((x) => (
                      <option key={x} value={x}>
                        {x === "EmiliaRomagna" ? "Emilia-Romagna" : x}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Provincia
                  <select
                    value={province}
                    onChange={(e) => chooseProvince(e.target.value)}
                  >
                    {provinces.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Comune
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    {towns.map((x) => (
                      <option key={x.name}>{x.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Distanza stimata da Paese
                  <input readOnly value={`${place.km} km`} />
                </label>
                <label>
                  Volume indicativo per singolo getto (m³)
                  <input
                    type="number"
                    min="1"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                  />
                </label>
                <label>
                  Volume totale calcestruzzo (m³)
                  <input
                    type="number"
                    min="1"
                    value={totalVolume}
                    onChange={(e) => setTotalVolume(e.target.value)}
                  />
                </label>
                <label>
                  Numero di getti settimanali
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={weeklyPours}
                    onChange={(e) => setWeeklyPours(e.target.value)}
                  />
                </label>
                <label>
                  Granulometria calcestruzzo
                  <select
                    value={granulometry}
                    onChange={(e) => {
                      setGranulometry(e.target.value);
                      setAssetIndex(0);
                      setDetailsIndex(null);
                    }}
                  >
                    {aggregateOptions[equipment].map((size) => (
                      <option key={size} value={`D${size}`}>
                        Dmax {size} mm
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Distanza orizzontale pompa-getto (m)
                  <input
                    type="number"
                    min="0"
                    value={lineDistance}
                    onChange={(e) => setLineDistance(e.target.value)}
                  />
                </label>
                <label>
                  Quota getto dal punto zero (m)
                  <input
                    type="number"
                    step="0.5"
                    value={elevation}
                    onChange={(e) => setElevation(e.target.value)}
                  />
                  <small>
                    Usa valori negativi per getti sotto quota, es. −3 m.
                  </small>
                </label>
                <label>
                  Numero di piani dell’edificio
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                  />
                </label>
                {needBoom === "si" && <label>
                  Sbraccio
                  <select
                    value={reach}
                    onChange={(e) => setReach(e.target.value)}
                  >
                    <option value="20">Fino a 20 m</option>
                    <option value="28">Fino a 28 m</option>
                    <option value="36">Fino a 36 m</option>
                    <option value="42">Oltre 36 m</option>
                  </select>
                </label>}
                <label>
                  Accessibilità del piazzamento
                  <select
                    value={access}
                    onChange={(e) => setAccess(e.target.value)}
                  >
                    <option value="standard">
                      Standard · accesso carrabile
                    </option>
                    <option value="stretto">
                      Spazio ristretto / centro urbano
                    </option>
                    <option value="difficile">
                      Difficile · sopralluogo necessario
                    </option>
                  </select>
                </label>
                <label>
                  Tipo di intervento
                  <select
                    value={intervention}
                    onChange={(e) => setIntervention(e.target.value)}
                  >
                    {interventions[equipment].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <div className="line-calculation wide">
                  <b>Distinta linea stimata</b>
                  <span>
                    {lineMeters} m di sviluppo · {ironTubes} tubi ferro +{" "}
                    {rubberTubes} tubo gomma da 3 m · {curveCount} curve ·{" "}
                    {kitCount} kit di piano
                  </span>
                  <small>
                    Canone tubazioni: €{" "}
                    {tubeCost.toLocaleString("it-IT")} per il periodo
                    selezionato.
                  </small>
                </div>
                <div className="compressor-question wide">
                  <div>
                    <b>Ti serve anche il compressore?</b>
                    <span>Lo includeremo nella verifica tecnica degli accessori.</span>
                  </div>
                  <div>
                    <button type="button" className={needCompressor === "no" ? "selected" : ""} onClick={() => setNeedCompressor("no")}>No</button>
                    <button type="button" className={needCompressor === "si" ? "selected" : ""} onClick={() => setNeedCompressor("si")}>Sì, serve</button>
                  </div>
                </div>
                <div className="logic-note wide">
                  <b>✓ Coerenza tecnica verificata</b>
                  <span>
                    {selectedEquipment[1]} · {intervention} · granulometria{" "}
                    {granulometry.replace("D", "Dmax ")} mm.
                  </span>
                </div>
                <div className="route-card wide">
                  <span>PAESE (TV)</span>
                  <i>→ {place.km} km →</i>
                  <b>{city.toUpperCase()}</b>
                  <small>Fascia listino: {logistics.band}</small>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="screen">
              <div className="screen-head">
                <span>03</span>
                <div>
                  <h2>Quando e per quanto tempo?</h2>
                  <p>
                    Controlliamo contemporaneamente mezzo, operatori e blocchi
                    manutentivi.
                  </p>
                </div>
              </div>
              <div className="form-grid dates">
                <label>
                  Data di inizio
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label>
                  Durata
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="1">1 giornata</option>
                    <option value="3">3 giornate</option>
                    <option value="5">1 settimana lavorativa</option>
                    <option value="20">1 mese</option>
                  </select>
                </label>
                <label>
                  Fascia operativa
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                  >
                    <option value="diurno">Diurna feriale</option>
                    <option value="notturno">Notturna / festiva</option>
                  </select>
                </label>
                <label>
                  Flessibilità data
                  <select>
                    <option>Data tassativa</option>
                    <option>± 1 giorno</option>
                    <option>± 3 giorni</option>
                  </select>
                </label>
                <div className="availability wide">
                  <div className="pulse" />
                  <div>
                    <b>Verifica combinata pronta</b>
                    <span>
                      Mezzi, squadre, manutenzioni, trasferimenti e sede di
                      partenza
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="screen">
              <div className="screen-head">
                <span>04</span>
                <div>
                  <h2>Scegli la macchina disponibile</h2>
                  <p>
                    Sono mostrate solo le soluzioni compatibili con “{intervention}”
                    e con la granulometria {granulometry.replace("D", "Dmax ")} mm.
                  </p>
                </div>
              </div>
              <div className="match">
                <div>
                  <small>CONFIGURAZIONE COMPATIBILE</small>
                  <h3>{selectedEquipment[1]}</h3>
                  <p>
                    {service === "caldo"
                      ? "Squadra completa"
                      : service === "semifreddo"
                        ? "Mezzo e preposto Dalecom"
                        : "Noleggio senza personale"}{" "}
                    · {logistics.band}
                  </p>
                </div>
                <strong>
                  96<span>%</span>
                  <small>compatibilità</small>
                </strong>
              </div>
              <div className="machine-table selectable">
                {matchedAssets.map((m, i) => (
                  <div
                    key={m.name}
                    className={
                      assetIndex === i ? "recommended selected-machine" : ""
                    }
                  >
                    <button
                      type="button"
                      className="machine-choice"
                      onClick={() => setAssetIndex(i)}
                      aria-pressed={assetIndex === i}
                    >
                      <span className="choice-radio">
                        {assetIndex === i ? "✓" : ""}
                      </span>
                      <span>
                        <b>{m.name}</b>
                        <small>
                          {m.type} · Polo {m.site}
                        </small>
                      </span>
                      <span className="qty">{m.qty} unità</span>
                      <span className="tag ok">{m.status}</span>
                    </button>
                    <button
                      type="button"
                      className="details-button"
                      onClick={() =>
                        setDetailsIndex(detailsIndex === i ? null : i)
                      }
                    >
                      Vedi caratteristiche
                    </button>
                    {detailsIndex === i && (
                      <div className="asset-details">
                        <b>Caratteristiche principali</b>
                        <ul>
                          <li>Granulometria massima: Dmax {m.maxAggregate} mm</li>
                          {m.specs.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="selected-summary">
                <b>Macchina scelta:</b> {selectedAsset.name}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="screen quote-screen">
              <div className="success-mark">✓</div>
              <small className="ready">PROPOSTA PRONTA</small>
              <h2>Il tuo cantiere può partire.</h2>
              <p className="lead">
                Inserisci i dati del cliente per intestare e scaricare la
                proposta.
              </p>
              <div className="quote-card">
                <div className="quote-title">
                  <div>
                    <small>PREVENTIVO INDICATIVO</small>
                    <b>DL-2026-0826</b>
                  </div>
                  <span>Validità 48 ore</span>
                </div>
                {confirmed && (
                  <div className="client-print">
                    <small>PROPOSTA INTESTATA A</small>
                    <b>{client.company}</b>
                    <span>
                      {client.name} · {client.email} · {client.phone}
                      {client.vat ? ` · P. IVA/C.F. ${client.vat}` : ""}
                    </span>
                  </div>
                )}
                <div className="summary four">
                  <div>
                    <small>Servizio</small>
                    <b>
                      {service === "caldo"
                        ? "A caldo"
                        : service === "semifreddo"
                          ? "Semifreddo"
                          : "A freddo"}
                    </b>
                  </div>
                  <div>
                    <small>Macchina scelta</small>
                    <b>{selectedAsset.name}</b>
                  </div>
                  <div>
                    <small>Lavorazione</small>
                    <b>{intervention}</b>
                  </div>
                  <div>
                    <small>Località e periodo</small>
                    <b>
                      {city} · {durationLabel}
                    </b>
                  </div>
                </div>
                <div className="technical-summary">
                  <b>Configurazione linea</b>
                  <span>
                    Granulometria {granulometry.replace("D", "Dmax ")} mm ·
                    sviluppo {lineMeters} m · quota {Number(elevation) >= 0 ? "+" : ""}
                    {elevation} m · {floors} piani
                  </span>
                  <span>
                    {volume} m³ per getto · {totalVolume} m³ totali · {weeklyPours} getti/settimana
                  </span>
                  <small>
                    {ironTubes} tubi ferro + {rubberTubes} tubo gomma da 3 m · {curveCount} curve · {kitCount} kit
                    {needBoom === "si" ? " · braccio stazionario richiesto" : ""}
                    {needCompressor === "si" ? " · compressore richiesto" : ""}
                  </small>
                </div>
                <div className="cost-lines">
                  <div>
                    <span>Noleggio attrezzatura</span>
                    <b>€ {quote.rental.toLocaleString("it-IT")}</b>
                  </div>
                  {quote.crew > 0 && (
                    <div>
                      <span>
                        Personale operativo · {crewDays} {crewDays === 1 ? "giornata" : "giornate"}
                      </span>
                      <b>€ {quote.crew.toLocaleString("it-IT")}</b>
                    </div>
                  )}
                  <div>
                    <span>Allestimento cantiere · {logistics.band}</span>
                    <b>€ {logistics.oneWay.toLocaleString("it-IT")}</b>
                  </div>
                  <div>
                    <span>Disallestimento e rientro</span>
                    <b>€ {logistics.oneWay.toLocaleString("it-IT")}</b>
                  </div>
                  {quote.extras > 0 && (
                    <div>
                      <span>Maggiorazioni operative</span>
                      <b>€ {quote.extras.toLocaleString("it-IT")}</b>
                    </div>
                  )}
                  <div>
                    <span>
                      Tubazioni · {ironTubes + rubberTubes} pezzi
                    </span>
                    <b>€ {quote.tubes.toLocaleString("it-IT")}</b>
                  </div>
                  {quote.boom > 0 && (
                    <div>
                      <span>Braccio stazionario aggiuntivo</span>
                      <b>€ {quote.boom.toLocaleString("it-IT")}</b>
                    </div>
                  )}
                </div>
                <div className="total">
                  <span>
                    Totale indicativo
                    <small>
                      IVA esclusa · conferma tecnica soggetta a sopralluogo
                    </small>
                  </span>
                  <strong>€ {quote.total.toLocaleString("it-IT")}</strong>
                </div>
              </div>
              {!confirmed ? (
                <form
                  className="client-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitLead();
                  }}
                >
                  <div className="client-form-head">
                    <b>Dati obbligatori per generare il PDF</b>
                    <span>
                      La richiesta verrà inviata a Dalecom e registrata come
                      nuovo contatto commerciale.
                    </span>
                  </div>
                  <div className="client-grid">
                    <label>
                      Azienda *
                      <input
                        required
                        value={client.company}
                        onChange={(e) =>
                          updateClient("company", e.target.value)
                        }
                        placeholder="Ragione sociale"
                      />
                    </label>
                    <label>
                      Partita IVA / Codice fiscale
                      <input
                        value={client.vat}
                        onChange={(e) => updateClient("vat", e.target.value)}
                        placeholder="Facoltativo per la demo"
                      />
                    </label>
                    <label>
                      Nome e cognome referente *
                      <input
                        required
                        value={client.name}
                        onChange={(e) => updateClient("name", e.target.value)}
                        placeholder="Mario Rossi"
                      />
                    </label>
                    <label>
                      Email *
                      <input
                        required
                        type="email"
                        value={client.email}
                        onChange={(e) => updateClient("email", e.target.value)}
                        placeholder="nome@azienda.it"
                      />
                    </label>
                    <label>
                      Telefono *
                      <input
                        required
                        type="tel"
                        value={client.phone}
                        onChange={(e) => updateClient("phone", e.target.value)}
                        placeholder="+39 ..."
                      />
                    </label>
                    <label className="privacy-check">
                      <input
                        type="checkbox"
                        checked={client.privacy}
                        onChange={(e) =>
                          updateClient("privacy", e.target.checked)
                        }
                      />
                      <span>
                        Acconsento al trattamento dei dati per la gestione della
                        richiesta. *
                      </span>
                    </label>
                  </div>
                  <div className="quote-actions">
                    <button
                      type="button"
                      className="back-link"
                      onClick={() => setStep(3)}
                    >
                      ← Modifica le scelte
                    </button>
                    <button
                      type="submit"
                      className="primary"
                      disabled={!clientValid}
                    >
                      Invia dati e genera PDF
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="confirmation-box">
                    <b>✓ Dati cliente acquisiti</b>
                    <span>
                      La richiesta email è stata preparata per Dalecom. Il
                      preventivo personalizzato è ora disponibile.
                    </span>
                  </div>
                  <div className="quote-actions">
                    <button
                      className="back-link"
                      onClick={() => {
                        setConfirmed(false);
                        setStep(3);
                      }}
                    >
                      ← Modifica le scelte
                    </button>
                    <button className="primary" onClick={() => window.print()}>
                      Scarica preventivo personalizzato
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {step < 4 && (
            <div className="actions">
              <button
                className="back"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                Indietro
              </button>
              <button
                className="primary"
                onClick={() => setStep(Math.min(4, step + 1))}
              >
                {step === 2 ? "Verifica disponibilità" : "Continua"}{" "}
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </section>
      <footer>
        <b>DALECOM</b>
        <span>Soluzioni per il pompaggio del calcestruzzo</span>
        <small>
          Demo dimostrativa · disponibilità simulate, fasce economiche dal
          listino Dalecom
        </small>
      </footer>
    </main>
  );
}
