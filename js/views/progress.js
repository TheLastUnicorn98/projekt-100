import * as L from '../logic.js';
import { weightChart } from '../chart.js';
import { icon, fmt, kgText, dateShort } from '../ui.js';

const maxISO = (a, b) => (a > b ? a : b);
const round1 = (n) => Math.round(n * 10) / 10;
const kgLabel = (n) => fmt(n, n % 1 ? 1 : 0);

function tiles(ctx, current, hasRecent) {
  const { s, entries, todayISO, planEnd } = ctx;
  const lost = Math.max(0, s.startKg - current);
  const pct = Math.max(0, Math.min(100, (lost / (s.startKg - s.targetKg)) * 100));
  const projected = L.projectDate(entries, s.targetKg, todayISO);
  const bmi = L.bmi(current, s.heightCm);
  const list = [
    ['Aktuell', kgText(round1(current)), hasRecent ? `Schnitt der letzten 7 Tage${bmi ? ` · BMI ${fmt(bmi, 1)}` : ''}` : 'Letzte Messung'],
    ['Abgenommen', `${fmt(lost, 1)} kg`, `${fmt(pct)} % vom Weg`],
    ['Noch bis zum Ziel', `${fmt(Math.max(0, current - s.targetKg), 1)} kg`, `Ziel ${kgLabel(s.targetKg)} kg`],
    projected
      ? ['Am Ziel etwa', dateShort(projected), `Nach deinem Trend. Plan: ${dateShort(planEnd)}`]
      : ['Am Ziel laut Plan', dateShort(planEnd), 'Deine eigene Prognose kommt nach einer Woche Wiegen.'],
  ];
  return list
    .map(([label, value, sub]) => `<div class="card stat"><p class="stat-label">${label}</p><p class="stat-value">${value}</p><p class="stat-sub">${sub}</p></div>`)
    .join('');
}

function chartCard(ctx) {
  const { ui, s, entries, todayISO, planEnd } = ctx;
  const recent = ui.range !== 'all';
  const last = entries[entries.length - 1];
  const from = recent ? maxISO(s.startDate, L.addDays(todayISO, -55)) : s.startDate;
  const to = recent ? todayISO : maxISO(planEnd, last?.date ?? planEnd);
  const hasData = from <= to && entries.some((e) => e.date >= from && e.date <= to);
  const chart = hasData
    ? weightChart({ entries, startISO: s.startDate, startKg: s.startKg, targetKg: s.targetKg, fromISO: from, toISO: to, showGoal: !recent })
    : '<p class="empty">Trag dein Gewicht ein, dann erscheint hier deine Kurve.</p>';
  return `<section class="card chart-card">
  <div class="seg" role="group" aria-label="Zeitraum">
    <button data-action="range" data-range="recent" aria-pressed="${recent}">Letzte 8 Wochen</button>
    <button data-action="range" data-range="all" aria-pressed="${!recent}">Ganzer Weg</button>
  </div>
  ${chart}
  <ul class="legend">
    <li><i class="lg lg-dot"></i>Messung</li><li><i class="lg lg-avg"></i>Schnitt 7 Tage</li><li><i class="lg lg-plan"></i>Plan</li>${recent ? '' : '<li><i class="lg lg-goal"></i>Ziel</li>'}
  </ul>
</section>`;
}

function milestonesCard(ctx, current) {
  const { s, best, streak } = ctx;
  const level = best ?? s.startKg;
  const list = L.milestones(s.startKg, s.targetKg);
  const next = list.find((m) => level > m + 1e-9);
  const chips = list
    .map((m) => `<li class="${level <= m + 1e-9 ? 'is-reached' : m === next ? 'is-next' : ''}">${kgLabel(m)}</li>`)
    .join('');
  const hint =
    next != null
      ? `Nächste Etappe: ${kgLabel(next)} kg. Noch ${fmt(Math.max(0, current - next), 1)} kg.`
      : 'Ziel erreicht. Richtig stark.';
  const streakText = streak
    ? `${fmt(streak)} ${streak === 1 ? 'Tag' : 'Tage'} in Folge alles nach Plan gegessen`
    : 'Hak an einem Tag alle Mahlzeiten ab, dann startet deine Serie.';
  return `<section class="card milestones">
  <h2>Etappen</h2>
  <ol>${chips}</ol>
  <p class="hint">${hint}</p>
  <p class="streak-line">${icon('flamme', 'sm')}${streakText}</p>
</section>`;
}

function weightForm(todayISO) {
  return `<form class="card weight-form" data-form="weight" novalidate>
  <h2>Gewicht eintragen</h2>
  <div class="row">
    <label class="field" for="w-date">Datum<input id="w-date" name="date" type="date" value="${todayISO}" max="${todayISO}" required></label>
    <label class="field" for="w-kg">Gewicht in kg<input id="w-kg" name="kg" type="text" inputmode="decimal" autocomplete="off" placeholder="z. B. 120,4"></label>
  </div>
  <button class="btn primary">Speichern</button>
  <p class="form-error" role="alert"></p>
</form>`;
}

function logCard(ctx) {
  const { entries, ui } = ctx;
  if (!entries.length) return '';
  const items = entries
    .slice(-10)
    .reverse()
    .map((e) => {
      const action =
        ui.confirm === `w:${e.date}`
          ? `<span class="row"><button class="btn danger sm" data-action="weight-delete-yes" data-date="${e.date}">Löschen</button><button class="btn ghost sm" data-action="cancel">Behalten</button></span>`
          : `<button class="icon-btn sm" data-action="weight-delete" data-date="${e.date}" aria-label="Messung vom ${dateShort(e.date)} löschen">${icon('loeschen')}</button>`;
      return `<li><span>${dateShort(e.date)}</span><strong>${kgText(e.kg)}</strong>${action}</li>`;
    })
    .join('');
  return `<section class="card log"><h2>Letzte Messungen</h2><ul>${items}</ul></section>`;
}

export function progressView(ctx) {
  const { s, entries, todayISO, planEnd } = ctx;
  const recentAvg = L.avgOn(entries, todayISO);
  const current = recentAvg ?? entries[entries.length - 1]?.kg ?? s.startKg;
  return `<header class="top">
  <div><p class="eyebrow">Ziel ${kgLabel(s.targetKg)} kg · laut Plan am ${dateShort(planEnd)}</p><h1>Verlauf</h1></div>
  <div class="top-actions"><button class="icon-btn" data-action="settings" aria-label="Einstellungen">${icon('einstellungen')}</button></div>
</header>
<section class="stats">${tiles(ctx, current, recentAvg != null)}</section>
${chartCard(ctx)}
${milestonesCard(ctx, current)}
${weightForm(todayISO)}
${logCard(ctx)}`;
}
