import { RECIPES, ITEMS, SLOTS, WEEK_PLAN } from '../data.js';
import * as L from '../logic.js';
import { esc, icon, fmt, dayMonth, weekdayLong } from '../ui.js';

const AIRFRYER_TIMES = [
  ['Kartoffelwürfel', '25 Min'],
  ['Hähnchenschenkel', '20 Min'],
  ['Hähnchenbrust', '18 Min'],
  ['Schweinelachs', '12–15 Min'],
  ['Hüftsteak', '8–10 Min'],
  ['TK-Gemüse', '10 Min'],
];

export function weekView(ctx) {
  const { state, todayISO } = ctx;
  const dates = L.weekDates(todayISO);
  const days = dates
    .map((d) => {
      const plan = L.planFor(d, state.days[d], WEEK_PLAN);
      const ids = SLOTS.map(({ id }) => plan[id]).filter(Boolean);
      const total = L.sumMacros(ids.map((id) => L.recipeMacros(RECIPES[id], ITEMS)));
      const rows = SLOTS.filter(({ id }) => plan[id])
        .map(({ id: slot, label }) => {
          const r = RECIPES[plan[slot]];
          return `<li><button class="week-row" data-action="open-recipe" data-id="${plan[slot]}" data-slot="${slot}">
  <span class="week-slot">${label}</span><span class="week-name">${icon(r.device, 'sm')}${esc(r.name)}</span></button></li>`;
        })
        .join('');
      const today = d === todayISO;
      return `<section class="card week-day ${today ? 'is-today' : ''}">
  <header><h2>${weekdayLong(d)}</h2><span class="muted">${dayMonth(d)}</span>${today ? '<span class="chip chip-brand">Heute</span>' : ''}</header>
  <ul>${rows}</ul>
  <p class="week-total">${fmt(total.kcal)} kcal · ${fmt(total.protein)} g Eiweiß</p>
</section>`;
    })
    .join('');
  const times = AIRFRYER_TIMES.map(([what, time]) => `<li><span>${what}</span><span>${time}</span></li>`).join('');
  return `<header class="top"><div><p class="eyebrow">${dayMonth(dates[0])} bis ${dayMonth(dates[6])}</p><h1>Wochenplan</h1></div></header>
<section class="card cheat" aria-label="Airfryer-Zeiten">
  <h2>${icon('airfryer', 'sm')}Airfryer bei 200 °C</h2>
  <ul>${times}</ul>
  <p class="hint">Was am längsten braucht, kommt zuerst rein. Hähnchen muss innen durch sein.</p>
</section>
${days}`;
}
