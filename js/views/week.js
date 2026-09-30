import { weekDates } from '../logic.js';
import { icon } from '../ui.js';
import { dayCard, planCta, weekRange } from './parts.js';

const AIRFRYER_TIMES = [
  ['Kartoffelwürfel', '25 Min'],
  ['Hähnchenschenkel', '20 Min'],
  ['Hähnchenbrust', '18 Min'],
  ['Fisch aus der Truhe', '15 Min'],
  ['Schweinelachs', '12–15 Min'],
  ['Hüftsteak', '8–10 Min'],
  ['TK-Gemüse', '10 Min'],
];

export function weekView(ctx) {
  const { ui, state, thisMonday, nextMonday, todayISO } = ctx;
  const next = ui.weekSel === 'next';
  const monday = next ? nextMonday : thisMonday;
  const hasNext = Boolean(state.plans[nextMonday]);
  const plan = next && !hasNext ? null : ctx.weekPlan(monday);
  const seg = `<div class="seg" role="group" aria-label="Woche">
  <button data-action="week-sel" data-sel="this" aria-pressed="${!next}">Diese Woche</button>
  <button data-action="week-sel" data-sel="next" aria-pressed="${next}">Nächste Woche</button>
</div>`;
  const teaser =
    !next && !hasNext
      ? `<a class="banner banner-brand banner-link" href="#wischen" data-action="open-swipe" data-target="next"><p>${icon('karten')}<strong>Nächste Woche planen.</strong> Gerichte wischen wie bei Tinder, die App rechnet die Portionen.</p></a>`
      : '';
  const batchTip =
    plan?.kind === 'gewischt'
      ? `<aside class="card tip"><h2>Einmal kochen, zweimal essen</h2><p>Abends die doppelte Menge kochen, die zweite Portion gleich in eine Dose, abkühlen lassen und in den Kühlschrank. Mittags nur aufwärmen, bis es richtig heiß ist.</p></aside>`
      : '';
  const days = plan ? weekDates(monday).map((iso) => dayCard(ctx, iso, plan.days[iso], { isToday: iso === todayISO })).join('') : planCta(ctx);
  const again = next && hasNext ? `<a class="link" href="#wischen" data-action="open-swipe" data-target="next">Nochmal wischen und neu planen</a>` : '';
  const times = AIRFRYER_TIMES.map(([what, time]) => `<li><span>${what}</span><span>${time}</span></li>`).join('');
  return `<header class="top"><div><p class="eyebrow">${weekRange(monday)}</p><h1>Wochenplan</h1></div></header>
${seg}
${teaser}
${again}
${batchTip}
${days}
<section class="card cheat" aria-label="Airfryer-Zeiten">
  <h2>${icon('airfryer', 'sm')}Airfryer bei 200 °C</h2>
  <ul>${times}</ul>
  <p class="hint">Was am längsten braucht, kommt zuerst rein. Hähnchen muss innen durch sein.</p>
</section>`;
}
