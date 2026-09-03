import test from "node:test";
import assert from "node:assert/strict";
import { conflictsFor, isValidSitePeriod, isWithinSitePeriod, nextSiteDay, partsFromIso } from "../app/logistica/logic.ts";

const base = {
  projectId: "VARNA",
  siteStart: "2026-08-24",
  siteEnd: "2026-10-31",
  machine: "TB30",
  vehicle: "Eurocargo",
  people: ["Mario"],
};

test("il periodo cantiere accetta soltanto date coerenti nella finestra demo", () => {
  assert.equal(isValidSitePeriod("2026-08-24", "2026-10-31"), true);
  assert.equal(isValidSitePeriod("2026-09-10", "2026-09-09"), false);
  assert.equal(isValidSitePeriod("2026-07-31", "2026-09-09"), false);
  assert.deepEqual(partsFromIso("2026-09-30"), { month: 9, day: 30 });
  assert.equal(partsFromIso("2026-09-31"), null);
});

test("una giornata può essere assegnata solo dentro il periodo del cantiere", () => {
  assert.equal(isWithinSitePeriod(base, 8, 24), true);
  assert.equal(isWithinSitePeriod(base, 10, 31), true);
  assert.equal(isWithinSitePeriod(base, 8, 23), false);
});

test("la giornata successiva attraversa correttamente il cambio mese e rispetta la fine", () => {
  assert.deepEqual(nextSiteDay({ date: 31, month: 8, siteEnd: "2026-09-02" }), { month: 9, day: 1 });
  assert.equal(nextSiteDay({ date: 2, month: 9, siteEnd: "2026-09-02" }), null);
});

test("i conflitti sono giornalieri: stessa risorsa su giorni diversi è consentita", () => {
  const dayOne = { ...base, id: "A", date: 24, month: 8 };
  const dayTwo = { ...base, id: "B", date: 25, month: 8 };
  assert.equal(conflictsFor([dayOne, dayTwo]).size, 0);
  assert.deepEqual([...conflictsFor([dayOne, { ...dayTwo, date: 24 }])].sort(), ["A", "B"]);
});
