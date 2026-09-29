import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../js/logic.js';
import { ITEMS, RECIPES, WEEK_PLAN, CATEGORIES } from '../js/data.js';

const near = (actual, expected, tol = 0.5) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${actual} ist nicht ungefähr ${expected}`);

test('Datum: ISO, Tage addieren über die Zeitumstellung, Abstand', () => {
  assert.equal(L.toISO(new Date(2026, 8, 30, 23, 30)), '2026-09-30');
  assert.equal(L.addDays('2026-09-30', 1), '2026-10-01');
  assert.equal(L.addDays('2026-10-24', 2), '2026-10-26');
  assert.equal(L.addDays('2027-03-27', 2), '2027-03-29');
  assert.equal(L.daysBetween('2026-09-30', '2027-08-10'), 314);
  assert.equal(L.daysBetween('2026-10-01', '2026-09-30'), -1);
});

test('Datum: Wochentag und Woche ab Montag', () => {
  assert.equal(L.weekday('2026-09-29'), 2);
  assert.equal(L.mondayOf('2026-09-29'), '2026-09-28');
  assert.equal(L.mondayOf('2026-10-04'), '2026-09-28');
  assert.deepEqual(L.weekDates('2026-09-30'), [
    '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
  ]);
});

test('Nährwerte der Rezepte', () => {
  const p = L.recipeMacros(RECIPES.porridge, ITEMS);
  near(p.kcal, 424);
  near(p.protein, 33.5);
  const b = L.recipeMacros(RECIPES.bowl_thunfisch, ITEMS);
  near(b.kcal, 794);
  near(b.protein, 52.4);
  assert.equal(L.recipeMacros(RECIPES.frei, ITEMS).kcal, 1000);
});

test('Tagesplan mit Tausch und Tagessumme', () => {
  const tue = L.planFor('2026-09-29', undefined, WEEK_PLAN);
  assert.equal(tue.mittag, 'bowl_haehnchen');
  const swapped = L.planFor('2026-09-29', { swaps: { mittag: 'bowl_thunfisch' } }, WEEK_PLAN);
  assert.equal(swapped.mittag, 'bowl_thunfisch');
  assert.equal(swapped.fruehstueck, 'quark_bowl');
  const sat = L.planFor('2026-10-03', {}, WEEK_PLAN);
  assert.equal(sat.abend, 'frei');
  assert.equal(sat.snack, null);

  const mon = L.planFor('2026-09-28', {}, WEEK_PLAN);
  const all = { fruehstueck: true, mittag: true, abend: true, snack: true };
  const t = L.dayTotals(mon, all, RECIPES, ITEMS);
  near(t.kcal, 2235, 1);
  near(t.protein, 157.8);
  near(L.dayTotals(mon, { fruehstueck: true }, RECIPES, ITEMS).kcal, 424);
  assert.equal(L.dayTotals(mon, {}, RECIPES, ITEMS).kcal, 0);
});

test('Plan-Tag komplett und Serie', () => {
  const sat = L.planFor('2026-10-03', {}, WEEK_PLAN);
  assert.equal(L.isPlanComplete(sat, { fruehstueck: true, mittag: true, abend: true }), true);
  assert.equal(L.isPlanComplete(sat, { fruehstueck: true, mittag: true }), false);
  const full = { checked: { fruehstueck: true, mittag: true, abend: true, snack: true } };
  const days = { '2026-09-28': full, '2026-09-29': full, '2026-09-30': { checked: { fruehstueck: true } } };
  assert.equal(L.streak(days, '2026-09-30', '2026-09-28', WEEK_PLAN), 2);
  days['2026-09-30'] = full;
  assert.equal(L.streak(days, '2026-09-30', '2026-09-28', WEEK_PLAN), 3);
  assert.equal(L.streak(days, '2026-09-30', '2026-09-29', WEEK_PLAN), 2);
  assert.equal(L.streak({}, '2026-09-30', '2026-09-28', WEEK_PLAN), 0);
});

test('Zeitplan wie im Reel', () => {
  assert.deepEqual(L.planSchedule(120, 90), { dietDays: 175, breaks: 3, totalDays: 217 });
  assert.deepEqual(L.planSchedule(144.15, 100), { dietDays: 258, breaks: 4, totalDays: 314 });
});

test('Diät-Phasen: 8 Wochen Diät, 2 Wochen Pause', () => {
  const s = '2026-09-30';
  assert.deepEqual(L.phaseOn(s, s), { phase: 'diaet', week: 1, of: 8 });
  assert.deepEqual(L.phaseOn(s, L.addDays(s, 55)), { phase: 'diaet', week: 8, of: 8 });
  assert.deepEqual(L.phaseOn(s, L.addDays(s, 56)), { phase: 'pause', week: 1, of: 2 });
  assert.deepEqual(L.phaseOn(s, L.addDays(s, 69)), { phase: 'pause', week: 2, of: 2 });
  assert.deepEqual(L.phaseOn(s, L.addDays(s, 70)), { phase: 'diaet', week: 1, of: 8 });
  assert.equal(L.phaseOn(s, L.addDays(s, -1)).phase, 'vorher');
});

test('Plan-Linie sinkt nur in Diät-Wochen', () => {
  const s = '2026-09-30';
  near(L.planWeightOn(s, 144.15, 100, s), 144.15, 0.001);
  const at56 = L.planWeightOn(s, 144.15, 100, L.addDays(s, 56));
  near(at56, 144.15 - (44.15 * 56) / 258, 0.001);
  near(L.planWeightOn(s, 144.15, 100, L.addDays(s, 63)), at56, 0.001);
  near(L.planWeightOn(s, 144.15, 100, L.addDays(s, 314)), 100, 0.001);
  near(L.planWeightOn(s, 144.15, 100, L.addDays(s, 400)), 100, 0.001);
});

test('Gewicht: Duplikate und 7-Tage-Schnitt', () => {
  const e = L.normalizeWeights([
    { date: '2026-10-02', kg: 143.0 },
    { date: '2026-09-30', kg: 144.2 },
    { date: '2026-10-02', kg: 142.8 },
    { date: '2026-10-01', kg: 143.6 },
  ]);
  assert.deepEqual(e.map((x) => x.date), ['2026-09-30', '2026-10-01', '2026-10-02']);
  assert.equal(e[2].kg, 142.8);
  near(L.avgOn(e, '2026-10-02'), (144.2 + 143.6 + 142.8) / 3, 0.001);
  assert.equal(L.avgOn(e, '2026-09-20'), null);
  near(L.avgOn(e, '2026-10-08'), 142.8, 0.001);
});

test('Trend und Prognose', () => {
  const s = '2026-09-30';
  const e = Array.from({ length: 21 }, (_, i) => ({ date: L.addDays(s, i), kg: 144 - 0.2 * i }));
  const end = L.addDays(s, 20);
  const t = L.trend(e, end);
  near(t.slope, -0.2, 1e-6);
  near(t.value, 140, 1e-6);
  assert.equal(L.projectDate(e, 100, end), L.addDays(end, 200));
  const flat = e.map((x) => ({ ...x, kg: 140 }));
  assert.equal(L.projectDate(flat, 100, end), null);
  assert.equal(L.trend([{ date: s, kg: 144 }], s), null);
});

test('Etappenziele und Neuberechnung', () => {
  assert.deepEqual(L.milestones(144.15, 100), [140, 135, 130, 125, 120, 115, 110, 105, 100]);
  assert.deepEqual(L.milestones(140, 128), [135, 130, 128]);
  assert.equal(L.recalcSteps(144.15, 134.2), 0);
  assert.equal(L.recalcSteps(144.15, 133.9), 1);
  assert.equal(L.recalcSteps(144.15, 123.5), 2);
  const e = L.normalizeWeights([
    { date: '2026-09-30', kg: 144 },
    { date: '2026-10-10', kg: 141 },
    { date: '2026-10-20', kg: 142 },
  ]);
  near(L.bestAverage(e), 141, 0.001);
  assert.equal(L.bestAverage([]), null);
});

test('Einkaufsliste aus dem Wochenplan', () => {
  const { groups, pantry } = L.shoppingList(WEEK_PLAN, RECIPES, ITEMS, CATEGORIES);
  const amount = (id) => groups.flatMap((g) => g.rows).find((r) => r.id === id)?.amount;
  assert.equal(amount('haehnchenschenkel'), 750);
  assert.equal(amount('haehnchenbrust'), 850);
  assert.equal(amount('reis'), 980);
  assert.equal(amount('kartoffeln'), 1400);
  assert.equal(amount('tk_gemuese_mix'), 2100);
  assert.equal(amount('tk_gemuese'), 1500);
  assert.equal(amount('thunfisch'), 3);
  assert.equal(amount('banane'), 8);
  assert.equal(amount('milch'), 600);
  assert.equal(amount('haferflocken'), 360);
  assert.deepEqual(groups.map((g) => g.id), ['fleisch', 'kuehl', 'tk', 'obst', 'trocken']);
  assert.equal(pantry.find((p) => p.id === 'whey').amount, 180);
  assert.deepEqual(pantry.map((p) => p.id).sort(), ['gewuerz', 'oel', 'sojasauce', 'whey']);
});

test('Mengen und Zahlen auf Deutsch', () => {
  assert.equal(L.formatAmount(1400, 'g'), '1,4 kg');
  assert.equal(L.formatAmount(1000, 'g'), '1 kg');
  assert.equal(L.formatAmount(980, 'g'), '980 g');
  assert.equal(L.formatAmount(1000, 'ml'), '1 l');
  assert.equal(L.formatAmount(600, 'ml'), '600 ml');
  assert.equal(L.formatAmount(3, 'Dose'), '3 Dosen');
  assert.equal(L.formatAmount(1, 'Dose'), '1 Dose');
  assert.equal(L.formatAmount(8, 'Stück'), '8 Stück');
  assert.equal(L.formatNumber(2234.9, 0), '2.235');
  assert.equal(L.formatNumber(143.86, 1), '143,9');
});
