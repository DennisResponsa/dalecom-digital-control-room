import assert from "node:assert/strict";
import test from "node:test";
import {
  assetRates,
  boomRates,
  compressorRates,
  durationLabel,
  equipmentAllowed,
  boomAllowed,
  ironTubeRates,
  logisticsFor,
  personnelFor,
  quoteTotal,
  recommendedDurationDays,
  rentalForRates,
  rubberTubeRates,
  tubingFor,
  tubesIncluded,
} from "../app/quote-logic.ts";

const durations = [1, 3, 5, 10, 15, 20, 25, 30, 40, 60, 80, 120, 180, 240];

test("le tariffe principali coincidono con il listino rev. 6", () => {
  assert.equal(Object.keys(assetRates).length, 8);
  assert.deepEqual(assetRates["Turbosol TB30 Cingolata"], {
    day: 460,
    week: 1650,
    months: [4980, 4700, 4880, 4400, 3790, 3370, 3090, 2900, 2870, 2820, 2750, 2700],
  });
  assert.deepEqual(boomRates["Putzmeister MX36-4 · 36 m"], {
    day: 690,
    week: 2440,
    months: [7150, 6700, 6980, 6230, 5260, 4600, 4170, 3870, 3810, 3740, 3630, 3540],
  });
  assert.equal(compressorRates.months[0], 3430);
  assert.deepEqual(ironTubeRates, { day: 10, week: 20, months: [30, 30, 30, 30, 20, 20, 20, 20, 20, 20, 20, 20] });
  assert.deepEqual(rubberTubeRates, { day: 10, week: 40, months: [80, 70, 80, 70, 60, 60, 50, 50, 50, 50, 50, 50] });
});

test("tutti i canoni sono finiti, non negativi e non diminuiscono aumentando i giorni", () => {
  const rates = [...Object.values(assetRates), ...Object.values(boomRates), compressorRates, ironTubeRates, rubberTubeRates];
  for (const rate of rates) {
    let previous = 0;
    for (let day = 0; day <= 260; day += 1) {
      const cost = rentalForRates(rate, day);
      assert.ok(Number.isFinite(cost) && cost >= 0);
      assert.ok(cost >= previous, `canone diminuito al giorno ${day}: ${previous} -> ${cost}`);
      previous = cost;
    }
  }
});

test("il personale copre ogni formula, famiglia e presenza del braccio", () => {
  const services = ["freddo", "semifreddo", "caldo"] as const;
  const equipment = ["autopompa", "city", "carrellata", "malte"] as const;
  let cases = 0;
  for (const service of services) {
    for (const machine of equipment) {
      for (const boom of [false, true]) {
        const crew = personnelFor(service, machine, boom);
        assert.ok(crew.people >= 0 && crew.dailyCost >= 0);
        cases += 1;
      }
    }
  }
  assert.equal(cases, 24);
  assert.deepEqual(personnelFor("semifreddo", "autopompa", false), { people: 1, dailyCost: 486 });
  assert.deepEqual(personnelFor("semifreddo", "city", false), { people: 2, dailyCost: 1116 });
  assert.deepEqual(personnelFor("caldo", "autopompa", false), { people: 1, dailyCost: 630 });
  assert.deepEqual(personnelFor("caldo", "city", false), { people: 2, dailyCost: 1116 });
  assert.deepEqual(personnelFor("caldo", "city", true), { people: 3, dailyCost: 1602 });
  assert.deepEqual(personnelFor("caldo", "autopompa", true), { people: 3, dailyCost: 1602 });
  assert.deepEqual(personnelFor("freddo", "autopompa", false), { people: 0, dailyCost: 0 });
});

test("la matrice di selezione rispetta formula, macchina, braccio e tubi", () => {
  assert.equal(equipmentAllowed("freddo", "autopompa"), false);
  assert.equal(equipmentAllowed("freddo", "city"), false);
  assert.equal(equipmentAllowed("freddo", "carrellata"), true);
  assert.equal(equipmentAllowed("freddo", "malte"), true);
  for (const equipment of ["autopompa", "city", "carrellata", "malte"] as const) {
    assert.equal(equipmentAllowed("semifreddo", equipment), true);
    assert.equal(equipmentAllowed("caldo", equipment), true);
    assert.equal(boomAllowed("freddo", equipment), false);
    assert.equal(boomAllowed("semifreddo", equipment), false);
  }
  assert.equal(boomAllowed("caldo", "malte"), false);
  assert.equal(boomAllowed("caldo", "autopompa"), true);
  assert.equal(boomAllowed("caldo", "city"), true);
  assert.equal(boomAllowed("caldo", "carrellata"), true);
  assert.equal(tubesIncluded("freddo", "carrellata", false), true);
  assert.equal(tubesIncluded("freddo", "malte", false), true);
  assert.equal(tubesIncluded("freddo", "autopompa", false), false);
  assert.equal(tubesIncluded("freddo", "city", false), false);
  assert.equal(tubesIncluded("semifreddo", "autopompa", false), false);
  assert.equal(tubesIncluded("caldo", "autopompa", false), false);
  assert.equal(tubesIncluded("caldo", "autopompa", true), true);
  assert.equal(tubesIncluded("semifreddo", "city", false), true);
  assert.equal(tubesIncluded("caldo", "city", false), true);
});

test("volume, frequenza e durata restano matematicamente coerenti", () => {
  let cases = 0;
  for (const perPour of [1, 20, 60, 80, 125]) {
    for (const total of [perPour, perPour * 2, perPour * 5, perPour * 21]) {
      const pours = Math.ceil(total / perPour);
      for (let weekly = 1; weekly <= pours; weekly += 1) {
        const days = recommendedDurationDays(pours, weekly);
        const capacity = days === 1 ? 1 : (days / 5) * weekly;
        assert.ok(capacity >= pours);
        assert.ok(durationLabel(days).length > 0);
        cases += 1;
      }
    }
  }
  assert.equal(cases, 145);
  assert.equal(recommendedDurationDays(1, 1), 1);
  assert.equal(recommendedDurationDays(5, 2), 15);
  assert.equal(recommendedDurationDays(21, 4), 30);
  assert.equal(recommendedDurationDays(7, 5), 10);
});

test("regressione screenshot: 200 m³ non diventano 45 settimane o € 42.750", () => {
  const pours = Math.ceil(200 / 30);
  const days = recommendedDurationDays(pours, 5);
  const rental = rentalForRates(assetRates["Putzmeister SP 11 LMR"], days);
  const crew = personnelFor("freddo", "malte", false);
  assert.equal(pours, 7);
  assert.equal(days, 10);
  assert.equal(rental, 640);
  assert.deepEqual(crew, { people: 0, dailyCost: 0 });
  assert.equal(tubesIncluded("freddo", "malte", false), true);
  assert.equal(quoteTotal({ rental, crew: 0, tubes: 0, boom: 0, compressor: 0, setup: 0, teardown: 0 }), 640);
});

test("a freddo le pompe carrellate includono il canone dei tubi ma non il personale", () => {
  const days = recommendedDurationDays(7, 5);
  const line = tubingFor(30, 0, 1, false, days);
  const rental = rentalForRates(assetRates["Putzmeister P715 TD"], days);
  const crew = personnelFor("freddo", "carrellata", false);
  assert.equal(days, 10);
  assert.equal(line.cost, 350);
  assert.deepEqual(crew, { people: 0, dailyCost: 0 });
  assert.equal(quoteTotal({ rental, crew: 0, tubes: line.cost, boom: 0, compressor: 0, setup: 0, teardown: 0 }), rental + 350);
});

test("gli addendi a zero non introducono cifre o zeri aggiuntivi", () => {
  assert.equal(quoteTotal({ rental: 640, crew: 0, tubes: 0, boom: 0, compressor: 0, setup: 0, teardown: 0 }), 640);
  assert.equal(quoteTotal({ rental: 640, crew: 1260, tubes: 350, boom: 0, compressor: 0, setup: 1300, teardown: 1716 }), 5266);
  assert.equal(rentalForRates(assetRates["Putzmeister SP 11 LMR"], 225), 7360);
  assert.notEqual(rentalForRates(assetRates["Putzmeister SP 11 LMR"], 225), 42750);
});

test("la distinta tubazioni copre distanza e quota in tutti i casi limite", () => {
  let cases = 0;
  for (const horizontal of [0, 1, 3, 30, 45, 100]) {
    for (const elevation of [-30, -3, 0, 15, 50]) {
      for (const floors of [1, 4, 20]) {
        for (const boom of [false, true]) {
          for (const duration of durations) {
            const line = tubingFor(horizontal, elevation, floors, boom, duration);
            assert.equal(line.lineMeters, horizontal + Math.abs(elevation));
            assert.ok((line.ironTubes + line.rubberTubes) * 3 >= line.lineMeters);
            assert.ok(line.curves >= 2 && line.kits >= 1 && line.cost >= 0);
            cases += 1;
          }
        }
      }
    }
  }
  assert.equal(cases, 2520);
  assert.equal(tubingFor(60, 15, 4, true, 30).cost, 1580);
});

test("le soglie logistiche sono applicate senza buchi", () => {
  const boundaries = [0, 50, 51, 150, 151, 300, 301, 500, 501, 650, 651, 1000];
  for (const km of boundaries) {
    for (const boom of [false, true]) {
      const logistics = logisticsFor(km, boom);
      assert.ok(logistics.setup > 0 && logistics.teardown > 0 && logistics.band.length > 0);
    }
  }
  assert.deepEqual(logisticsFor(336, true), {
    band: "Da 300 a 500 km",
    setup: 5720,
    teardown: 5720,
    configuration: "Pompa + braccio",
  });
});

test("la matrice economica completa non genera NaN o totali negativi", () => {
  let cases = 0;
  for (const rate of Object.values(assetRates)) {
    for (const duration of durations) {
      for (const service of ["freddo", "semifreddo", "caldo"] as const) {
        for (const equipment of ["autopompa", "city", "carrellata", "malte"] as const) {
          for (const boom of [false, true]) {
            for (const compressor of [false, true]) {
              for (const km of [0, 51, 151, 301, 501, 651]) {
                const personnel = personnelFor(service, equipment, boom);
                const logistics = logisticsFor(km, boom);
                const tubing = tubingFor(45, -3, 4, boom, duration);
                const total =
                  rentalForRates(rate, duration) +
                  personnel.dailyCost * 5 +
                  tubing.cost +
                  (boom ? rentalForRates(boomRates["Putzmeister MX36-4 · 36 m"], duration) : 0) +
                  (compressor ? rentalForRates(compressorRates, duration) : 0) +
                  logistics.setup +
                  logistics.teardown;
                assert.ok(Number.isFinite(total) && total >= 0);
                cases += 1;
              }
            }
          }
        }
      }
    }
  }
  assert.equal(cases, 32256);
});
