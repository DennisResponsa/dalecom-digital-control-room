import assert from "node:assert/strict";
import test from "node:test";
import { reconciliationKpis, reconciledTimesheets } from "../app/reporting-demo.ts";

test("i rapportini demo hanno riferimenti univoci", () => {
  assert.equal(new Set(reconciledTimesheets.map((item) => item.number)).size, reconciledTimesheets.length);
});

test("gli indicatori di riconciliazione tornano con le schede", () => {
  assert.equal(reconciliationKpis.total, reconciledTimesheets.length);
  assert.equal(reconciliationKpis.congruent + reconciliationKpis.warnings + reconciliationKpis.discrepancies, reconciliationKpis.total);
});

test("ogni rapportino contiene ore e sorgenti valide", () => {
  for (const report of reconciledTimesheets) {
    assert.ok(Number.isFinite(report.hours) && report.hours > 0);
    assert.ok(report.source.length > 0);
    assert.ok(report.thirdParty.length > 0);
  }
});
