export type SafetyLevel = "green" | "yellow" | "red";

export type SafetyRequirement = {
  id: string;
  label: string;
  category: "Documento" | "Formazione" | "Abilitazione" | "Accesso";
  expires?: string;
  status: SafetyLevel;
};

export type SafetyEmployee = {
  name: string;
  role: string;
  branch: string;
  detailed: boolean;
  requirements: SafetyRequirement[];
};

export const employeeNames = [
  "Miglioranza Cristiano", "Loriato Flavio", "Marconato Ermens",
  "Aouf Mahmoud Hussein", "Berdaga Dionisie", "Berdaga Iacob", "Berdaga Maxim", "Berdaga Mihail", "Berdaga Tudor",
  "Bertoia Laura", "Bilibio Enrico", "Bogdan Emi Lucian", "Bratulescu Ionuț", "Buonaiuto Paco", "Calio’ Salvatore",
  "Cani Tonin", "Cimino Lucio", "Colan Ciprian", "Comiotto Walter", "Dal Zilio Alessandro", "Dan Bogdan",
  "Elaraby Abdelrahman", "Elshalaby Mohamed Ibrahim", "Elshalaby Youssef", "Favaro Giovanni", "Fighera Silvia",
  "Filippetto Ivan", "Garavaglia Ilaria", "Garbin Thomas", "Gueye Khadime", "Ismail Tarek", "Ismailaj Romario",
  "Kaci Ilirjan", "Karoma Alhaji", "Kwame Fosu Ebenezer", "Lamanna Anthony", "Lamanna Giuseppe", "Mechhouri Bouabid",
  "Mesfef Mohammed", "Mihali Daniel", "Mihuta Flavius", "Mircos Grigore", "Montano Stefano", "Munteanu Mario Gabriel",
  "Munteanu Nicolae", "Naoussi Carlo", "Ndiaye Ibrahima", "Ntim Samuel", "Pace Vincenzo", "Pralea Vasile",
  "Radice Carlo", "Rapallini Stefano", "Rivero Estrada Liudbel", "Samia Gabriela", "Sow Moustapha", "Stecho Dorel",
  "Stefanato Veronica", "Stetco Toader", "Talmaci Andrei", "Toscano Enrico", "Turco Lorenzo", "Varo Gianmarco",
  "Verejan Radu", "Zamà Serghei", "Zangirolami Alex", "Zaramella Nicola",
] as const;

const baseGreen: SafetyRequirement[] = [
  { id: "medical", label: "Idoneità sanitaria", category: "Documento", expires: "18/04/2027", status: "green" },
  { id: "general", label: "Formazione generale", category: "Formazione", expires: "Senza scadenza", status: "green" },
  { id: "specific", label: "Formazione specifica rischio alto", category: "Formazione", expires: "30/06/2031", status: "green" },
  { id: "dpi", label: "Consegna e addestramento DPI III cat.", category: "Formazione", expires: "12/02/2027", status: "green" },
  { id: "pump", label: "Addetto pompe calcestruzzo", category: "Abilitazione", expires: "21/03/2031", status: "green" },
  { id: "portal", label: "Portali cliente e badge", category: "Accesso", expires: "31/12/2026", status: "green" },
];

const profile = (name: string, role: string, branch: string, requirements: SafetyRequirement[], detailed = true): SafetyEmployee => ({ name, role, branch, requirements, detailed });

export const safetyEmployees: SafetyEmployee[] = employeeNames.map((name, index) => {
  if (index === 0) return profile(name, "Preposto · caposquadra pompe", "Padernello", [
    ...baseGreen,
    { id: "preposto", label: "Formazione preposto", category: "Formazione", expires: "15/05/2027", status: "green" },
    { id: "firstAid", label: "Primo soccorso gruppo A", category: "Formazione", expires: "09/11/2027", status: "green" },
    { id: "fire", label: "Antincendio livello 2", category: "Formazione", expires: "14/02/2029", status: "green" },
  ]);
  if (index === 1) return profile(name, "Pompista · autista", "Padernello", [
    ...baseGreen.map((item) => item.id === "pump" ? { ...item, expires: "12/09/2026", status: "yellow" as const } : item),
    { id: "license", label: "Patente C + CQC", category: "Abilitazione", expires: "28/10/2026", status: "yellow" },
    { id: "fire", label: "Antincendio livello 2", category: "Formazione", expires: "22/05/2028", status: "green" },
  ]);
  if (index === 2) return profile(name, "Operatore pompe", "Treviso", [
    ...baseGreen.map((item) => item.id === "medical" ? { ...item, expires: "26/08/2026", status: "red" as const } : item.id === "portal" ? { ...item, expires: "Non autorizzato", status: "red" as const } : item),
    { id: "confined", label: "Spazi confinati", category: "Abilitazione", expires: "Da programmare", status: "yellow" },
  ]);
  const red = [8, 14, 20].includes(index);
  const yellow = [4, 7, 11, 17].includes(index);
  return profile(name, index % 4 === 0 ? "Autista" : "Operatore cantiere", index % 3 === 0 ? "Bareggio" : "Padernello", [
    { ...baseGreen[0], expires: red ? "Scaduta" : yellow ? "Entro 30 giorni" : "2027", status: red ? "red" : yellow ? "yellow" : "green" },
    { ...baseGreen[1] },
    { ...baseGreen[2], status: red ? "red" : "green", expires: red ? "Da completare" : "2031" },
    { ...baseGreen[3], status: yellow ? "yellow" : "green", expires: yellow ? "Entro 60 giorni" : "2027" },
    { ...baseGreen[5], status: red ? "red" : "green", expires: red ? "Non autorizzato" : "2026" },
  ], false);
});

export const siteExtraRequirements: Record<string, string[]> = {
  "Varna": ["medical", "general", "specific", "dpi", "portal"],
  "Roma · ColaBeton": ["medical", "general", "specific", "dpi", "portal"],
  "Modena · Vera Costruzioni": ["medical", "general", "specific", "dpi", "pump", "portal"],
  "Trieste · Piccola Sicilia": ["medical", "general", "specific", "dpi", "portal"],
  "Vicenza · EdilDesign": ["medical", "general", "specific", "dpi", "pump", "portal"],
};

export function safetyCheck(name: string, site?: string) {
  const employee = safetyEmployees.find((item) => item.name === name);
  if (!employee) return { level: "red" as const, missing: ["Anagrafica sicurezza assente"], warnings: [] as string[] };
  const requiredIds = siteExtraRequirements[site || ""] || ["medical", "general", "specific", "dpi"];
  const relevant = employee.requirements.filter((item) => requiredIds.includes(item.id));
  const missing = relevant.filter((item) => item.status === "red").map((item) => item.label);
  const warnings = relevant.filter((item) => item.status === "yellow").map((item) => item.label);
  return { level: missing.length ? "red" as const : warnings.length ? "yellow" as const : "green" as const, missing, warnings };
}

export function employeeOverallLevel(employee: SafetyEmployee): SafetyLevel {
  if (employee.requirements.some((item) => item.status === "red")) return "red";
  if (employee.requirements.some((item) => item.status === "yellow")) return "yellow";
  return "green";
}

export const trainingCourses = [
  { id: "CRS-101", title: "Formazione specifica rischio alto", date: "03/09/2026", hours: 12, trainer: "HSE · formatore interno", seats: 8, enrolled: 6, mode: "Aula + test", status: "Programmato" },
  { id: "CRS-102", title: "Addestramento pompe calcestruzzo", date: "08/09/2026", hours: 8, trainer: "Cristiano Miglioranza", seats: 6, enrolled: 5, mode: "Campo prove", status: "Programmato" },
  { id: "CRS-103", title: "Aggiornamento DPI III categoria", date: "16/09/2026", hours: 4, trainer: "HSE · formatore interno", seats: 12, enrolled: 9, mode: "Microlearning + prova", status: "Inviti inviati" },
  { id: "CRS-104", title: "Preposto: aggiornamento periodico", date: "29/09/2026", hours: 6, trainer: "Ente accreditato", seats: 5, enrolled: 3, mode: "Videoconferenza", status: "Da confermare" },
] as const;

export const siteAccesses = [
  { site: "Varna", customer: "Cliente internazionale", departure: "02/09/2026", people: ["Miglioranza Cristiano", "Marconato Ermens", "Mustapha Sow", "Enon Iloghiojie"] },
  { site: "Modena · Vera Costruzioni", customer: "Vera Costruzioni", departure: "04/09/2026", people: ["Kaci Ilirjan", "Basile Bambara", "Mohammed Mestef"] },
  { site: "Roma · ColaBeton", customer: "ColaBeton", departure: "07/09/2026", people: ["Loriato Flavio", "Serghei", "Berdaga Tudor"] },
  { site: "Vicenza · EdilDesign", customer: "EdilDesign", departure: "09/09/2026", people: ["Garbin Thomas", "Talmaci Andrei", "Pace Vincenzo"] },
] as const;

export const onboardingCases = [
  { name: "Operatore Demo A", start: "24/08/2026", target: "05/09/2026", progress: 82, missing: "Autorizzazione portale cliente", owner: "HSE" },
  { name: "Autista Demo B", start: "27/08/2026", target: "10/09/2026", progress: 58, missing: "Visita medica + formazione specifica", owner: "HR + HSE" },
  { name: "Pompista Demo C", start: "29/08/2026", target: "12/09/2026", progress: 34, missing: "DPI, corso pompa, badge", owner: "HSE" },
] as const;

export const nearMisses = [
  { id: "NM-026", date: "28/08/2026", site: "Padernello", title: "Area tubazioni non segregata", cause: "Procedura non applicata", action: "Microlearning e briefing squadra", status: "Aperto" },
  { id: "NM-025", date: "19/08/2026", site: "Modena", title: "DPI uditivi non utilizzati", cause: "Percezione rischio insufficiente", action: "Richiamo formativo completato", status: "Chiuso" },
  { id: "NM-024", date: "07/08/2026", site: "Bareggio", title: "Passaggio non protetto vicino alla pompa", cause: "Segnaletica incompleta", action: "Checklist pre-avvio aggiornata", status: "Verifica efficacia" },
] as const;
