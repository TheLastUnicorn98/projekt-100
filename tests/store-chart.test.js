import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState, emptyState, isReady } from '../js/store.js';
import { niceScale } from '../js/chart.js';

test('Unbrauchbare Daten ergeben einen leeren Zustand', () => {
  assert.deepEqual(normalizeState(null), emptyState());
  assert.deepEqual(normalizeState('kaputt'), emptyState());
  assert.equal(isReady(emptyState()), false);
});

test('Gültige Daten bleiben erhalten, ungültige Einträge fliegen raus', () => {
  const s = normalizeState({
    settings: { startKg: 144.15, targetKg: 100, startDate: '2026-09-30', kcal: 2200 },
    weights: [{ date: '2026-09-30', kg: 144.15 }, { date: 'gestern', kg: 1 }, { date: '2026-10-01', kg: 'x' }],
    days: {
      '2026-09-30': {
        checked: { fruehstueck: true, mittag: 'ja' },
        swaps: { mittag: 'bowl_thunfisch', abend: 'gibtsnicht', snack: 'porridge' },
      },
    },
    shopping: { checked: { reis: true, milch: 1 } },
  });
  assert.equal(isReady(s), true);
  assert.equal(s.settings.protein, 150);
  assert.deepEqual(s.weights, [{ date: '2026-09-30', kg: 144.15 }]);
  assert.deepEqual(s.days['2026-09-30'], { checked: { fruehstueck: true }, swaps: { mittag: 'bowl_thunfisch' } });
  assert.deepEqual(s.shopping.checked, { reis: true });
});

test('Diagramm-Achse mit runden Werten', () => {
  assert.deepEqual(niceScale(139.2, 144.6, 4), { min: 138, max: 146, step: 2, ticks: [138, 140, 142, 144, 146] });
  assert.deepEqual(niceScale(100, 144.15, 5), { min: 100, max: 150, step: 10, ticks: [100, 110, 120, 130, 140, 150] });
  const flat = niceScale(143, 143, 4);
  assert.ok(flat.min < 143 && flat.max > 143 && flat.ticks.length >= 3);
});
