export type CalendarAssignment = {
  id: string;
  projectId: string;
  date: number | null;
  month: number | null;
  siteStart: string;
  siteEnd: string;
  machine: string;
  vehicle: string;
  people: string[];
};

export const PLANNING_YEAR = 2026;
export const PLANNING_START = "2026-08-01";
export const PLANNING_END = "2026-10-31";

export function isoDate(month: number, day: number) {
  return `${PLANNING_YEAR}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function partsFromIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match || Number(match[1]) !== PLANNING_YEAR) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(PLANNING_YEAR, month - 1, day, 12);
  if (date.getMonth() + 1 !== month || date.getDate() !== day) return null;
  return { month, day };
}

export function isWithinSitePeriod(item: Pick<CalendarAssignment, "siteStart" | "siteEnd">, month: number, day: number) {
  const value = isoDate(month, day);
  return value >= item.siteStart && value <= item.siteEnd;
}

export function isValidSitePeriod(start: string, end: string) {
  return Boolean(partsFromIso(start) && partsFromIso(end) && start <= end && start >= PLANNING_START && end <= PLANNING_END);
}

export function nextSiteDay(item: Pick<CalendarAssignment, "date" | "month" | "siteEnd">) {
  if (item.date === null || item.month === null) return null;
  const next = new Date(PLANNING_YEAR, item.month - 1, item.date + 1, 12);
  const value = isoDate(next.getMonth() + 1, next.getDate());
  if (value > item.siteEnd || value > PLANNING_END) return null;
  return { month: next.getMonth() + 1, day: next.getDate() };
}

export function conflictsFor(assignments: CalendarAssignment[]) {
  const conflicts = new Set<string>();
  const dated = assignments.filter((item) => item.date !== null && item.month !== null);
  dated.forEach((item, index) => {
    if (!isWithinSitePeriod(item, item.month!, item.date!)) conflicts.add(item.id);
    dated.slice(index + 1).forEach((other) => {
      if (item.date !== other.date || item.month !== other.month) return;
      const sharedPerson = item.people.some((person) => other.people.includes(person));
      const sharedMachine = item.machine !== "Macchina da assegnare" && item.machine === other.machine;
      const sharedVehicle = item.vehicle !== "Mezzo da assegnare" && item.vehicle === other.vehicle;
      if (sharedMachine || sharedVehicle || sharedPerson) {
        conflicts.add(item.id);
        conflicts.add(other.id);
      }
    });
  });
  return conflicts;
}
