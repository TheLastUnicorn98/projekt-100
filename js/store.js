import { RECIPES } from './data.js';

// Alles liegt im localStorage dieses Handys. Die Sicherung ist dieselbe Struktur als JSON-Datei.
const KEY = 'projekt100';
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function emptyState() {
  return {
    version: 1,
    settings: { startKg: null, targetKg: null, heightCm: null, kcal: 2200, protein: 150, startDate: null, recalcAck: 0 },
    weights: [],
    days: {},
    shopping: { checked: {} },
  };
}

const num = (v, fallback) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const trueKeys = (obj) => Object.fromEntries(Object.entries(obj ?? {}).filter(([, v]) => v === true));

// Bringt gespeicherte oder importierte Daten in die aktuelle Form und verwirft, was nicht passt.
export function normalizeState(raw) {
  const state = emptyState();
  if (!raw || typeof raw !== 'object') return state;
  const s = raw.settings ?? {};
  Object.assign(state.settings, {
    startKg: num(s.startKg, null),
    targetKg: num(s.targetKg, null),
    heightCm: num(s.heightCm, null),
    kcal: num(s.kcal, 2200),
    protein: num(s.protein, 150),
    startDate: ISO.test(s.startDate) ? s.startDate : null,
    recalcAck: num(s.recalcAck, 0),
  });
  if (Array.isArray(raw.weights)) {
    state.weights = raw.weights
      .filter((w) => ISO.test(w?.date) && num(w.kg, null) !== null)
      .map(({ date, kg }) => ({ date, kg }));
  }
  for (const [iso, day] of Object.entries(raw.days ?? {})) {
    if (!ISO.test(iso) || !day || typeof day !== 'object') continue;
    const swaps = Object.fromEntries(
      Object.entries(day.swaps ?? {}).filter(([slot, id]) => RECIPES[id]?.slot === slot),
    );
    state.days[iso] = { checked: trueKeys(day.checked), swaps };
  }
  state.shopping.checked = trueKeys(raw.shopping?.checked);
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
