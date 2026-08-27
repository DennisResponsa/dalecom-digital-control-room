import assert from "node:assert/strict";
import test from "node:test";
import {
  escapeODataString,
  mapOneCLead,
  oneCLeadDescription,
  validateOneCLeadRequest,
  type OneCLeadRequest,
} from "../app/one-c.ts";
import { buildOneCQuoteLines, ONE_C_SCHEMA_VERSION } from "../app/one-c-contract.ts";

const payload: OneCLeadRequest = {
  schema_version: ONE_C_SCHEMA_VERSION,
  payload_type: "dalecom.quote",
  event_id: "evt-test-001",
  event_type: "dalecom.quote.created",
  occurred_at: "2026-08-25T18:30:00Z",
  source: {
    application: "dalecom-preventivo-immediato",
    environment: "test",
    public_url: "https://dalecom-preventivo-immediato.denniscumerlato.chatgpt.site/",
  },
  crm_action: {
    create_lead: true,
    create_native_quote: true,
    link_quote_to_lead: true,
    lead_source: "website_quote_configurator",
  },
  customer: {
    company_name: "Cliente Demo S.r.l.",
    vat_or_tax_code: "IT00000000000",
    contact_name: "Mario Rossi",
    email: "mario@example.com",
    phone: "+39 000 0000000",
    privacy_consent: true,
    privacy_consent_at: "2026-08-25T18:29:00Z",
  },
  quote: {
    quote_reference: "DL-20260826",
    quote_status: "indicative",
    validity_hours: 48,
    currency: "EUR",
    vat_included: false,
    service: { code: "cold", label: "A freddo", washing_responsibility: "cliente" },
    job: { intervention: "Getto a lunga distanza" },
    site: { municipality: "Treviso" },
    schedule: { duration_working_days: 10 },
    main_equipment: { asset_name: "Putzmeister P715 TD" },
    stationary_boom: { required: false },
    compressor: { required: false },
    pipeline: { total_tubes_quantity: 10, rental_cost: 350 },
    personnel: { people_quantity: 0, total_cost: 0 },
    lines: buildOneCQuoteLines({
      assetName: "Putzmeister P715 TD",
      equipmentAmount: 2700,
      personnelPeople: 0,
      personnelDays: 0,
      personnelDailyAmount: 0,
      personnelAmount: 0,
      ironTubes: 9,
      ironTubeUnitAmount: 30,
      rubberTubes: 1,
      rubberTubeUnitAmount: 80,
      boomName: null,
      boomAmount: 0,
      compressorName: null,
      compressorAmount: 0,
      transportBand: "Fino a 50 km",
      setupAmount: 0,
      teardownAmount: 0,
    }),
    costs: {
      equipment_rental: 2700,
      personnel: 0,
      pipeline: 350,
      stationary_boom: 0,
      compressor: 0,
      setup: 0,
      teardown: 0,
      total_indicative: 3050,
    },
    review: { technical_confirmation_required: true },
  },
};

test("il payload 1C valido viene accettato e mappato senza alterare il totale", () => {
  const validated = validateOneCLeadRequest(payload);
  assert.equal(validated.valid, true);
  const mapped = mapOneCLead(payload);
  assert.equal(mapped.Description, "Cliente Demo S.r.l. · DL-20260826");
  assert.equal(mapped.Potential, 3050);
  assert.equal(mapped.LegalAddressTown, "Treviso");
  assert.match(mapped.Note, /"total_indicative": 3050/);
  assert.match(mapped.Note, /Lavaggio: cliente/);
});

test("il payload 1C rifiuta dati incompleti, consenso mancante e honeypot", () => {
  assert.equal(validateOneCLeadRequest(null).valid, false);
  assert.equal(validateOneCLeadRequest({ ...payload, website: "spam.example" }).valid, false);
  assert.equal(
    validateOneCLeadRequest({ ...payload, customer: { ...payload.customer, privacy_consent: false } }).valid,
    false,
  );
  assert.equal(
    validateOneCLeadRequest({ ...payload, customer: { ...payload.customer, email: "non-valida" } }).valid,
    false,
  );
});

test("le otto righe standard mantengono posizione e totale anche con voci escluse", () => {
  assert.deepEqual(payload.quote.lines.map((item) => item.line_number), [10, 20, 30, 40, 50, 60, 70, 80]);
  assert.deepEqual(payload.quote.lines.map((item) => item.line_type), [
    "equipment_rental",
    "personnel",
    "iron_pipeline",
    "rubber_pipeline",
    "stationary_boom",
    "compressor",
    "setup",
    "teardown",
  ]);
  assert.equal(payload.quote.lines.reduce((sum, item) => sum + item.net_amount, 0), 3050);
  assert.equal(payload.quote.lines[4].included, false);
  assert.equal(payload.quote.lines[4].net_amount, 0);
});

test("il payload rifiuta righe spostate o un totale non riconciliato", () => {
  const moved = structuredClone(payload);
  [moved.quote.lines[0], moved.quote.lines[1]] = [moved.quote.lines[1], moved.quote.lines[0]];
  assert.equal(validateOneCLeadRequest(moved).valid, false);
  const wrongTotal = structuredClone(payload);
  wrongTotal.quote.costs.total_indicative = 9999;
  assert.equal(validateOneCLeadRequest(wrongTotal).valid, false);
});

test("tutte le 128 combinazioni di voci opzionali conservano otto righe e il totale", () => {
  for (let mask = 0; mask < 128; mask += 1) {
    const enabled = (bit: number) => Boolean(mask & (1 << bit));
    const lines = buildOneCQuoteLines({
      assetName: "Putzmeister P715 TD",
      equipmentAmount: 2700,
      personnelPeople: enabled(0) ? 2 : 0,
      personnelDays: enabled(0) ? 5 : 0,
      personnelDailyAmount: enabled(0) ? 1116 : 0,
      personnelAmount: enabled(0) ? 5580 : 0,
      ironTubes: enabled(1) ? 9 : 0,
      ironTubeUnitAmount: enabled(1) ? 30 : 0,
      rubberTubes: enabled(2) ? 1 : 0,
      rubberTubeUnitAmount: enabled(2) ? 80 : 0,
      boomName: enabled(3) ? "Putzmeister MX28 · 28 m" : null,
      boomAmount: enabled(3) ? 2540 : 0,
      compressorName: enabled(4) ? "ATLAS XAVS186" : null,
      compressorAmount: enabled(4) ? 1170 : 0,
      transportBand: "Fino a 50 km",
      setupAmount: enabled(5) ? 1300 : 0,
      teardownAmount: enabled(6) ? 1716 : 0,
    });
    assert.equal(lines.length, 8);
    assert.deepEqual(lines.map((item) => item.line_number), [10, 20, 30, 40, 50, 60, 70, 80]);
    assert.equal(
      lines.reduce((sum, item) => sum + item.net_amount, 0),
      2700 +
        (enabled(0) ? 5580 : 0) +
        (enabled(1) ? 270 : 0) +
        (enabled(2) ? 80 : 0) +
        (enabled(3) ? 2540 : 0) +
        (enabled(4) ? 1170 : 0) +
        (enabled(5) ? 1300 : 0) +
        (enabled(6) ? 1716 : 0),
    );
  }
});

test("la ricerca duplicati OData gestisce gli apostrofi", () => {
  assert.equal(escapeODataString("L'Edile S.r.l."), "L''Edile S.r.l.");
  assert.equal(oneCLeadDescription({ ...payload, customer: { ...payload.customer, company_name: "L'Edile" } }), "L'Edile · DL-20260826");
});
