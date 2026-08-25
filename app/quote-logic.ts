export type RentalRates = { day: number; week: number; months: number[] };
export type Service = "freddo" | "semifreddo" | "caldo";

export const assetRates: Record<string, RentalRates> = {
  "Putzmeister M20 · GJ584JY": { day: 820, week: 2960, months: [9020, 8520, 8830, 7990, 6910, 6170, 5690, 5360, 5290, 5210, 5090, 4990] },
  "MAN TGA 26.4 · GY967NP": { day: 820, week: 2960, months: [9020, 8520, 8830, 7990, 6910, 6170, 5690, 5360, 5290, 5210, 5090, 4990] },
  "Mecbo City Pump · HA095NA": { day: 1370, week: 4890, months: [14570, 13720, 14250, 12800, 10930, 9660, 8830, 8250, 8140, 8000, 7800, 7620] },
  "Scania City Pump · GY915DK": { day: 380, week: 1420, months: [4590, 4390, 4510, 4170, 3720, 3420, 3220, 3080, 3050, 3020, 2970, 2930] },
  "Putzmeister P715 TD": { day: 370, week: 1350, months: [4110, 3880, 4020, 3630, 3140, 2800, 2580, 2420, 2390, 2360, 2300, 2260] },
  "Turbosol TB30 Cingolata": { day: 460, week: 1650, months: [4980, 4700, 4880, 4400, 3790, 3370, 3090, 2900, 2870, 2820, 2750, 2700] },
  "Putzmeister SP 11 LMR": { day: 90, week: 320, months: [1030, 980, 1010, 930, 820, 750, 700, 670, 660, 650, 640, 630] },
  "Turbosol Transmat 250": { day: 130, week: 470, months: [1460, 1380, 1430, 1300, 1130, 1020, 940, 890, 880, 870, 850, 840] },
};

export const boomRates: Record<string, RentalRates> = {
  "Putzmeister MX28 · 28 m": { day: 720, week: 2540, months: [7440, 6980, 7270, 6480, 5470, 4780, 4330, 4020, 3960, 3890, 3770, 3680] },
  "Putzmeister MX36-4 · 36 m": { day: 690, week: 2440, months: [7150, 6700, 6980, 6230, 5260, 4600, 4170, 3870, 3810, 3740, 3630, 3540] },
};

export const compressorRates: RentalRates = {
  day: 330,
  week: 1170,
  months: [3430, 3220, 3350, 2990, 2530, 2210, 2010, 1870, 1840, 1800, 1750, 1710],
};

export const ironTubeRates: RentalRates = {
  day: 10,
  week: 20,
  months: [30, 30, 30, 30, 20, 20, 20, 20, 20, 20, 20, 20],
};

export const rubberTubeRates: RentalRates = {
  day: 10,
  week: 40,
  months: [80, 70, 80, 70, 60, 60, 50, 50, 50, 50, 50, 50],
};

export function rentalForRates(rate: RentalRates, days: number) {
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

export function rentalForDuration(name: string, days: number) {
  const rate = assetRates[name];
  return rate ? rentalForRates(rate, days) : 0;
}

export function recommendedDurationDays(totalPours: number, poursPerWeek: number) {
  const safePours = Math.max(1, Math.ceil(totalPours));
  const safeWeekly = Math.max(1, Math.floor(poursPerWeek));
  if (safePours === 1) return 1;
  return Math.ceil(safePours / safeWeekly) * 5;
}

export function durationLabel(days: number) {
  if (days === 1) return "1 giornata";
  if (days > 0 && days % 20 === 0) {
    const months = days / 20;
    return `${months} ${months === 1 ? "mese" : "mesi"}`;
  }
  if (days >= 5 && days % 5 === 0) {
    const weeks = days / 5;
    return `${weeks} ${weeks === 1 ? "settimana" : "settimane"}`;
  }
  return `${days} giornate`;
}

export function personnelFor(service: Service, equipment: string, withBoom: boolean) {
  const pumpPeople = service === "freddo" ? 0 : service === "semifreddo" ? 1 : 2;
  const pumpDailyCost = service === "freddo" ? 0 : service === "semifreddo" ? 630 : 1116;
  const cityDriverPeople = equipment === "city" ? 1 : 0;
  const cityDriverDailyCost = cityDriverPeople ? 486 : 0;
  const boomPeople = withBoom ? 2 : 0;
  const boomDailyCost = boomPeople ? 972 : 0;
  return {
    people: pumpPeople + cityDriverPeople + boomPeople,
    dailyCost: pumpDailyCost + cityDriverDailyCost + boomDailyCost,
  };
}

export function tubingFor(
  horizontalMeters: number,
  elevationMeters: number,
  floors: number,
  withBoom: boolean,
  durationDays: number,
) {
  const lineMeters = Math.max(0, horizontalMeters) + Math.abs(elevationMeters);
  const tubeCount = Math.max(1, Math.ceil(lineMeters / 3));
  const rubberTubes = 1;
  const ironTubes = Math.max(0, tubeCount - rubberTubes);
  const curves = 2 + Math.ceil(Math.abs(elevationMeters) / 12) + (withBoom ? 1 : 0);
  const kits = Math.max(1, Math.ceil(floors));
  const ironUnitCost = rentalForRates(ironTubeRates, durationDays);
  const rubberUnitCost = rentalForRates(rubberTubeRates, durationDays);
  return {
    lineMeters,
    ironTubes,
    rubberTubes,
    curves,
    kits,
    cost: ironTubes * ironUnitCost + rubberTubes * rubberUnitCost,
  };
}

export function logisticsFor(km: number, withBoom: boolean) {
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
