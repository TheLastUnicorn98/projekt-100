import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as B from '../js/battle.js';

const settings = { startKg: 144.15, targetKg: 100 };

test('Lebenspunkte: Kalorien bis zum Ziel wie im Plan (5/6 Fett × 7.000 kcal)', () => {
  assert.equal(B.maxHp(settings), 257542);
  assert.equal(B.monsterHp(settings, 143.4), 253167);
  assert.equal(B.monsterHp(settings, 99.5), 0);
});

test('Kampfrunde: Treffer, Heilung, nichts Neues, Sieg', () => {
  const hit = B.pendingRound([{ date: '2026-09-30', kg: 144.15 }, { date: '2026-10-01', kg: 143.4 }], settings, null);
  assert.deepEqual(hit, { date: '2026-10-01', fromKg: 144.15, toKg: 143.4, fromHp: 257542, toHp: 253167, damage: 4375, type: 'treffer' });
  const heal = B.pendingRound([{ date: '2026-10-02', kg: 143.9 }], settings, { date: '2026-10-01', kg: 143.4 });
  assert.equal(heal.type, 'heilung');
  assert.equal(heal.damage, -2916);
  assert.equal(B.pendingRound([{ date: '2026-10-01', kg: 143.4 }], settings, { date: '2026-10-01', kg: 143.4 }), null);
  assert.equal(B.pendingRound([], settings, null), null);
  const win = B.pendingRound([{ date: '2027-08-01', kg: 99.8 }], settings, { date: '2027-07-25', kg: 100.4 });
  assert.equal(win.type, 'sieg');
  assert.equal(win.toHp, 0);
  const same = B.pendingRound([{ date: '2026-09-30', kg: 144.15 }], settings, null);
  assert.equal(same.type, 'patt');
});

test('Sprüche: passend zum Ausgang und für denselben Tag immer gleich', () => {
  assert.ok(B.QUOTES.heilung.length >= 8);
  assert.equal(B.quote('heilung', '2026-10-02'), B.quote('heilung', '2026-10-02'));
  assert.ok(B.QUOTES.heilung.includes(B.quote('heilung', '2026-10-03')));
  assert.equal(Object.keys(B.MONSTERS).sort().join(','), 'drache,oger,ritter');
});
