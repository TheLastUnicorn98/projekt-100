import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, WEEK_PLAN, DEFAULT_PREFS, CATEGORIES, STANDARD_SNACKS } from '../js/data.js';
import { RECIPES } from '../js/recipes.js';
import * as P from '../js/planner.js';
import { addDays } from '../js/logic.js';

const settings = { kcal: 2200, protein: 150 };
const ctx = (over = {}) => ({ recipes: RECIPES, items: ITEMS, settings, startDate: '2026-09-28', ...over });
const MONDAY = '2026-10-05';
const likeAll = () => Object.fromEntries(P.deckFor(DEFAULT_PREFS, RECIPES, 1).map((id) => [id, 1]));
const withinTarget = (day, iso, c) => {
  const v = P.validateDay(day, P.dayTarget(iso, c), c);
  assert.ok(Math.abs(v.errorPct) <= P.TOLERANCE + 1e-9, `${iso}: ${Math.round(v.macros.kcal)} kcal statt ${P.dayTarget(iso, c)}`);
  return v;
};

test('Katalog: Zutaten existieren, Hauptgerichte haben genug Eiweiß und Gemüse', () => {
  for (const [id, r] of Object.entries(RECIPES)) {
    for (const ing of r.ingredients) assert.ok(ITEMS[ing.item], `${id}: Zutat ${ing.item} fehlt`);
    const options = P.sideOptions(r);
    assert.ok(options.length >= 1, id);
    if (r.slot === 'haupt' && !r.fixed) {
      const low = P.mealMacros({ id, side: options[0] }, RECIPES, ITEMS);
      assert.ok(low.protein >= 35, `${id}: nur ${low.protein} g Eiweiß`);
      assert.ok(low.veg >= 200, `${id}: nur ${low.veg} g Gemüse`);
    }
  }
});

test('Vorlieben filtern den Stapel', () => {
  const noFish = P.deckFor({ ...DEFAULT_PREFS, proteins: DEFAULT_PREFS.proteins.filter((p) => p !== 'fisch') }, RECIPES, 1);
  assert.ok(!noFish.includes('bowl_thunfisch') && !noFish.includes('lachs_reis'));
  const onlyAirfryer = P.deckFor({ ...DEFAULT_PREFS, devices: ['airfryer'] }, RECIPES, 1);
  assert.ok(onlyAirfryer.length > 0 && onlyAirfryer.every((id) => RECIPES[id].device === 'airfryer'));
  const quick = P.deckFor({ ...DEFAULT_PREFS, maxTime: 10 }, RECIPES, 1);
  assert.ok(quick.every((id) => RECIPES[id].time <= 10));
  assert.ok(!P.deckFor(DEFAULT_PREFS, RECIPES, 1).includes('frei'));
  assert.deepEqual(P.deckFor(DEFAULT_PREFS, RECIPES, 7), P.deckFor(DEFAULT_PREFS, RECIPES, 7));
});

test('Likes zählen je Art', () => {
  assert.deepEqual(P.likeCounts({ porridge: 1, quark_bowl: 2, bowl_haehnchen: 1, snack_shake: -1 }, RECIPES), {
    fruehstueck: 2,
    haupt: 1,
    snack: 0,
  });
});

test('Zu wenige Rechts-Wischer: der Planer sagt, was fehlt', () => {
  const r = P.buildWeek({ ...ctx(), mondayISO: MONDAY, likes: { porridge: 1, bowl_haehnchen: 1 }, prefs: DEFAULT_PREFS });
  assert.equal(r.ok, false);
  assert.deepEqual(r.missing, { fruehstueck: 1, haupt: 3, snack: 2 });
});

test('Wochenplan: Tageswerte passen, Reste vom Vorabend, freier Samstag', () => {
  const c = ctx();
  const r = P.buildWeek({ ...c, mondayISO: MONDAY, likes: likeAll(), prefs: DEFAULT_PREFS, seed: 3 });
  assert.equal(r.ok, true);
  const dates = Object.keys(r.plan.days).sort();
  assert.equal(dates.length, 7);
  dates.forEach((iso, i) => {
    const day = r.plan.days[iso];
    const prev = r.plan.days[dates[i - 1]];
    if (day.abend.id !== 'frei') {
      const v = withinTarget(day, iso, c);
      assert.ok(v.macros.protein >= settings.protein - 5, `${iso}: Eiweiß ${Math.round(v.macros.protein)}`);
      assert.ok(v.macros.veg >= 400, `${iso}: Gemüse ${v.macros.veg}`);
    }
    if (prev && prev.abend.id !== 'frei') {
      assert.equal(day.mittag.leftover, true);
      assert.equal(day.mittag.id, prev.abend.id);
      assert.equal(day.mittag.side, prev.abend.side);
      assert.equal(prev.abend.cook, 2);
    }
    if (prev) assert.notEqual(day.abend.id, prev.abend.id);
  });
  assert.equal(r.plan.days['2026-10-10'].abend.id, 'frei');
  assert.equal(r.plan.days['2026-10-10'].snack, undefined);
});

test('Super-Likes landen sicher im Plan', () => {
  const likes = { ...likeAll(), shakshuka: 2, kabeljau_kartoffel: 2 };
  const r = P.buildWeek({ ...ctx(), mondayISO: MONDAY, likes, prefs: DEFAULT_PREFS, seed: 9 });
  const dinners = Object.values(r.plan.days).map((d) => d.abend.id);
  assert.ok(dinners.includes('shakshuka') && dinners.includes('kabeljau_kartoffel'));
});

test('Diät-Pause: die Tage treffen das höhere Ziel', () => {
  const c = ctx({ startDate: addDays(MONDAY, -56) });
  const r = P.buildWeek({ ...c, mondayISO: MONDAY, likes: likeAll(), prefs: { ...DEFAULT_PREFS, freeEvening: false }, seed: 5 });
  for (const [iso, day] of Object.entries(r.plan.days)) {
    assert.equal(P.dayTarget(iso, c), 3200);
    withinTarget(day, iso, c);
  }
});

test('Tauschen hält die Tage im Ziel und zieht die Reste mit', () => {
  const c = ctx();
  const r = P.buildWeek({ ...c, mondayISO: MONDAY, likes: likeAll(), prefs: DEFAULT_PREFS, seed: 3 });
  const mon = MONDAY;
  const tue = addDays(MONDAY, 1);
  const before = r.plan.days[mon].abend.id;
  const target = before === 'chili_con_carne' ? 'hack_reis_pfanne' : 'chili_con_carne';

  const p2 = P.swapMeal(r.plan, mon, 'abend', target, c);
  assert.equal(p2.days[mon].abend.id, target);
  assert.equal(p2.days[mon].abend.cook, 2);
  assert.equal(p2.days[tue].mittag.id, target);
  assert.equal(p2.days[tue].mittag.leftover, true);
  withinTarget(p2.days[mon], mon, c);
  withinTarget(p2.days[tue], tue, c);

  const p3 = P.swapMeal(p2, tue, 'mittag', 'bowl_thunfisch', c);
  assert.equal(p3.days[tue].mittag.leftover, undefined);
  assert.equal(p3.days[mon].abend.cook, undefined);
  withinTarget(p3.days[tue], tue, c);

  const p4 = P.swapMeal(p3, tue, 'snack', 'protein_pudding', c);
  assert.equal(p4.days[tue].snack.id, 'protein_pudding');
  withinTarget(p4.days[tue], tue, c);

  assert.equal(r.plan.days[mon].abend.id, before);
});

test('Einkaufsliste: doppelt Gekochtes doppelt, Reste nicht noch einmal', () => {
  const plan = {
    week: MONDAY,
    days: {
      '2026-10-05': {
        fruehstueck: { id: 'porridge', side: 70 },
        mittag: { id: 'bowl_haehnchen', side: 100 },
        abend: { id: 'abend_huefte', side: 350, cook: 2 },
        snack: { id: 'snack_shake' },
      },
      '2026-10-06': {
        fruehstueck: { id: 'porridge', side: 80 },
        mittag: { id: 'abend_huefte', side: 350, leftover: true },
        abend: { id: 'frei' },
      },
    },
  };
  const { groups, pantry } = P.shoppingForPlan(plan, RECIPES, ITEMS, CATEGORIES);
  const amount = (id) => groups.flatMap((g) => g.rows).find((r) => r.id === id)?.amount;
  assert.equal(amount('rinderhuefte'), 500);
  assert.equal(amount('kartoffeln'), 700);
  assert.equal(amount('haehnchenbrust'), 180);
  assert.equal(amount('haferflocken'), 150);
  assert.equal(pantry.find((p) => p.id === 'whey').amount, 90);
});

test('Standardwoche: Tageswerte passen auch ohne Wischen', () => {
  const c = ctx();
  const plan = P.standardWeek(MONDAY, { ...c, weekPlan: WEEK_PLAN, snacks: STANDARD_SNACKS });
  for (const [iso, day] of Object.entries(plan.days)) if (day.abend.id !== 'frei') withinTarget(day, iso, c);
});

test('Zutatenzeilen lesen sich natürlich', () => {
  const line = (item, amount, extra = {}) => P.ingredientText({ item, amount, ...extra }, amount, ITEMS);
  assert.equal(line('reis', 120), '120 g Reis');
  assert.equal(line('eier', 3), '3 Eier');
  assert.equal(line('banane', 1), '1 Banane');
  assert.equal(line('vollkornbrot', 2), '2 Scheiben Vollkornbrot');
  assert.equal(line('thunfisch', 1), '1 Dose Thunfisch im eigenen Saft');
  assert.equal(line('oel', 2), '2 TL Öl');
  assert.equal(line('haehnchenbrust', 180, { note: 'in 2-cm-Würfeln' }), '180 g Hähnchenbrust, in 2-cm-Würfeln');
  assert.equal(line('gewuerz', 0, { text: 'Zimt' }), 'Zimt');
});

test('Offline-Speicher kennt ein Foto für jedes Gericht', async () => {
  const { readFile } = await import('node:fs/promises');
  const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  const block = sw.slice(sw.indexOf('const PHOTOS'), sw.indexOf('].map'));
  const listed = [...block.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort();
  const expected = Object.keys(RECIPES).filter((id) => !RECIPES[id].fixed).sort();
  assert.deepEqual(listed, expected);
});

test('Rest der Woche neu planen: Tage davor bleiben, Rest kommt aus den neuen Likes', () => {
  const c = ctx();
  const week = P.buildWeek({ ...c, mondayISO: MONDAY, likes: likeAll(), prefs: DEFAULT_PREFS, seed: 3 }).plan;
  const likes = { porridge: 1, quark_bowl: 1, shakshuka: 1, lachs_reis: 1, chili_con_carne: 1, teriyaki_haehnchen: 1, snack_shake: 1, skyr_beeren: 1 };
  const from = '2026-10-08';
  const r = P.replanRest({ ...c, plan: week, fromISO: from, likes, prefs: DEFAULT_PREFS, seed: 4 });
  assert.equal(r.ok, true);
  for (const iso of ['2026-10-05', '2026-10-06']) assert.deepEqual(r.plan.days[iso], week.days[iso]);
  const wed = r.plan.days['2026-10-07'];
  const thu = r.plan.days[from];
  assert.equal(wed.abend.id, week.days['2026-10-07'].abend.id);
  assert.equal(wed.abend.cook, 2);
  assert.equal(thu.mittag.leftover, true);
  assert.equal(thu.mittag.id, wed.abend.id);
  assert.equal(thu.mittag.side, wed.abend.side);
  const newMains = ['shakshuka', 'lachs_reis', 'chili_con_carne', 'teriyaki_haehnchen', 'frei'];
  for (const iso of ['2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']) {
    const day = r.plan.days[iso];
    assert.ok(newMains.includes(day.abend.id), `${iso}: ${day.abend.id}`);
    assert.ok(['porridge', 'quark_bowl'].includes(day.fruehstueck.id));
    if (day.abend.id !== 'frei') withinTarget(day, iso, c);
  }
  assert.equal(r.plan.days['2026-10-10'].abend.id, 'frei');
});

test('Rest der Woche: zu wenige Likes werden gemeldet', () => {
  const c = ctx();
  const week = P.buildWeek({ ...c, mondayISO: MONDAY, likes: likeAll(), prefs: DEFAULT_PREFS, seed: 3 }).plan;
  const r = P.replanRest({ ...c, plan: week, fromISO: '2026-10-08', likes: { porridge: 1 }, prefs: DEFAULT_PREFS });
  assert.equal(r.ok, false);
  assert.deepEqual(r.missing, { fruehstueck: 1, haupt: 4, snack: 2 });
});
