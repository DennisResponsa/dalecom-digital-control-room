export const ONE_C_SCHEMA_VERSION = "1.0.0" as const;

export type OneCQuoteLineType =
  | "equipment_rental"
  | "personnel"
  | "iron_pipeline"
  | "rubber_pipeline"
  | "stationary_boom"
  | "compressor"
  | "setup"
  | "teardown";

export type OneCQuoteLine = {
  line_number: number;
  line_type: OneCQuoteLineType;
  included: boolean;
  article_external_id: string;
  article_1c_code: string | null;
  description: string;
  quantity: number;
  unit_of_measure: "period" | "day" | "piece_period" | "service";
  unit_price: number;
  discount_percent: number;
  net_amount: number;
  vat_rate_percent: number | null;
  vat_amount: number | null;
  gross_amount: number | null;
};

const equipmentArticles: Record<string, { externalId: string; oneCCode: string | null }> = {
  "Putzmeister M20 · GJ584JY": { externalId: "GJ584JY", oneCCode: "00-00000229" },
  "MAN TGA 26.4 · GY967NP": { externalId: "GY967NP", oneCCode: "00-00000230" },
  "Mecbo City Pump · HA095NA": { externalId: "HA095NA", oneCCode: null },
  "Scania City Pump · GY915DK": { externalId: "GY915DK", oneCCode: null },
  "Putzmeister P715 TD": { externalId: "DA-MEZ-CARR-P715TD", oneCCode: "00-00000228" },
  "Turbosol TB30 Cingolata": { externalId: "DA-MEZ-CING-TB30", oneCCode: null },
  "Putzmeister SP 11 LMR": { externalId: "DA-MEZ-MALTE-SP11LMR", oneCCode: null },
  "Turbosol Transmat 250": { externalId: "DA-MEZ-MASSETTI-TRANSMAT250", oneCCode: null },
};

const transportArticleCodes: Record<string, { setup: string; teardown: string; suffix: string }> = {
  "Fino a 50 km": { setup: "00-00000193", teardown: "00-00000199", suffix: "0-50" },
  "Da 50 a 150 km": { setup: "00-00000194", teardown: "00-00000200", suffix: "50-150" },
  "Da 150 a 300 km": { setup: "00-00000195", teardown: "00-00000201", suffix: "150-300" },
  "Da 300 a 500 km": { setup: "00-00000196", teardown: "00-00000202", suffix: "300-500" },
  "Da 500 a 650 km": { setup: "00-00000197", teardown: "00-00000203", suffix: "500-650" },
  "Oltre 650 km / isole": { setup: "00-00000198", teardown: "00-00000204", suffix: "OVER-650" },
};

function line(input: Omit<OneCQuoteLine, "discount_percent" | "vat_rate_percent" | "vat_amount" | "gross_amount">): OneCQuoteLine {
  return {
    ...input,
    discount_percent: 0,
    vat_rate_percent: null,
    vat_amount: null,
    gross_amount: null,
  };
}

export function buildOneCQuoteLines(input: {
  assetName: string;
  equipmentAmount: number;
  personnelPeople: number;
  personnelDays: number;
  personnelDailyAmount: number;
  personnelAmount: number;
  ironTubes: number;
  ironTubeUnitAmount: number;
  rubberTubes: number;
  rubberTubeUnitAmount: number;
  boomName: string | null;
  boomAmount: number;
  compressorName: string | null;
  compressorAmount: number;
  transportBand: string;
  setupAmount: number;
  teardownAmount: number;
}) {
  const equipment = equipmentArticles[input.assetName] ?? {
    externalId: `DA-MEZ-${input.assetName.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    oneCCode: null,
  };
  const transport = transportArticleCodes[input.transportBand] ?? {
    setup: null,
    teardown: null,
    suffix: "UNMAPPED",
  };
  const equipmentIncluded = input.equipmentAmount > 0;
  const personnelIncluded = input.personnelAmount > 0;
  const ironIncluded = input.ironTubes > 0 && input.ironTubeUnitAmount > 0;
  const rubberIncluded = input.rubberTubes > 0 && input.rubberTubeUnitAmount > 0;
  const boomIncluded = Boolean(input.boomName) && input.boomAmount > 0;
  const compressorIncluded = Boolean(input.compressorName) && input.compressorAmount > 0;
  const setupIncluded = input.setupAmount > 0;
  const teardownIncluded = input.teardownAmount > 0;

  const lines: OneCQuoteLine[] = [
    line({
      line_number: 10,
      line_type: "equipment_rental",
      included: equipmentIncluded,
      article_external_id: equipment.externalId,
      article_1c_code: equipment.oneCCode,
      description: `Noleggio ${input.assetName}`,
      quantity: equipmentIncluded ? 1 : 0,
      unit_of_measure: "period",
      unit_price: equipmentIncluded ? input.equipmentAmount : 0,
      net_amount: equipmentIncluded ? input.equipmentAmount : 0,
    }),
    line({
      line_number: 20,
      line_type: "personnel",
      included: personnelIncluded,
      article_external_id: "DA-SRV-MANODOPERA",
      article_1c_code: "00-00000186",
      description: personnelIncluded
        ? `Personale operativo - ${input.personnelPeople} persone`
        : "Personale operativo - non previsto",
      quantity: personnelIncluded ? input.personnelDays : 0,
      unit_of_measure: "day",
      unit_price: personnelIncluded ? input.personnelDailyAmount : 0,
      net_amount: personnelIncluded ? input.personnelAmount : 0,
    }),
    line({
      line_number: 30,
      line_type: "iron_pipeline",
      included: ironIncluded,
      article_external_id: "DA-ACC-TUBO-FERRO-3M",
      article_1c_code: "00-00000189",
      description: "Noleggio tubazione in ferro da 3 m",
      quantity: ironIncluded ? input.ironTubes : 0,
      unit_of_measure: "piece_period",
      unit_price: ironIncluded ? input.ironTubeUnitAmount : 0,
      net_amount: ironIncluded ? input.ironTubes * input.ironTubeUnitAmount : 0,
    }),
    line({
      line_number: 40,
      line_type: "rubber_pipeline",
      included: rubberIncluded,
      article_external_id: "DA-ACC-TUBO-GOMMA-3M",
      article_1c_code: "00-00000190",
      description: "Noleggio tubazione in gomma da 3 m",
      quantity: rubberIncluded ? input.rubberTubes : 0,
      unit_of_measure: "piece_period",
      unit_price: rubberIncluded ? input.rubberTubeUnitAmount : 0,
      net_amount: rubberIncluded ? input.rubberTubes * input.rubberTubeUnitAmount : 0,
    }),
    line({
      line_number: 50,
      line_type: "stationary_boom",
      included: boomIncluded,
      article_external_id: "DA-SRV-NOLEGGIO-BRACCIO-STAZIONARIO",
      article_1c_code: "00-00000179",
      description: boomIncluded ? `Noleggio ${input.boomName}` : "Braccio stazionario - non richiesto",
      quantity: boomIncluded ? 1 : 0,
      unit_of_measure: "period",
      unit_price: boomIncluded ? input.boomAmount : 0,
      net_amount: boomIncluded ? input.boomAmount : 0,
    }),
    line({
      line_number: 60,
      line_type: "compressor",
      included: compressorIncluded,
      article_external_id: "DA-SRV-NOLEGGIO-COMPRESSORE",
      article_1c_code: "00-00000185",
      description: compressorIncluded ? `Noleggio ${input.compressorName}` : "Compressore - non richiesto",
      quantity: compressorIncluded ? 1 : 0,
      unit_of_measure: "period",
      unit_price: compressorIncluded ? input.compressorAmount : 0,
      net_amount: compressorIncluded ? input.compressorAmount : 0,
    }),
    line({
      line_number: 70,
      line_type: "setup",
      included: setupIncluded,
      article_external_id: `DA-SRV-ALLESTIMENTO-${transport.suffix}`,
      article_1c_code: transport.setup,
      description: `Allestimento cantiere - ${input.transportBand}`,
      quantity: setupIncluded ? 1 : 0,
      unit_of_measure: "service",
      unit_price: setupIncluded ? input.setupAmount : 0,
      net_amount: setupIncluded ? input.setupAmount : 0,
    }),
    line({
      line_number: 80,
      line_type: "teardown",
      included: teardownIncluded,
      article_external_id: `DA-SRV-DISALLESTIMENTO-${transport.suffix}`,
      article_1c_code: transport.teardown,
      description: `Disallestimento cantiere - ${input.transportBand}`,
      quantity: teardownIncluded ? 1 : 0,
      unit_of_measure: "service",
      unit_price: teardownIncluded ? input.teardownAmount : 0,
      net_amount: teardownIncluded ? input.teardownAmount : 0,
    }),
  ];

  return lines;
}

export function oneCLinesNetTotal(lines: OneCQuoteLine[]) {
  return lines.reduce((total, item) => total + item.net_amount, 0);
}
