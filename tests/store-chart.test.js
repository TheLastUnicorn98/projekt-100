import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState, emptyState, isReady } from '../js/store.js';
import { niceScale } from '../js/chart.js';

const ready = { startKg: 100, targetKg: 80, startDate: '2026-09-30', kcal: 2200 };

test('Unbrauchbare Daten ergeben einen leeren Zustand', () => {
  assert.deepEqual(normalizeState(null), emptyState());
  assert.deepEqual(normalizeState('kaputt'), emptyState());
  assert.equal(isReady(emptyState()), false);
});

test('Daten aus Version 1 werden übernommen, Ungültiges fliegt raus', () => {
  const s = normalizeState(
    {
      settings: ready,
      weights: [{ date: '2026-09-30', kg: 100 }, { date: 'gestern', kg: 1 }, { date: '2026-10-01', kg: 'x' }],
      days: {
        '2026-09-30': {
          checked: { fruehstueck: true, mittag: 'ja' },
          swaps: { mittag: 'bowl_thunfisch', abend: 'gibtsnicht', snack: 'porridge' },
        },
      },
      shopping: { checked: { reis: true, milch: 1 } },
    },
    { today: '2026-09-30' },
  );
  assert.equal(isReady(s), true);
  assert.equal(s.settings.protein, 150);
  assert.equal(s.prefs, null);
  assert.deepEqual(s.weights, [{ date: '2026-09-30', kg: 100 }]);
  assert.deepEqual(s.days['2026-09-30'], { checked: { fruehstueck: true }, swaps: { mittag: 'bowl_thunfisch' } });
  assert.deepEqual(s.shopping['2026-09-28'].checked, { reis: true });
});

test('Vorlieben, Pläne und Wisch-Ergebnisse werden geprüft', () => {
  const s = normalizeState({
    settings: ready,
    prefs: { devices: ['airfryer', 'toaster'], proteins: ['haehnchen', 'x'], maxTime: 20, freeEvening: true },
    plans: {
      '2026-10-05': {
        week: '2026-10-05',
        kind: 'gewischt',
        snacks: ['snack_shake', 'nix'],
        days: {
          '2026-10-05': {
            fruehstueck: { id: 'porridge', side: 70 },
            mittag: { id: 'bowl_haehnchen', side: 100, leftover: 'ja' },
            abend: { id: 'abend_huefte', side: 350, cook: 2 },
            snack: { id: 'porridge' },
          },
        },
      },
      kaputt: { days: 5 },
    },
    swipes: { '2026-10-05': { order: ['porridge', 'nix'], votes: { porridge: 1, nix: 1, quark_bowl: 7 } } },
  });
  assert.deepEqual(s.prefs, { devices: ['airfryer'], proteins: ['haehnchen'], maxTime: 20, freeEvening: true });
  assert.deepEqual(Object.keys(s.plans), ['2026-10-05']);
  const plan = s.plans['2026-10-05'];
  assert.deepEqual(plan.snacks, ['snack_shake']);
  assert.deepEqual(plan.days['2026-10-05'], {
    fruehstueck: { id: 'porridge', side: 70 },
    mittag: { id: 'bowl_haehnchen', side: 100 },
    abend: { id: 'abend_huefte', side: 350, cook: 2 },
  });
  assert.deepEqual(s.swipes['2026-10-05'], { order: ['porridge'], votes: { porridge: 1 } });
});

test('Diagramm-Achse mit runden Werten', () => {
  assert.deepEqual(niceScale(95.2, 100.6, 4), { min: 94, max: 102, step: 2, ticks: [94, 96, 98, 100, 102] });
  assert.deepEqual(niceScale(80, 100, 5), { min: 80, max: 100, step: 5, ticks: [80, 85, 90, 95, 100] });
  const flat = niceScale(99, 99, 4);
  assert.ok(flat.min < 99 && flat.max > 99 && flat.ticks.length >= 3);
});

test('Kampfstand wird geprüft', () => {
  const s = normalizeState({
    settings: ready,
    battle: { monster: 'einhorn', seen: { date: '2026-10-01', kg: 99.4 }, last: { date: 'x' }, sound: false },
  });
  assert.deepEqual(s.battle, { monster: 'drache', seen: { date: '2026-10-01', kg: 99.4 }, last: null, sound: false });
  assert.equal(normalizeState({ settings: ready, battle: { monster: 'oger' } }).battle.monster, 'oger');
});
