import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../js/logic.js';

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

test('Serie: Tage in Folge, heute offen zählt ab gestern, nichts vor dem Start', () => {
  const done = new Set(['2026-09-28', '2026-09-29']);
  const isComplete = (iso) => done.has(iso);
  assert.equal(L.streak(isComplete, '2026-09-30', '2026-09-28'), 2);
  done.add('2026-09-30');
  assert.equal(L.streak(isComplete, '2026-09-30', '2026-09-28'), 3);
  assert.equal(L.streak(isComplete, '2026-09-30', '2026-09-29'), 2);
  assert.equal(L.streak(() => false, '2026-09-30', '2026-09-28'), 0);
});

test('Zeitplan wie im Reel', () => {
  assert.deepEqual(L.planSchedule(120, 90), { dietDays: 175, breaks: 3, totalDays: 217 });
  assert.deepEqual(L.planSchedule(100, 80), { dietDays: 117, breaks: 2, totalDays: 145 });
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
  near(L.planWeightOn(s, 100, 80, s), 100, 0.001);
  const at56 = L.planWeightOn(s, 100, 80, L.addDays(s, 56));
  near(at56, 100 - (20 * 56) / 117, 0.001);
  near(L.planWeightOn(s, 100, 80, L.addDays(s, 63)), at56, 0.001);
  near(L.planWeightOn(s, 100, 80, L.addDays(s, 145)), 80, 0.001);
  near(L.planWeightOn(s, 100, 80, L.addDays(s, 200)), 80, 0.001);
});

test('Gewicht: Duplikate und 7-Tage-Schnitt', () => {
  const e = L.normalizeWeights([
    { date: '2026-10-02', kg: 99.0 },
    { date: '2026-09-30', kg: 100.2 },
    { date: '2026-10-02', kg: 98.8 },
    { date: '2026-10-01', kg: 99.6 },
  ]);
  assert.deepEqual(e.map((x) => x.date), ['2026-09-30', '2026-10-01', '2026-10-02']);
  assert.equal(e[2].kg, 98.8);
  near(L.avgOn(e, '2026-10-02'), (100.2 + 99.6 + 98.8) / 3, 0.001);
  assert.equal(L.avgOn(e, '2026-09-20'), null);
  near(L.avgOn(e, '2026-10-08'), 98.8, 0.001);
});

test('Trend und Prognose', () => {
  const s = '2026-09-30';
  const e = Array.from({ length: 21 }, (_, i) => ({ date: L.addDays(s, i), kg: 100 - 0.2 * i }));
  const end = L.addDays(s, 20);
  const t = L.trend(e, end);
  near(t.slope, -0.2, 1e-6);
  near(t.value, 96, 1e-6);
  assert.equal(L.projectDate(e, 76, end), L.addDays(end, 100));
  const flat = e.map((x) => ({ ...x, kg: 96 }));
  assert.equal(L.projectDate(flat, 76, end), null);
  assert.equal(L.trend([{ date: s, kg: 100 }], s), null);
});

test('Etappenziele und Neuberechnung', () => {
  assert.deepEqual(L.milestones(100, 80), [95, 90, 85, 80]);
  assert.deepEqual(L.milestones(140, 128), [135, 130, 128]);
  assert.equal(L.recalcSteps(100, 90.1), 0);
  assert.equal(L.recalcSteps(100, 89.9), 1);
  assert.equal(L.recalcSteps(100, 79.5), 2);
  const e = L.normalizeWeights([
    { date: '2026-09-30', kg: 100 },
    { date: '2026-10-10', kg: 97 },
    { date: '2026-10-20', kg: 98 },
  ]);
  near(L.bestAverage(e), 97, 0.001);
  assert.equal(L.bestAverage([]), null);
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
  assert.equal(L.formatAmount(14, 'Scheibe'), '14 Scheiben');
  assert.equal(L.formatAmount(2, 'Becher'), '2 Becher');
  assert.equal(L.formatAmount(7, 'EL'), '7 EL');
  assert.equal(L.formatNumber(2234.9, 0), '2.235');
  assert.equal(L.formatNumber(99.86, 1), '99,9');
});
