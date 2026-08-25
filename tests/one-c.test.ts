import assert from "node:assert/strict";
import test from "node:test";
import {
  escapeODataString,
  mapOneCLead,
  oneCLeadDescription,
  validateOneCLeadRequest,
  type OneCLeadRequest,
} from "../app/one-c.ts";

const payload: OneCLeadRequest = {
  event_id: "evt-test-001",
  event_type: "dalecom.quote.created",
  occurred_at: "2026-08-25T18:30:00Z",
  source: {
    application: "dalecom-preventivo-immediato",
    public_url: "https://dalecom-preventivo-immediato.denniscumerlato.chatgpt.site/",
  },
  customer: {
    company_name: "Cliente Demo S.r.l.",
    vat_or_tax_code: "IT00000000000",
    contact_name: "Mario Rossi",
    email: "mario@example.com",
    phone: "+39 000 0000000",
    privacy_consent: true,
  },
  quote: {
    quote_reference: "DL-20260826",
    service: { code: "cold", label: "A freddo", washing_responsibility: "cliente" },
    job: { intervention: "Getto a lunga distanza" },
    site: { municipality: "Treviso" },
    schedule: { duration_working_days: 10 },
    main_equipment: { asset_name: "Putzmeister P715 TD" },
    stationary_boom: { required: false },
    compressor: { required: false },
    pipeline: { total_tubes_quantity: 10, rental_cost: 350 },
    personnel: { people_quantity: 0, total_cost: 0 },
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

test("la ricerca duplicati OData gestisce gli apostrofi", () => {
  assert.equal(escapeODataString("L'Edile S.r.l."), "L''Edile S.r.l.");
  assert.equal(oneCLeadDescription({ ...payload, customer: { ...payload.customer, company_name: "L'Edile" } }), "L'Edile · DL-20260826");
});
