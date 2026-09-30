import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as B from '../js/battle.js';

const settings = { startKg: 100, targetKg: 80 };

test('Lebenspunkte: Kalorien bis zum Ziel wie im Plan (5/6 Fett × 7.000 kcal)', () => {
  assert.equal(B.maxHp(settings), 116667);
  assert.equal(B.monsterHp(settings, 99.4), 113167);
  assert.equal(B.monsterHp(settings, 79.5), 0);
});

test('Kampfrunde: Treffer, Heilung, nichts Neues, Sieg', () => {
  const hit = B.pendingRound([{ date: '2026-09-30', kg: 100 }, { date: '2026-10-01', kg: 99.4 }], settings, null);
  assert.deepEqual(hit, { date: '2026-10-01', fromKg: 100, toKg: 99.4, fromHp: 116667, toHp: 113167, damage: 3500, type: 'treffer' });
  const heal = B.pendingRound([{ date: '2026-10-02', kg: 99.9 }], settings, { date: '2026-10-01', kg: 99.4 });
  assert.equal(heal.type, 'heilung');
  assert.equal(heal.damage, -2916);
  assert.equal(B.pendingRound([{ date: '2026-10-01', kg: 99.4 }], settings, { date: '2026-10-01', kg: 99.4 }), null);
  assert.equal(B.pendingRound([], settings, null), null);
  const win = B.pendingRound([{ date: '2027-08-01', kg: 79.8 }], settings, { date: '2027-07-25', kg: 80.4 });
  assert.equal(win.type, 'sieg');
  assert.equal(win.toHp, 0);
  const same = B.pendingRound([{ date: '2026-09-30', kg: 100 }], settings, null);
  assert.equal(same.type, 'patt');
});

test('Sprüche: passend zum Ausgang und für denselben Tag immer gleich', () => {
  assert.ok(B.QUOTES.heilung.length >= 8);
  assert.equal(B.quote('heilung', '2026-10-02'), B.quote('heilung', '2026-10-02'));
  assert.ok(B.QUOTES.heilung.includes(B.quote('heilung', '2026-10-03')));
  assert.equal(Object.keys(B.MONSTERS).sort().join(','), 'drache,oger,ritter');
});

test('Rundenschaden verteilt sich auf drei Schläge ohne Rest', () => {
  assert.deepEqual(B.splitHits(3500), [1050, 1050, 1400]);
  assert.deepEqual(B.splitHits(0), [0, 0, 0]);
  for (const d of [1, 7, 2333, 116667]) assert.equal(B.splitHits(d).reduce((a, b) => a + b, 0), d);
  for (const m of Object.values(B.MONSTERS)) assert.ok(m.attack && m.w > 0 && m.aim.length === 2 && m.mouth.length === 2);
});
