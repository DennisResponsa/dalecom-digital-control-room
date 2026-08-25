"use client";
import Image from "next/image";
import { useState } from "react";

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

type RentalRates = { day: number; week: number; months: number[] };

const assetRates: Record<string, RentalRates> = {
  "Putzmeister M20 · GJ584JY": { day: 820, week: 2960, months: [9020, 8520, 8830, 7990, 6910, 6170, 5690, 5360, 5290, 5210, 5090, 4990] },
  "MAN TGA 26.4 · GY967NP": { day: 820, week: 2960, months: [9020, 8520, 8830, 7990, 6910, 6170, 5690, 5360, 5290, 5210, 5090, 4990] },
  "Mecbo City Pump · HA095NA": { day: 1370, week: 4890, months: [14570, 13720, 14250, 12800, 10930, 9660, 8830, 8250, 8140, 8000, 7800, 7620] },
  "Scania City Pump · GY915DK": { day: 380, week: 1420, months: [4590, 4390, 4510, 4170, 3720, 3420, 3220, 3080, 3050, 3020, 2970, 2930] },
  "Putzmeister P715 TD": { day: 370, week: 1350, months: [4110, 3880, 4020, 3630, 3140, 2800, 2580, 2420, 2390, 2360, 2300, 2260] },
  "Turbosol TB30 Cingolata": { day: 460, week: 1650, months: [4980, 4700, 4880, 4400, 3790, 3370, 3090, 2900, 2870, 2820, 2750, 2700] },
  "Putzmeister SP 11 LMR": { day: 90, week: 320, months: [1030, 980, 1010, 930, 820, 750, 700, 670, 660, 650, 640, 630] },
  "Turbosol Transmat 250": { day: 130, week: 470, months: [1460, 1380, 1430, 1300, 1130, 1020, 940, 890, 880, 870, 850, 840] },
};

const boomRates: Record<string, RentalRates> = {
  "Putzmeister MX28 · 28 m": { day: 720, week: 2540, months: [7440, 6980, 7270, 6480, 5470, 4780, 4330, 4020, 3960, 3890, 3770, 3680] },
  "Putzmeister MX36-4 · 36 m": { day: 690, week: 2440, months: [7150, 6700, 6980, 6230, 5260, 4600, 4170, 3870, 3810, 3740, 3630, 3540] },
};

const compressorRates: RentalRates = {
  day: 330,
  week: 1170,
  months: [3430, 3220, 3350, 2990, 2530, 2210, 2010, 1870, 1840, 1800, 1750, 1710],
};

function rentalForRates(rate: RentalRates, days: number) {
  const safeDays = Math.max(0, Math.ceil(days));
  const shortTerm = (remainingDays: number) => {
    const fullWeeks = Math.floor(remainingDays / 5);
    const extraDays = remainingDays % 5;
    return Math.min(
      rate.day * remainingDays,
      rate.week * fullWeeks + rate.day * extraDays,
      rate.week * Math.ceil(remainingDays / 5),
    );
  };
  const candidates = [shortTerm(safeDays)];
  rate.months.forEach((monthlyRate, index) => {
    const months = index + 1;
    const packageDays = months * 20;
    const packageCost = monthlyRate * months;
    candidates.push(
      safeDays <= packageDays
        ? packageCost
        : packageCost + shortTerm(safeDays - packageDays),
    );
  });
  return Math.min(...candidates);
}

function rentalForDuration(name: string, days: number) {
  const rate = assetRates[name];
  return rate ? rentalForRates(rate, days) : 0;
}

function logisticsFor(km: number, withBoom: boolean) {
  const bands = [
    "Fino a 50 km",
    "Da 50 a 150 km",
    "Da 150 a 300 km",
    "Da 300 a 500 km",
    "Da 500 a 650 km",
    "Oltre 650 km / isole",
  ];
  const index = km <= 50 ? 0 : km <= 150 ? 1 : km <= 300 ? 2 : km <= 500 ? 3 : km <= 650 ? 4 : 5;
  const pumpLineSetup = [1300, 1716, 1976, 2392, 2704, 1300];
  const pumpLineTeardown = [1716, 1976, 2392, 2704, 1300, 1716];
  const pumpBoom = [2600, 3640, 4680, 5720, 6760, 9100];
  return {
    band: bands[index],
    setup: withBoom ? pumpBoom[index] : pumpLineSetup[index],
    teardown: withBoom ? pumpBoom[index] : pumpLineTeardown[index],
    configuration: withBoom ? "Pompa + braccio" : "Pompa + linea",
  };
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
  const [weeklyPours, setWeeklyPours] = useState("3");
  const [reach, setReach] = useState("36");
  const [access, setAccess] = useState("standard");
  const [granulometry, setGranulometry] = useState("D20");
  const [lineDistance, setLineDistance] = useState("30");
  const [elevation, setElevation] = useState("0");
  const [needBoom, setNeedBoom] = useState("no");
  const [needCompressor, setNeedCompressor] = useState("no");
  const [leaveLineInstalled, setLeaveLineInstalled] = useState("si");
  const [lineAreaSafe, setLineAreaSafe] = useState("si");
  const [lineCleaning, setLineCleaning] = useState("dalecom");
  const [floors, setFloors] = useState("1");
  const [date, setDate] = useState("2026-08-26");
  const [duration, setDuration] = useState("10");
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
  const logistics = logisticsFor(place.km, needBoom === "si");
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
  const durationDays = Number(duration);
  const boomAssetName = Number(reach) <= 28
    ? "Putzmeister MX28 · 28 m"
    : "Putzmeister MX36-4 · 36 m";
  const boomCost =
    needBoom === "si" && equipment !== "braccio"
      ? rentalForRates(boomRates[boomAssetName], durationDays)
      : 0;
  const durationLabel =
    durationDays === 20
      ? "1 mese"
      : durationDays >= 5 && durationDays % 5 === 0
        ? `${durationDays / 5} ${durationDays === 5 ? "settimana" : "settimane"}`
      : durationDays === 1
        ? "1 giornata"
        : `${durationDays} giornate`;
  const volumePerPour = Math.max(1, Number(volume) || 1);
  const totalPours = Math.max(
    1,
    Math.ceil((Number(totalVolume) || volumePerPour) / volumePerPour),
  );
  const poursPerWeek = Math.max(1, Number(weeklyPours) || 1);
  const minimumWeeks = Math.ceil(totalPours / poursPerWeek);
  const minimumDurationDays = totalPours === 1 ? 1 : minimumWeeks * 5;
  const crewDays = totalPours;
  const pumpCrew = service === "freddo" ? 0 : service === "semifreddo" ? 1 : 2;
  const cityDriver = equipment === "city" ? 1 : 0;
  const boomCrew = needBoom === "si" ? 2 : 0;
  const crewPeople = pumpCrew + cityDriver + boomCrew;
  const pumpCrewDailyCost =
    service === "freddo" ? 0 : service === "semifreddo" ? 630 : 1116;
  const cityDriverDailyCost = cityDriver ? 486 : 0;
  const boomCrewDailyCost = boomCrew ? 972 : 0;
  const crewDailyCost = pumpCrewDailyCost + cityDriverDailyCost + boomCrewDailyCost;
  const serviceSummary =
    service === "caldo"
      ? equipment === "city"
        ? "Squadra completa con autista City Pump"
        : "Squadra completa"
      : service === "semifreddo"
        ? equipment === "city"
          ? "Preposto Dalecom e autista City Pump"
          : "Mezzo e preposto Dalecom"
        : equipment === "city"
          ? "Mezzo con autista City Pump"
          : "Noleggio senza personale";
  const compressorCost =
    needCompressor === "si" ? rentalForRates(compressorRates, durationDays) : 0;
  const syncRecommendedDuration = (pours: number, weekly: number) => {
    if (!Number.isFinite(pours) || !Number.isFinite(weekly) || pours < 1 || weekly < 1) return;
    const requiredDays = pours === 1 ? 1 : Math.ceil(pours / weekly) * 5;
    const nextDuration = [1, 3, 5, 10, 15, 20].find(
      (days) => days >= requiredDays,
    );
    setDuration(String(nextDuration ?? requiredDays));
  };
  const clientValid =
    client.company.trim().length > 0 &&
    client.name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email) &&
    client.phone.trim().length > 0 &&
    client.privacy;
  const rentalCost = rentalForDuration(selectedAsset.name, durationDays);
  const crewCost = crewDailyCost * crewDays;
  const extrasCost =
    (shift === "notturno" ? 450 : 0) + (access === "difficile" ? 380 : 0);
  const quote = {
    rental: rentalCost,
    crew: crewCost,
    extras: extrasCost,
    tubes: tubeCost,
    boom: boomCost,
    compressor: compressorCost,
    transport: logistics.setup + logistics.teardown,
    total:
      rentalCost + crewCost + extrasCost + tubeCost + boomCost + compressorCost + logistics.setup + logistics.teardown,
  };
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
    const subject = `${access === "difficile" ? "CONCORDARE SOPRALLUOGO · " : ""}Richiesta preventivo Dalecom · ${client.company} · DL-2026-0826`;
    const body = [
      ...(access === "difficile"
        ? [
            `========================================`,
            `⚠  CONCORDARE SOPRALLUOGO  ⚠`,
            `========================================`,
            ``,
          ]
        : []),
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
      `Numero totale getti previsti: ${totalPours}`,
      `Ritmo previsto: ${poursPerWeek} getti a settimana (${minimumWeeks} ${minimumWeeks === 1 ? "settimana" : "settimane"} minime)`,
      `Granulometria: ${granulometry.replace("D", "Dmax ")} mm`,
      `Linea: ${lineMeters} m (${ironTubes} tubi ferro + ${rubberTubes} gomma, ${curveCount} curve, ${kitCount} kit)`,
      ...(durationDays > 1
        ? [
            `Tubazioni lasciate predisposte: ${leaveLineInstalled === "si" ? "Sì" : "No"}`,
            `Area di posa sicura tra i getti: ${lineAreaSafe === "si" ? "Sì" : "No / da verificare"}`,
            `Pulizia linea tra i getti: ${lineCleaning === "dalecom" ? "Dalecom" : "Cliente"}`,
          ]
        : []),
      `Quota getto: ${elevation} m · Edificio: ${floors} piani`,
      `Braccio aggiuntivo: ${needBoom === "si" ? `Sì · ${boomAssetName}` : "No"}`,
      `Compressore: ${needCompressor === "si" ? `ATLAS XAVS186 · € ${compressorCost.toLocaleString("it-IT")}` : "Non richiesto"}`,
      `Cantiere: ${city} (${place.km} km da Paese)`,
      `Periodo: ${durationLabel} dal ${new Date(date).toLocaleDateString("it-IT")}`,
      `Personale previsto: ${crewPeople} ${crewPeople === 1 ? "persona" : "persone"} per ${crewPeople === 0 ? 0 : crewDays} ${crewDays === 1 ? "giornata" : "giornate"}`,
      `Composizione squadra: ${serviceSummary}${needBoom === "si" ? " + 2 addetti braccio" : ""}`,
      `Noleggio macchina: € ${quote.rental.toLocaleString("it-IT")}`,
      `Personale: € ${quote.crew.toLocaleString("it-IT")}`,
      `Allestimento una tantum (${logistics.configuration}): € ${logistics.setup.toLocaleString("it-IT")}`,
      `Disallestimento una tantum (${logistics.configuration}): € ${logistics.teardown.toLocaleString("it-IT")}`,
      `Tubazioni: ${ironTubes + rubberTubes} pezzi per un totale di € ${tubeCost.toLocaleString("it-IT")}`,
      `Totale indicativo${access === "difficile" ? " salvo sopralluogo" : ""}: € ${quote.total.toLocaleString("it-IT")}`,
      ``,
      `Riferimento: DL-2026-0826`,
    ].join("\n");
    const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent("dennis.cumerlato@gmail.com")}&cc=${encodeURIComponent("riolfatti.thomas76@gmail.com")}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailCompose, "_blank", "noopener,noreferrer");
  };
  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <Image src="/dalecom-logo.png" alt="Dalecom" width={154} height={47} priority />
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
                    <small>
                      {equipment === "city" && x[0] === "freddo"
                        ? "Mezzo + autista"
                        : equipment === "city" && x[0] === "semifreddo"
                          ? "Mezzo + preposto + autista"
                          : equipment === "city" && x[0] === "caldo"
                            ? "Squadra completa + autista"
                            : x[2]}
                    </small>
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
                    onChange={(e) => {
                      const next = e.target.value;
                      setVolume(next);
                      if (next === "" || Number(next) < 1) return;
                      const pours = Math.max(1, Math.ceil((Number(totalVolume) || 1) / Math.max(1, Number(next) || 1)));
                      syncRecommendedDuration(pours, poursPerWeek);
                    }}
                  />
                </label>
                <label>
                  Volume totale calcestruzzo (m³)
                  <input
                    type="number"
                    min="1"
                    value={totalVolume}
                    onChange={(e) => {
                      const next = e.target.value;
                      setTotalVolume(next);
                      if (next === "" || Number(next) < 1) return;
                      const pours = Math.max(1, Math.ceil((Number(next) || volumePerPour) / volumePerPour));
                      syncRecommendedDuration(pours, poursPerWeek);
                    }}
                  />
                </label>
                <label>
                  Numero totale di getti previsti
                  <input
                    type="number"
                    min="1"
                    value={totalPours}
                    readOnly
                  />
                  <small>Calcolato automaticamente dal volume totale diviso il volume per singolo getto.</small>
                </label>
                <label>
                  Getti previsti a settimana
                  <input
                    type="number"
                    min="1"
                    max={totalPours}
                    value={weeklyPours}
                    onChange={(e) => {
                      const next = e.target.value;
                      setWeeklyPours(next);
                      if (next === "" || Number(next) < 1) return;
                      syncRecommendedDuration(totalPours, Number(next));
                    }}
                  />
                  <small>Determina la durata minima necessaria del cantiere.</small>
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
                {durationDays > 1 && (
                  <div className="operational-questions wide">
                    <div className="operational-head">
                      <b>Organizzazione della linea tra un getto e l’altro</b>
                      <span>Per cantieri di più giorni dobbiamo sapere se la tubazione può restare predisposta.</span>
                    </div>
                    <label>
                      Lasciamo le tubazioni installate tra i getti?
                      <select value={leaveLineInstalled} onChange={(e) => setLeaveLineInstalled(e.target.value)}>
                        <option value="si">Sì, restano predisposte</option>
                        <option value="no">No, vanno rimosse dopo ogni getto</option>
                      </select>
                    </label>
                    <label>
                      La linea può restare in un’area protetta e sicura?
                      <select value={lineAreaSafe} onChange={(e) => setLineAreaSafe(e.target.value)}>
                        <option value="si">Sì</option>
                        <option value="no">No / da verificare</option>
                      </select>
                    </label>
                    <label>
                      Chi gestisce la pulizia tra i getti?
                      <select value={lineCleaning} onChange={(e) => setLineCleaning(e.target.value)}>
                        <option value="dalecom">Dalecom</option>
                        <option value="cliente">Il cliente</option>
                      </select>
                    </label>
                  </div>
                )}
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
                    <option value="1" disabled={minimumDurationDays > 1}>1 giornata</option>
                    <option value="3" disabled={minimumDurationDays > 3}>3 giornate</option>
                    <option value="5" disabled={minimumDurationDays > 5}>1 settimana lavorativa</option>
                    <option value="10" disabled={minimumDurationDays > 10}>2 settimane</option>
                    <option value="15" disabled={minimumDurationDays > 15}>3 settimane</option>
                    <option value="20" disabled={minimumDurationDays > 20}>1 mese</option>
                    {minimumDurationDays > 20 && (
                      <option value={minimumDurationDays}>
                        {minimumWeeks} settimane
                      </option>
                    )}
                  </select>
                  <small>
                    Durata minima: {minimumWeeks} {minimumWeeks === 1 ? "settimana" : "settimane"} per distribuire {totalPours} getti.
                  </small>
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
                    {serviceSummary} · {logistics.band}
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
                    <div className="machine-rate">
                      <small>Canone per {durationLabel}</small>
                      <b>€ {rentalForDuration(m.name, durationDays).toLocaleString("it-IT")}</b>
                    </div>
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
                    {volume} m³ per getto · {totalVolume} m³ totali · {totalPours} getti previsti · {poursPerWeek}/settimana
                  </span>
                  <small>
                    {ironTubes} tubi ferro + {rubberTubes} tubo gomma da 3 m · {curveCount} curve · {kitCount} kit
                    {needBoom === "si" ? ` · ${boomAssetName}` : ""}
                    {needCompressor === "si" ? " · compressore ATLAS XAVS186" : ""}
                  </small>
                  {durationDays > 1 && (
                    <small className="line-plan-summary">
                      Linea tra i getti: {leaveLineInstalled === "si" ? "lasciata predisposta" : "rimossa dopo ogni getto"} · area {lineAreaSafe === "si" ? "protetta" : "da verificare"} · pulizia {lineCleaning === "dalecom" ? "Dalecom" : "cliente"}
                    </small>
                  )}
                  {equipment === "city" && (
                    <small className="crew-note">City Pump su camion: autista sempre incluso nella squadra.</small>
                  )}
                </div>
                <div className="cost-lines">
                  <div>
                    <span>Noleggio attrezzatura</span>
                    <b>€ {quote.rental.toLocaleString("it-IT")}</b>
                  </div>
                  {quote.crew > 0 && (
                    <div>
                      <span>
                        Personale operativo · {crewPeople} {crewPeople === 1 ? "persona" : "persone"} × {crewDays} {crewDays === 1 ? "giornata" : "giornate"}
                        {equipment === "city" ? " · autista City Pump incluso" : ""}
                      </span>
                      <b>€ {quote.crew.toLocaleString("it-IT")}</b>
                    </div>
                  )}
                  <div>
                    <span>Allestimento cantiere · una tantum · {logistics.configuration} · {logistics.band}</span>
                    <b>€ {logistics.setup.toLocaleString("it-IT")}</b>
                  </div>
                  <div>
                    <span>Disallestimento e rientro · una tantum · {logistics.configuration}</span>
                    <b>€ {logistics.teardown.toLocaleString("it-IT")}</b>
                  </div>
                  {quote.extras > 0 && (
                    <div>
                      <span>Maggiorazioni operative</span>
                      <b>€ {quote.extras.toLocaleString("it-IT")}</b>
                    </div>
                  )}
                  <div>
                    <span>
                      Tubazioni · {ironTubes + rubberTubes} pezzi · per un totale di
                    </span>
                    <b>€ {quote.tubes.toLocaleString("it-IT")}</b>
                  </div>
                  {quote.boom > 0 && (
                    <div>
                      <span>Braccio stazionario aggiuntivo · {boomAssetName}</span>
                      <b>€ {quote.boom.toLocaleString("it-IT")}</b>
                    </div>
                  )}
                  {quote.compressor > 0 && (
                    <div>
                      <span>Compressore ATLAS XAVS186</span>
                      <b>€ {quote.compressor.toLocaleString("it-IT")}</b>
                    </div>
                  )}
                </div>
                <div className="total">
                  <span>
                    Totale indicativo{access === "difficile" ? " salvo sopralluogo" : ""}
                    <small>
                      IVA esclusa · {access === "difficile" ? "importo da confermare dopo il sopralluogo" : "conferma tecnica finale Dalecom"}
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
                        required
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
                    >
                      Prepara email e genera PDF
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="confirmation-box">
                    <b>✓ Dati cliente acquisiti</b>
                    <span>
                      Gmail è stato aperto con la richiesta già compilata: il
                      cliente deve solo confermare l’invio. Il preventivo
                      personalizzato è ora disponibile.
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
