import { RECIPES } from './recipes.js';
import { DEVICES, PROTEINS } from './data.js';
import { mondayOf, toISO } from './logic.js';

// Alles liegt im localStorage dieses Handys. Die Sicherung ist dieselbe Struktur als JSON-Datei.
const KEY = 'projekt100';
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const KIND_OF_SLOT = { fruehstueck: 'fruehstueck', mittag: 'haupt', abend: 'haupt', snack: 'snack', extra: 'snack' };

export function emptyState() {
  return {
    version: 2,
    settings: { startKg: null, targetKg: null, heightCm: null, kcal: 2200, protein: 150, startDate: null, recalcAck: 0 },
    prefs: null,
    weights: [],
    days: {},
    plans: {},
    swipes: {},
    shopping: {},
  };
}

const num = (v, fallback) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const trueKeys = (o) => Object.fromEntries(Object.entries(obj(o)).filter(([, v]) => v === true));
const fitsSlot = (slot, id) => RECIPES[id] && RECIPES[id].slot === KIND_OF_SLOT[slot];

function normalizePrefs(p) {
  if (!p || typeof p !== 'object') return null;
  const devices = (Array.isArray(p.devices) ? p.devices : []).filter((d) => DEVICES[d] && d !== 'frei');
  const proteins = (Array.isArray(p.proteins) ? p.proteins : []).filter((x) => PROTEINS[x]);
  return {
    devices,
    proteins,
    maxTime: [10, 20, 30].includes(p.maxTime) ? p.maxTime : 20,
    freeEvening: p.freeEvening !== false,
  };
}

function normalizeMeal(slot, m) {
  if (!m || !fitsSlot(slot, m.id)) return null;
  const meal = { id: m.id };
  if (Number.isFinite(m.side)) meal.side = m.side;
  if (m.cook === 2) meal.cook = 2;
  if (m.leftover === true) meal.leftover = true;
  if (m.pinned === true) meal.pinned = true;
  return meal;
}

function normalizePlan(p) {
  if (!p || typeof p !== 'object' || !p.days || typeof p.days !== 'object') return null;
  const days = {};
  for (const [iso, day] of Object.entries(p.days)) {
    if (!ISO.test(iso)) continue;
    const clean = {};
    for (const slot of Object.keys(KIND_OF_SLOT)) {
      const meal = normalizeMeal(slot, obj(day)[slot]);
      if (meal) clean[slot] = meal;
    }
    if (clean.fruehstueck && clean.mittag && clean.abend) days[iso] = clean;
  }
  if (!Object.keys(days).length) return null;
  const snacks = (Array.isArray(p.snacks) ? p.snacks : []).filter((id) => RECIPES[id]?.slot === 'snack');
  return { week: ISO.test(p.week) ? p.week : Object.keys(days).sort()[0], kind: p.kind === 'gewischt' ? 'gewischt' : 'standard', snacks, days };
}

// Bringt gespeicherte oder importierte Daten in die aktuelle Form und verwirft, was nicht passt.
export function normalizeState(raw, { today = toISO(new Date()) } = {}) {
  const state = emptyState();
  if (!raw || typeof raw !== 'object') return state;
  const s = obj(raw.settings);
  Object.assign(state.settings, {
    startKg: num(s.startKg, null),
    targetKg: num(s.targetKg, null),
    heightCm: num(s.heightCm, null),
    kcal: num(s.kcal, 2200),
    protein: num(s.protein, 150),
    startDate: ISO.test(s.startDate) ? s.startDate : null,
    recalcAck: num(s.recalcAck, 0),
  });
  state.prefs = normalizePrefs(raw.prefs);
  if (Array.isArray(raw.weights)) {
    state.weights = raw.weights
      .filter((w) => ISO.test(w?.date) && num(w.kg, null) !== null)
      .map(({ date, kg }) => ({ date, kg }));
  }
  for (const [iso, day] of Object.entries(obj(raw.days))) {
    if (!ISO.test(iso) || !day || typeof day !== 'object') continue;
    const entry = { checked: trueKeys(day.checked) };
    const swaps = Object.fromEntries(Object.entries(obj(day.swaps)).filter(([slot, id]) => fitsSlot(slot, id)));
    if (Object.keys(swaps).length) entry.swaps = swaps;
    state.days[iso] = entry;
  }
  for (const [week, plan] of Object.entries(obj(raw.plans))) {
    const clean = ISO.test(week) && normalizePlan(plan);
    if (clean) state.plans[week] = clean;
  }
  for (const [week, sw] of Object.entries(obj(raw.swipes))) {
    if (!ISO.test(week)) continue;
    const order = (Array.isArray(sw?.order) ? sw.order : []).filter((id) => RECIPES[id] && !RECIPES[id].fixed);
    const votes = Object.fromEntries(Object.entries(obj(sw?.votes)).filter(([id, v]) => RECIPES[id] && [-1, 1, 2].includes(v)));
    state.swipes[week] = { order, votes };
  }
  // Version 1 hatte eine einzige Einkaufsliste. Die gilt ab jetzt für die laufende Woche.
  if (raw.shopping?.checked) state.shopping[mondayOf(today)] = { checked: trueKeys(raw.shopping.checked) };
  for (const [week, list] of Object.entries(obj(raw.shopping))) {
    if (ISO.test(week)) state.shopping[week] = { checked: trueKeys(list?.checked) };
  }
  return state;
}

export function isReady(state) {
  const s = state.settings;
  return Number.isFinite(s.startKg) && Number.isFinite(s.targetKg) && Boolean(s.startDate);
}

export function loadState() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(KEY)));
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
