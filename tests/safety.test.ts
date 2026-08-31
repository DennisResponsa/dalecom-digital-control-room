import test from "node:test";
import assert from "node:assert/strict";
import { employeeNames, safetyCheck, safetyEmployees } from "../app/safety-data.ts";

test("l'anagrafica sicurezza riprende tutte le 66 persone dell'organigramma", () => {
  assert.equal(employeeNames.length, 66);
  assert.equal(new Set(employeeNames).size, 66);
  assert.equal(safetyEmployees.length, 66);
});

test("i primi tre profili demo hanno un Safety Passport dettagliato", () => {
  assert.deepEqual(safetyEmployees.slice(0, 3).map((employee) => employee.detailed), [true, true, true]);
  assert.ok(safetyEmployees.slice(0, 3).every((employee) => employee.requirements.length >= 7));
});

test("un requisito rosso blocca l'assegnazione al cantiere", () => {
  const result = safetyCheck("Marconato Ermens", "Varna");
  assert.equal(result.level, "red");
  assert.ok(result.missing.includes("Idoneità sanitaria"));
});
