// Wochenplaner: baut aus den Rechts-Wischern eine Woche und hält jeden Tag im Kalorienziel.
// Stellschraube ist die Beilage (Reis, Kartoffeln, Haferflocken, Brot). Fleisch, Fisch und Gemüse bleiben fix.
import { weekDates, weekday, phaseOn, PLAN, formatAmount, formatNumber } from './logic.js';

export const TOLERANCE = 0.03;
export const MAIN_SHARE = 0.34;
export const MIN_LIKES = { fruehstueck: 2, haupt: 4, snack: 2 };
export const MEAL_SLOTS = ['fruehstueck', 'mittag', 'abend', 'snack', 'extra'];

// ---------- Zufall mit Startwert: gleiche Woche, gleicher Stapel ----------

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Mahlzeiten und Nährwerte ----------

const sideOf = (recipe) => recipe.ingredients.find((i) => i.side);
export const amountOf = (ing, meal) => (ing.side && meal?.side != null ? meal.side : ing.amount);

export function sideOptions(recipe) {
  const ing = sideOf(recipe);
  if (!ing) return [null];
  const [min, max, step = 10] = ing.side;
  const out = [];
  for (let v = min; v <= max + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

export function defaultMeal(id, recipes) {
  const ing = sideOf(recipes[id]);
  return ing ? { id, side: ing.amount } : { id };
}

const KEYS = ['kcal', 'protein', 'fat', 'carbs', 'fiber', 'veg'];
const zero = () => ({ kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, veg: 0 });

export function sumMacros(list) {
  const t = zero();
  for (const m of list) if (m) for (const k of KEYS) t[k] += m[k] ?? 0;
  return t;
}

// Nährwerte einer Portion.
export function mealMacros(meal, recipes, items) {
  const recipe = recipes[meal.id];
  if (recipe.fixed) return { ...zero(), ...recipe.fixed };
  const t = zero();
  for (const ing of recipe.ingredients) {
    const it = items[ing.item];
    const amount = amountOf(ing, meal);
    const f = amount / it.per;
    t.kcal += it.kcal * f;
    t.protein += it.protein * f;
    t.fat += it.fat * f;
    t.carbs += it.carbs * f;
    t.fiber += it.fiber * f;
    if (it.veg && it.unit === 'g') t.veg += amount;
  }
  return t;
}

export function dayMeals(day) {
  return MEAL_SLOTS.filter((slot) => day?.[slot]).map((slot) => ({ slot, meal: day[slot] }));
}

export function dayMacros(day, recipes, items, checked) {
  return sumMacros(
    dayMeals(day)
      .filter(({ slot }) => !checked || checked[slot])
      .map(({ meal }) => mealMacros(meal, recipes, items)),
  );
}

export function isDayComplete(day, checked) {
  const meals = dayMeals(day);
  return meals.length > 0 && meals.every(({ slot }) => checked?.[slot]);
}

// In der Diät-Pause wird auf Erhaltung gegessen: Ziel plus das sonstige Defizit.
export function dayTarget(iso, ctx) {
  const pause = ctx.startDate && phaseOn(ctx.startDate, iso).phase === 'pause';
  return ctx.settings.kcal + (pause ? PLAN.deficit : 0);
}

export function validateDay(day, target, ctx) {
  const macros = dayMacros(day, ctx.recipes, ctx.items);
  const errorPct = (macros.kcal - target) / target;
  const free = day.abend?.id === 'frei';
  const issues = [];
  if (!free) {
    if (Math.abs(errorPct) > TOLERANCE) issues.push(errorPct < 0 ? 'zu-wenig' : 'zu-viel');
    if (macros.protein < ctx.settings.protein - 5) issues.push('eiweiss');
    if (macros.veg < 400) issues.push('gemuese');
    if (macros.fiber < 25) issues.push('ballaststoffe');
  }
  return { macros, errorPct, issues, ok: issues.length === 0 };
}

// ---------- Vorlieben und Stapel ----------

export function allowed(recipe, prefs) {
  if (recipe.fixed) return false;
  if (!prefs) return true;
  const devices = [recipe.device, ...(recipe.alt ?? [])];
  if (!devices.some((d) => prefs.devices.includes(d))) return false;
  if (recipe.time > prefs.maxTime) return false;
  return (recipe.proteins ?? []).every((p) => prefs.proteins.includes(p));
}

export function deckFor(prefs, recipes, seed = 1) {
  return shuffle(
    Object.keys(recipes).filter((id) => allowed(recipes[id], prefs)),
    rng(seed),
  );
}

export function likeCounts(likes, recipes) {
  const counts = { fruehstueck: 0, haupt: 0, snack: 0 };
  for (const [id, v] of Object.entries(likes ?? {})) if (v > 0 && recipes[id] && !recipes[id].fixed) counts[recipes[id].slot] += 1;
  return counts;
}

// ---------- Anpassen ----------

function cachedMacros(ctx) {
  const cache = new Map();
  return (meal) => {
    if (!meal) return null;
    const key = `${meal.id}|${meal.side ?? ''}`;
    if (!cache.has(key)) cache.set(key, mealMacros(meal, ctx.recipes, ctx.items));
    return cache.get(key);
  };
}

function bestSide(meal, targetKcal, ctx, macrosOf) {
  let best = meal.side;
  let bestErr = Infinity;
  for (const side of sideOptions(ctx.recipes[meal.id])) {
    if (side == null) continue;
    const err = Math.abs(macrosOf({ ...meal, side }).kcal - targetKcal);
    if (err < bestErr) {
      bestErr = err;
      best = side;
    }
  }
  return best;
}

// Wählt Frühstücks-Beilage und Snack so, dass der Tag möglichst genau aufs Ziel kommt.
// Überschrittene Toleranz kostet viel, fehlendes Eiweiß mittel, ein Extra-Snack wenig.
export function fitDay(day, target, ctx, macrosOf = cachedMacros(ctx), prevSnack) {
  const free = day.abend?.id === 'frei';
  const pause = target > ctx.settings.kcal;
  const pool = ctx.snacks ?? [];
  const base = sumMacros([day.mittag, day.abend].filter(Boolean).map(macrosOf));
  const breakfasts = day.fruehstueck
    ? sideOptions(ctx.recipes[day.fruehstueck.id]).map((side) => (side == null ? day.fruehstueck : { ...day.fruehstueck, side }))
    : [null];
  const snacks = free ? [null] : day.snack?.pinned ? [day.snack] : pool.length ? pool.map((id) => ({ id })) : [null];
  const extras = pause && !free ? [null, ...pool.map((id) => ({ id }))] : [null];
  let best = null;
  for (const b of breakfasts) {
    const mb = macrosOf(b);
    for (const s of snacks) {
      const ms = macrosOf(s);
      for (const x of extras) {
        const m = sumMacros([base, mb, ms, macrosOf(x)]);
        const err = Math.abs(m.kcal - target) / target;
        let cost = err + (err > TOLERANCE ? 10 * (err - TOLERANCE) : 0);
        if (!free && m.protein < ctx.settings.protein) cost += ((ctx.settings.protein - m.protein) / ctx.settings.protein) * 0.5;
        if (x) cost += x.id === s?.id ? 0.006 : 0.004;
        if (s && prevSnack && s.id === prevSnack) cost += 0.002;
        if (!best || cost < best.cost) best = { cost, b, s, x };
      }
    }
  }
  const next = { ...day };
  if (best.b) next.fruehstueck = best.b;
  if (best.s) next.snack = best.s;
  else delete next.snack;
  if (best.x) next.extra = best.x;
  else delete next.extra;
  return next;
}

// Bringt alle (oder nur die genannten) Tage einer Woche ins Ziel. Gibt eine neue Woche zurück.
export function fitWeek(plan, ctx, onlyDates) {
  const next = structuredClone(plan);
  const fitCtx = { ...ctx, snacks: plan.snacks ?? ctx.snacks };
  const dates = Object.keys(next.days).sort();
  const scope = new Set(onlyDates ?? dates);
  const macrosOf = cachedMacros(ctx);
  const targets = Object.fromEntries(dates.map((iso) => [iso, dayTarget(iso, ctx)]));
  const err = (iso) => {
    const kcal = sumMacros(dayMeals(next.days[iso]).map(({ meal }) => macrosOf(meal))).kcal;
    return Math.abs(kcal - targets[iso]) / targets[iso];
  };
  const syncLeftover = (i) => {
    const today = next.days[dates[i]];
    const tomorrow = next.days[dates[i + 1]];
    if (tomorrow?.mittag?.leftover && tomorrow.mittag.id === today?.abend?.id) tomorrow.mittag.side = today.abend.side;
  };
  const refit = (i) => {
    if (i < 0 || i >= dates.length) return;
    next.days[dates[i]] = fitDay(next.days[dates[i]], targets[dates[i]], fitCtx, macrosOf, next.days[dates[i - 1]]?.snack?.id);
  };
  const adjustable = (meal) => meal && !meal.leftover && !ctx.recipes[meal.id].fixed && meal.side != null;

  // 1) Hauptgerichte auf ihren Anteil am Tag bringen, Reste übernehmen die Menge vom Vorabend.
  dates.forEach((iso, i) => {
    if (!scope.has(iso)) return;
    for (const slot of ['mittag', 'abend']) {
      const meal = next.days[iso][slot];
      if (adjustable(meal)) meal.side = bestSide(meal, MAIN_SHARE * targets[iso], ctx, macrosOf);
    }
    syncLeftover(i);
  });

  // 2) Frühstück und Snacks anpassen. Reicht das nicht, die Beilage vom Abend (und damit den Rest morgen) verschieben.
  const tryAdjust = (i) => {
    const iso = dates[i];
    for (const slot of ['abend', 'mittag']) {
      const meal = next.days[iso][slot];
      if (!adjustable(meal)) continue;
      const feedsTomorrow = slot === 'abend' && next.days[dates[i + 1]]?.mittag?.leftover;
      let best = { cost: Infinity, side: meal.side };
      for (const side of sideOptions(ctx.recipes[meal.id])) {
        meal.side = side;
        if (slot === 'abend') syncLeftover(i);
        refit(i);
        let cost = err(iso);
        if (feedsTomorrow) {
          refit(i + 1);
          cost += err(dates[i + 1]);
        }
        if (cost < best.cost) best = { cost, side };
      }
      meal.side = best.side;
      if (slot === 'abend') syncLeftover(i);
      refit(i);
      if (feedsTomorrow) refit(i + 1);
      if (err(iso) <= TOLERANCE) return;
    }
  };

  for (let pass = 0; pass < 3; pass++) {
    dates.forEach((iso, i) => {
      if (!scope.has(iso)) return;
      refit(i);
      if (err(iso) > TOLERANCE) tryAdjust(i);
    });
  }
  return next;
}

// ---------- Woche bauen ----------

export function buildWeek({ mondayISO, likes, prefs, seed = 1, ...ctx }) {
  const liked = (kind) =>
    Object.keys(ctx.recipes).filter((id) => {
      const r = ctx.recipes[id];
      return r.slot === kind && (likes?.[id] ?? 0) > 0 && allowed(r, prefs);
    });
  const pools = { fruehstueck: liked('fruehstueck'), haupt: liked('haupt'), snack: liked('snack') };
  const missing = {};
  for (const [kind, min] of Object.entries(MIN_LIKES)) if (pools[kind].length < min) missing[kind] = min - pools[kind].length;
  if (Object.keys(missing).length) return { ok: false, missing };

  const random = rng(seed);
  const order = [
    ...shuffle(pools.haupt.filter((id) => likes[id] === 2), random),
    ...shuffle(pools.haupt.filter((id) => likes[id] !== 2), random),
  ];
  const freeIndex = prefs?.freeEvening ? 5 : -1;
  const dinners = [];
  let k = 0;
  for (let d = 0; d < 7; d++) {
    if (d === freeIndex) {
      dinners.push('frei');
      continue;
    }
    if (order[k % order.length] === dinners[d - 1]) k += 1;
    dinners.push(order[k % order.length]);
    k += 1;
  }

  // Frisch gekocht wird mittags nur, wenn es keinen Rest vom Vorabend gibt: montags und nach dem freien Abend.
  const used = new Map();
  for (const id of dinners) used.set(id, (used.get(id) ?? 0) + 2);
  const pickFresh = (d) => {
    const options = order.filter((id) => id !== dinners[d] && id !== dinners[d - 1]);
    options.sort((a, b) => (used.get(a) ?? 0) - (used.get(b) ?? 0) || ctx.recipes[a].time - ctx.recipes[b].time);
    const id = options[0] ?? order[0];
    used.set(id, (used.get(id) ?? 0) + 1);
    return id;
  };

  const breakfasts = shuffle(pools.fruehstueck, random);
  const days = {};
  weekDates(mondayISO).forEach((iso, d) => {
    const leftover = d > 0 && dinners[d - 1] !== 'frei';
    const lunch = leftover ? dinners[d - 1] : pickFresh(d);
    const cooksDouble = d < 6 && dinners[d] !== 'frei';
    days[iso] = {
      fruehstueck: defaultMeal(breakfasts[d % breakfasts.length], ctx.recipes),
      mittag: { ...defaultMeal(lunch, ctx.recipes), ...(leftover ? { leftover: true } : {}) },
      abend: { ...defaultMeal(dinners[d], ctx.recipes), ...(cooksDouble ? { cook: 2 } : {}) },
    };
  });
  const plan = { week: mondayISO, kind: 'gewischt', snacks: pools.snack, days };
  return { ok: true, plan: fitWeek(plan, ctx) };
}

// Woche ohne Wischen: die feste Standardwoche, ebenfalls aufs Ziel gerechnet.
export function standardWeek(mondayISO, ctx) {
  const days = {};
  for (const iso of weekDates(mondayISO)) {
    const base = { ...ctx.weekPlan[weekday(iso)], ...(ctx.legacySwaps?.[iso] ?? {}) };
    days[iso] = {
      fruehstueck: defaultMeal(base.fruehstueck, ctx.recipes),
      mittag: defaultMeal(base.mittag, ctx.recipes),
      abend: defaultMeal(base.abend, ctx.recipes),
    };
  }
  return fitWeek({ week: mondayISO, kind: 'standard', snacks: ctx.snacks, days }, ctx);
}

// ---------- Tauschen ----------

export function swapMeal(plan, iso, slot, id, ctx) {
  const next = structuredClone(plan);
  const dates = Object.keys(next.days).sort();
  const i = dates.indexOf(iso);
  const day = next.days[iso];
  const old = day[slot];
  const tomorrow = next.days[dates[i + 1]];
  const yesterday = next.days[dates[i - 1]];
  const scope = [iso];
  if (slot === 'abend') {
    const fedTomorrow = tomorrow?.mittag?.leftover && tomorrow.mittag.id === old?.id;
    day.abend = defaultMeal(id, ctx.recipes);
    if (fedTomorrow) {
      if (ctx.recipes[id].fixed) {
        tomorrow.mittag = defaultMeal(old.id, ctx.recipes);
      } else {
        day.abend.cook = 2;
        tomorrow.mittag = { ...defaultMeal(id, ctx.recipes), leftover: true };
      }
      scope.push(dates[i + 1]);
    }
  } else if (slot === 'mittag') {
    if (old?.leftover && yesterday?.abend) delete yesterday.abend.cook;
    day.mittag = defaultMeal(id, ctx.recipes);
  } else if (slot === 'snack' || slot === 'extra') {
    day[slot] = { id, pinned: true };
  } else {
    day[slot] = defaultMeal(id, ctx.recipes);
  }
  return fitWeek(next, ctx, scope);
}

// ---------- Einkauf und Zutatenzeilen ----------

export function shoppingForPlan(plan, recipes, items, categories) {
  const totals = new Map();
  for (const day of Object.values(plan.days)) {
    for (const { meal } of dayMeals(day)) {
      if (meal.leftover) continue;
      const portions = meal.cook ?? 1;
      for (const ing of recipes[meal.id].ingredients) {
        totals.set(ing.item, (totals.get(ing.item) ?? 0) + amountOf(ing, meal) * portions);
      }
    }
  }
  const ids = Object.keys(items).filter((id) => totals.has(id));
  const row = (id) => ({
    id,
    name: items[id].name,
    amount: Math.round(totals.get(id) * 100) / 100,
    unit: items[id].unit,
    showAmount: items[id].showAmount ?? items[id].cat !== 'vorrat',
  });
  const groups = categories
    .map((c) => ({ id: c.id, label: c.label, rows: ids.filter((id) => items[id].cat === c.id).map(row) }))
    .filter((g) => g.rows.length);
  const pantry = ids.filter((id) => items[id].cat === 'vorrat').map(row);
  return { groups, pantry };
}

export function ingredientText(ing, amount, items) {
  if (ing.text) return ing.text;
  const it = items[ing.item];
  const n = formatNumber(amount, amount % 1 ? 1 : 0);
  let s;
  if (it.one) s = `${n} ${amount === 1 ? it.one : it.many}`;
  else if (it.unit === 'Dose') s = `${n} ${amount === 1 ? 'Dose' : 'Dosen'} ${it.name}`;
  else if (it.unit === 'Becher' || it.unit === 'EL' || it.unit === 'TL') s = `${n} ${it.unit} ${it.name}`;
  else s = `${formatAmount(amount, it.unit)} ${it.name}`;
  return ing.note ? `${s}, ${ing.note}` : s;
}

// Zutaten so, wie sie gekocht werden: bei „doppelt kochen“ die doppelte Menge.
export function ingredientLines(meal, recipes, items) {
  const portions = meal.cook ?? 1;
  return recipes[meal.id].ingredients.map((ing) => ingredientText(ing, amountOf(ing, meal) * portions, items));
}

export function sideText(meal, recipes, items) {
  const ing = sideOf(recipes[meal.id]);
  return ing && meal.side ? ingredientText({ item: ing.item }, meal.side, items) : null;
}
