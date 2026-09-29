// Reine Rechenfunktionen ohne DOM. Getestet mit `npm test`.

const DAY_MS = 86400000;
const pad = (n) => String(n).padStart(2, '0');

// ---------- Datum: lokale Kalendertage als 'YYYY-MM-DD' ----------

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Gerechnet wird in UTC, damit die Zeitumstellung keine Tage verschluckt.
function toUTC(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUTC(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDays(iso, n) {
  return fromUTC(toUTC(iso) + n * DAY_MS);
}

export function daysBetween(a, b) {
  return Math.round((toUTC(b) - toUTC(a)) / DAY_MS);
}

export function weekday(iso) {
  return new Date(toUTC(iso)).getUTCDay();
}

export function mondayOf(iso) {
  return addDays(iso, -((weekday(iso) + 6) % 7));
}

export function weekDates(iso) {
  const monday = mondayOf(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

// ---------- Serie ----------

// Tage in Folge mit komplett abgehaktem Plan. Ist heute noch offen, zählt die Serie ab gestern.
export function streak(isComplete, todayISO, startISO) {
  if (!startISO) return 0;
  let iso = isComplete(todayISO) ? todayISO : addDays(todayISO, -1);
  let count = 0;
  while (daysBetween(startISO, iso) >= 0 && isComplete(iso)) {
    count += 1;
    iso = addDays(iso, -1);
  }
  return count;
}

// ---------- Plan nach der Reel-Methode ----------
// Waagen-Abnahme = 5/6 Fett, 1 kg Fett = 7.000 kcal, 1.000 kcal Defizit pro Tag,
// nach je 8 Wochen Diät 2 Wochen Pause auf Erhaltungskalorien.

export const PLAN = { fatShare: 5 / 6, kcalPerKg: 7000, deficit: 1000, dietBlock: 56, breakDays: 14 };

export function planSchedule(startKg, targetKg, opts = PLAN) {
  const fatKg = Math.max(0, startKg - targetKg) * opts.fatShare;
  const dietDays = Math.ceil((fatKg * opts.kcalPerKg) / opts.deficit - 1e-9);
  const breaks = dietDays > 0 ? Math.floor((dietDays - 1) / opts.dietBlock) : 0;
  return { dietDays, breaks, totalDays: dietDays + breaks * opts.breakDays };
}

export function phaseOn(startISO, iso, opts = PLAN) {
  const day = daysBetween(startISO, iso);
  if (day < 0) return { phase: 'vorher', week: 0, of: 0 };
  const pos = day % (opts.dietBlock + opts.breakDays);
  if (pos < opts.dietBlock) return { phase: 'diaet', week: Math.floor(pos / 7) + 1, of: opts.dietBlock / 7 };
  return { phase: 'pause', week: Math.floor((pos - opts.dietBlock) / 7) + 1, of: opts.breakDays / 7 };
}

function dietDaysElapsed(day, opts) {
  const cycle = opts.dietBlock + opts.breakDays;
  return Math.floor(day / cycle) * opts.dietBlock + Math.min(day % cycle, opts.dietBlock);
}

// Soll-Gewicht laut Plan: sinkt gleichmäßig an Diät-Tagen, bleibt in den Pausen stehen.
export function planWeightOn(startISO, startKg, targetKg, iso, opts = PLAN) {
  const day = daysBetween(startISO, iso);
  const { dietDays } = planSchedule(startKg, targetKg, opts);
  if (day <= 0 || dietDays === 0) return startKg;
  const done = Math.min(dietDaysElapsed(day, opts), dietDays);
  return startKg - ((startKg - targetKg) * done) / dietDays;
}

// ---------- Gewicht ----------

export function normalizeWeights(entries) {
  const byDate = new Map();
  for (const e of entries ?? []) if (e?.date && Number.isFinite(e.kg)) byDate.set(e.date, e.kg);
  return [...byDate]
    .map(([date, kg]) => ({ date, kg }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function avgOn(entries, iso, windowDays = 7) {
  const from = addDays(iso, -(windowDays - 1));
  const vals = entries.filter((e) => e.date >= from && e.date <= iso).map((e) => e.kg);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

// Lineare Regression über die letzten Wochen: Steigung in kg pro Tag und geglätteter Wert am Stichtag.
export function trend(entries, endISO, lookbackDays = 28) {
  const from = addDays(endISO, -(lookbackDays - 1));
  const pts = entries
    .filter((e) => e.date >= from && e.date <= endISO)
    .map((e) => [daysBetween(endISO, e.date), e.kg])
    .sort((a, b) => a[0] - b[0]);
  if (pts.length < 3 || pts[pts.length - 1][0] - pts[0][0] < 7) return null;
  const n = pts.length;
  const mx = pts.reduce((s, [x]) => s + x, 0) / n;
  const my = pts.reduce((s, [, y]) => s + y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const [x, y] of pts) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
  }
  const slope = sxy / sxx;
  return { slope, value: my - slope * mx };
}

export function projectDate(entries, targetKg, endISO) {
  const t = trend(entries, endISO);
  if (!t || t.slope > -0.005) return null; // unter 35 g pro Woche ist jede Prognose Unsinn
  if (t.value <= targetKg) return endISO;
  return addDays(endISO, Math.round((t.value - targetKg) / -t.slope));
}

export function milestones(startKg, targetKg, step = 5) {
  const list = [];
  for (let m = Math.floor((startKg - 1e-9) / step) * step; m > targetKg; m -= step) list.push(m);
  list.push(targetKg);
  return list;
}

// Bester 7-Tage-Schnitt bisher: Erreichte Etappen bleiben erreicht, auch wenn die Waage mal hochgeht.
export function bestAverage(entries) {
  let best = null;
  for (const e of entries) {
    const a = avgOn(entries, e.date);
    if (best === null || a < best) best = a;
  }
  return best;
}

// Alle 10 kg sinkt der Verbrauch spürbar, dann soll das Kalorienziel neu gerechnet werden.
export function recalcSteps(startKg, bestAvg) {
  if (bestAvg == null) return 0;
  return Math.max(0, Math.floor((startKg - bestAvg) / 10 + 1e-9));
}

export function bmi(kg, heightCm) {
  return heightCm ? kg / (heightCm / 100) ** 2 : null;
}

// ---------- Formatierung ----------

const formatters = new Map();

export function formatNumber(n, decimals = 0) {
  if (!formatters.has(decimals)) {
    formatters.set(
      decimals,
      new Intl.NumberFormat('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    );
  }
  return formatters.get(decimals).format(n);
}

const upToOneDecimal = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });

export function formatAmount(amount, unit) {
  if (unit === 'g' && amount >= 1000) return `${upToOneDecimal.format(amount / 1000)} kg`;
  if (unit === 'ml' && amount >= 1000) return `${upToOneDecimal.format(amount / 1000)} l`;
  if (unit === 'Dose') return `${formatNumber(amount)} ${amount === 1 ? 'Dose' : 'Dosen'}`;
  if (unit === 'Scheibe') return `${formatNumber(amount)} ${amount === 1 ? 'Scheibe' : 'Scheiben'}`;
  return unit ? `${formatNumber(amount)} ${unit}` : '';
}
