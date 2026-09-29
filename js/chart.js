import { addDays, daysBetween, avgOn, planWeightOn, formatNumber } from './logic.js';

const W = 340;
const H = 200;
const PAD = { l: 34, r: 12, t: 14, b: 24 };
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const round2 = (v) => Math.round(v * 100) / 100;

// Achse mit runden Schritten (1, 2, 2,5, 5 × 10^n), die den Bereich ganz abdeckt.
export function niceScale(lo, hi, count = 4) {
  let min = Math.min(lo, hi);
  let max = Math.max(lo, hi);
  if (max - min < 1) {
    const mid = (min + max) / 2;
    min = mid - 1;
    max = mid + 1;
  }
  const raw = (max - min) / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw - 1e-9);
  const smin = Math.floor(min / step + 1e-9) * step;
  const smax = Math.ceil(max / step - 1e-9) * step;
  const ticks = [];
  for (let v = smin; v <= smax + 1e-9; v += step) ticks.push(round2(v));
  return { min: round2(smin), max: round2(smax), step: round2(step), ticks };
}

function xLabels(fromISO, span) {
  const labels = [];
  if (span <= 70) {
    for (let d = 0; d <= span; d += 7) {
      const [, m, day] = addDays(fromISO, d).split('-');
      labels.push([d, `${Number(day)}.${Number(m)}.`]);
    }
  } else {
    for (let d = 0; d <= span; d += 1) {
      const iso = addDays(fromISO, d);
      if (iso.endsWith('-01')) labels.push([d, MONTHS[Number(iso.slice(5, 7)) - 1]]);
    }
  }
  const every = Math.ceil(labels.length / 6);
  return labels.filter((_, i) => i % every === 0);
}

// Gewichtskurve als SVG-Text: Messpunkte, 7-Tage-Schnitt, Plan-Linie und auf Wunsch das Ziel.
export function weightChart({ entries, startISO, startKg, targetKg, fromISO, toISO, showGoal }) {
  const span = Math.max(1, daysBetween(fromISO, toISO));
  const inRange = entries.filter((e) => e.date >= fromISO && e.date <= toISO);
  const every = Math.max(1, Math.ceil(span / 140));
  const plan = [];
  for (let d = 0; d <= span; d += every) plan.push([d, planWeightOn(startISO, startKg, targetKg, addDays(fromISO, d))]);
  if (plan[plan.length - 1][0] !== span) plan.push([span, planWeightOn(startISO, startKg, targetKg, toISO)]);
  const avg = inRange.map((e) => [daysBetween(fromISO, e.date), avgOn(entries, e.date)]);

  const values = [...inRange.map((e) => e.kg), ...plan.map(([, v]) => v), ...(showGoal ? [targetKg] : [])];
  const scale = niceScale(Math.min(...values) - 0.3, Math.max(...values) + 0.3, showGoal ? 5 : 4);
  const x = (d) => PAD.l + (d / span) * (W - PAD.l - PAD.r);
  const y = (v) => PAD.t + ((scale.max - v) / (scale.max - scale.min)) * (H - PAD.t - PAD.b);
  const line = (list) => list.map(([d, v]) => `${x(d).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const dec = scale.step < 1 ? 1 : 0;
  const last = inRange[inRange.length - 1];

  const grid = scale.ticks
    .map((t) => `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>`)
    .join('');
  const yLab = scale.ticks
    .map((t) => `<text x="${PAD.l - 6}" y="${(y(t) + 3.5).toFixed(1)}" text-anchor="end">${formatNumber(t, dec)}</text>`)
    .join('');
  const xLab = xLabels(fromISO, span)
    .map(([d, text]) => `<text x="${x(d).toFixed(1)}" y="${H - 6}" text-anchor="middle">${text}</text>`)
    .join('');
  const goal = showGoal
    ? `<line class="c-goal" x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(targetKg).toFixed(1)}" y2="${y(targetKg).toFixed(1)}"/>` +
      `<text class="c-goal-lab" x="${W - PAD.r}" y="${(y(targetKg) - 5).toFixed(1)}" text-anchor="end">Ziel ${formatNumber(targetKg, targetKg % 1 ? 1 : 0)} kg</text>`
    : '';
  const dots = inRange
    .map((e) => `<circle cx="${x(daysBetween(fromISO, e.date)).toFixed(1)}" cy="${y(e.kg).toFixed(1)}" r="2.2"/>`)
    .join('');
  const lastDot = last
    ? `<circle class="c-last" cx="${x(daysBetween(fromISO, last.date)).toFixed(1)}" cy="${y(last.kg).toFixed(1)}" r="4.5"/>`
    : '';

  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gewichtsverlauf mit Plan-Linie">
<g class="c-grid">${grid}</g><g class="c-lab">${yLab}${xLab}</g>${goal}
<polyline class="c-plan" points="${line(plan)}"/>
${avg.length > 1 ? `<polyline class="c-avg" pathLength="1" points="${line(avg)}"/>` : ''}
<g class="c-dots">${dots}</g>${lastDot}
</svg>`;
}
