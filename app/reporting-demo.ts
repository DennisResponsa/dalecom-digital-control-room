export type ReconciledTimesheet = {
  number: string;
  employee: string;
  role: string;
  date: string;
  hours: number;
  status: "Congruo" | "Da completare" | "Incongruenza";
  statusTone: "ok" | "warning" | "error";
  source: string;
  thirdParty: string;
  note: string;
};

export const reconciledTimesheets: ReconciledTimesheet[] = [
  { number: "RAPP-260813-108", employee: "Toscano Enrico", role: "Autista betoniera", date: "2026-08-13", hours: 1.68, status: "Congruo", statusTone: "ok", source: "App 1C", thirdParty: "SuperBeton · DDT 44/26", note: "Orari, mezzo, cantiere e quantità coincidono" },
  { number: "RAPP-260813-109", employee: "Topala Mihai", role: "Pompista", date: "2026-08-13", hours: 1.62, status: "Da completare", statusTone: "warning", source: "App 1C", thirdParty: "SuperBeton · DDT 44/26", note: "Ora di fine attività assente sul documento della ditta terza" },
  { number: "RAPP-260812-094", employee: "Berdaga Mihail", role: "Preposto", date: "2026-08-12", hours: 10.42, status: "Incongruenza", statusTone: "error", source: "App 1C · caso demo", thirdParty: "Rapporto terzi RT-1248", note: "Differenza di 1 h 30 min sull’uscita dichiarata" },
];

export const reconciliationKpis = {
  total: reconciledTimesheets.length,
  congruent: reconciledTimesheets.filter((item) => item.statusTone === "ok").length,
  warnings: reconciledTimesheets.filter((item) => item.statusTone === "warning").length,
  discrepancies: reconciledTimesheets.filter((item) => item.statusTone === "error").length,
};
