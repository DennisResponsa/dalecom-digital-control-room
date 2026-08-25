export type OneCLeadRequest = {
  event_id: string;
  event_type: "dalecom.quote.created";
  occurred_at: string;
  source: {
    application: string;
    public_url: string;
  };
  customer: {
    company_name: string;
    vat_or_tax_code: string;
    contact_name: string;
    email: string;
    phone: string;
    privacy_consent: boolean;
  };
  quote: {
    quote_reference: string;
    service: { code: string; label: string; washing_responsibility: string };
    job: Record<string, unknown>;
    site: Record<string, unknown>;
    schedule: Record<string, unknown>;
    main_equipment: Record<string, unknown>;
    stationary_boom: Record<string, unknown>;
    compressor: Record<string, unknown>;
    pipeline: Record<string, unknown>;
    personnel: Record<string, unknown>;
    costs: {
      equipment_rental: number;
      personnel: number;
      pipeline: number;
      stationary_boom: number;
      compressor: number;
      setup: number;
      teardown: number;
      total_indicative: number;
    };
    review: Record<string, unknown>;
  };
  website?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateOneCLeadRequest(value: unknown):
  | { valid: true; data: OneCLeadRequest }
  | { valid: false; error: string } {
  if (!value || typeof value !== "object") return { valid: false, error: "Payload non valido" };
  const data = value as Partial<OneCLeadRequest> & { website?: unknown };
  if (data.website) return { valid: false, error: "Richiesta non valida" };
  if (!data.event_id || data.event_type !== "dalecom.quote.created") {
    return { valid: false, error: "Evento non valido" };
  }
  const customer = data.customer;
  if (
    !customer ||
    !customer.company_name?.trim() ||
    !customer.contact_name?.trim() ||
    !emailPattern.test(customer.email || "") ||
    !customer.phone?.trim() ||
    customer.privacy_consent !== true
  ) {
    return { valid: false, error: "Dati cliente obbligatori mancanti o non validi" };
  }
  const quote = data.quote;
  if (
    !quote?.quote_reference?.trim() ||
    !quote.service?.code ||
    !quote.main_equipment ||
    !quote.costs ||
    !Number.isFinite(quote.costs.total_indicative) ||
    quote.costs.total_indicative < 0
  ) {
    return { valid: false, error: "Dati preventivo mancanti o non validi" };
  }
  if (
    customer.company_name.length > 200 ||
    customer.contact_name.length > 200 ||
    customer.email.length > 320 ||
    customer.phone.length > 80 ||
    (customer.vat_or_tax_code || "").length > 40
  ) {
    return { valid: false, error: "Uno o più campi superano la lunghezza consentita" };
  }
  return { valid: true, data: data as OneCLeadRequest };
}

export function oneCLeadDescription(data: OneCLeadRequest) {
  return `${data.customer.company_name.trim()} · ${data.quote.quote_reference}`.slice(0, 250);
}

export function mapOneCLead(data: OneCLeadRequest) {
  const total = data.quote.costs.total_indicative;
  const basicInformation = [
    data.customer.company_name.trim(),
    `${data.customer.contact_name.trim()} · ${data.customer.email.trim()} · ${data.customer.phone.trim()}`,
    `${data.quote.quote_reference} · ${data.quote.service.label} · € ${total.toLocaleString("it-IT")}`,
  ].join("\n");
  const note = [
    "LEAD CREATO DAL CONFIGURATORE DALECOM",
    `Riferimento: ${data.quote.quote_reference}`,
    `Cliente: ${data.customer.company_name}`,
    `Referente: ${data.customer.contact_name}`,
    `Email: ${data.customer.email}`,
    `Telefono: ${data.customer.phone}`,
    `P.IVA/C.F.: ${data.customer.vat_or_tax_code || "Non indicata"}`,
    `Servizio: ${data.quote.service.label}`,
    `Lavaggio: ${data.quote.service.washing_responsibility}`,
    `Totale indicativo IVA esclusa: € ${total.toLocaleString("it-IT")}`,
    "",
    "DATI COMPLETI PREVENTIVO (JSON)",
    JSON.stringify(data.quote, null, 2),
  ].join("\n");
  const vat = (data.customer.vat_or_tax_code || "").trim();
  return {
    Description: oneCLeadDescription(data),
    Created: new Date().toISOString().slice(0, 19),
    BasicInformation: basicInformation,
    Note: note,
    KanbanDescription: `${data.quote.quote_reference} · € ${total.toLocaleString("it-IT")} · ${data.quote.service.label}`,
    Individual: false,
    Potential: Math.round(total),
    TIN: vat,
    VATNumber: vat,
    LegalAddressTown: String(data.quote.site.municipality || ""),
    Website: data.source.public_url,
    Italy_InfoAzienda: `${data.customer.contact_name} · ${data.customer.email} · ${data.customer.phone}`,
    Italy_NoteCallAzienda: `Richiesta web ${data.quote.quote_reference}`,
  };
}

export function escapeODataString(value: string) {
  return value.replaceAll("'", "''");
}
