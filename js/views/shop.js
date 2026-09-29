import { RECIPES } from '../recipes.js';
import { ITEMS, CATEGORIES } from '../data.js';
import * as L from '../logic.js';
import * as P from '../planner.js';
import { esc, icon, fmt } from '../ui.js';
import { weekRange } from './parts.js';

function row(r, checked, suffix = '') {
  const done = Boolean(checked[r.id]);
  const amount = r.showAmount ? `${L.formatAmount(r.amount, r.unit)}${suffix}` : '';
  return `<li><button class="shop-row ${done ? 'is-done' : ''}" data-action="shop-toggle" data-id="${r.id}" aria-pressed="${done}">
  <span class="box">${icon('check')}</span><span class="shop-name">${esc(r.name)}</span><span class="shop-amt">${amount}</span></button></li>`;
}

export function shopView(ctx) {
  const { state, ui, thisMonday, nextMonday } = ctx;
  const hasNext = Boolean(state.plans[nextMonday]);
  const next = hasNext && ui.shopSel === 'next';
  const monday = next ? nextMonday : thisMonday;
  const checked = state.shopping[monday]?.checked ?? {};
  const { groups, pantry } = P.shoppingForPlan(ctx.weekPlan(monday), RECIPES, ITEMS, CATEGORIES);
  const all = groups.flatMap((g) => g.rows);
  const done = all.filter((r) => checked[r.id]).length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const seg = hasNext
    ? `<div class="seg" role="group" aria-label="Woche">
  <button data-action="shop-sel" data-sel="this" aria-pressed="${!next}">Diese Woche</button>
  <button data-action="shop-sel" data-sel="next" aria-pressed="${next}">Nächste Woche</button>
</div>`
    : '';
  const reset =
    ui.confirm === 'shop-reset'
      ? `<p>Alle Häkchen dieser Liste entfernen?</p><div class="row"><button class="btn danger" data-action="shop-reset-yes">Ja, Liste leeren</button><button class="btn ghost" data-action="cancel">Abbrechen</button></div>`
      : `<button class="btn ghost" data-action="shop-reset">Häkchen entfernen</button>`;
  return `<header class="top"><div><p class="eyebrow">${weekRange(monday)}</p><h1>Einkaufsliste</h1></div></header>
${seg}
<div class="progress" role="status">
  <div class="progress-bar"><i style="width:${pct}%"></i></div>
  <p>${done === all.length ? 'Alles im Wagen.' : `${fmt(done)} von ${fmt(all.length)} im Wagen`}</p>
</div>
${groups.map((g) => `<section class="shop-group"><h2>${g.label}</h2><ul>${g.rows.map((r) => row(r, checked)).join('')}</ul></section>`).join('')}
<section class="shop-group"><h2>Zuhause prüfen</h2><ul>${pantry.map((r) => row(r, checked, ' diese Woche')).join('')}</ul></section>
<aside class="card tip">
  <h2>Am Einkaufstag</h2>
  <p>Alles Fleisch, das du nicht in den nächsten 2 Tagen isst, gleich portionsweise einfrieren. Abends die Portion für den nächsten Tag in den Kühlschrank legen.</p>
</aside>
<div class="actions">${reset}</div>`;
}
