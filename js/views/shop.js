import { RECIPES, ITEMS, CATEGORIES, WEEK_PLAN } from '../data.js';
import * as L from '../logic.js';
import { esc, icon, fmt } from '../ui.js';

function row(r, checked, suffix = '') {
  const done = Boolean(checked[r.id]);
  const amount = r.showAmount ? `${L.formatAmount(r.amount, r.unit)}${suffix}` : '';
  return `<li><button class="shop-row ${done ? 'is-done' : ''}" data-action="shop-toggle" data-id="${r.id}" aria-pressed="${done}">
  <span class="box">${icon('check')}</span><span class="shop-name">${esc(r.name)}</span><span class="shop-amt">${amount}</span></button></li>`;
}

export function shopView(ctx) {
  const { state, ui } = ctx;
  const checked = state.shopping.checked;
  const { groups, pantry } = L.shoppingList(WEEK_PLAN, RECIPES, ITEMS, CATEGORIES);
  const all = groups.flatMap((g) => g.rows);
  const done = all.filter((r) => checked[r.id]).length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const reset =
    ui.confirm === 'shop-reset'
      ? `<p>Alle Häkchen entfernen?</p><div class="row"><button class="btn danger" data-action="shop-reset-yes">Ja, Liste leeren</button><button class="btn ghost" data-action="cancel">Abbrechen</button></div>`
      : `<button class="btn ghost" data-action="shop-reset">Neue Woche: Liste leeren</button>`;
  return `<header class="top"><div><p class="eyebrow">Eine Woche nach Plan</p><h1>Einkaufsliste</h1></div></header>
<div class="progress" role="status">
  <div class="progress-bar"><i style="width:${pct}%"></i></div>
  <p>${done === all.length ? 'Alles im Wagen.' : `${fmt(done)} von ${fmt(all.length)} im Wagen`}</p>
</div>
${groups.map((g) => `<section class="shop-group"><h2>${g.label}</h2><ul>${g.rows.map((r) => row(r, checked)).join('')}</ul></section>`).join('')}
<section class="shop-group"><h2>Zuhause prüfen</h2><ul>${pantry.map((r) => row(r, checked, ' diese Woche')).join('')}</ul></section>
<aside class="card tip">
  <h2>Am Einkaufstag</h2>
  <p>Alles Fleisch, das du nicht in den nächsten 2 Tagen isst, gleich portionsweise einfrieren. Die Hähnchenbrust fürs Mittagessen direkt in 2-cm-Würfel schneiden und in 150-g-Beutel packen. Abends die Portion für den nächsten Tag in den Kühlschrank legen.</p>
</aside>
<div class="actions">${reset}</div>`;
}
