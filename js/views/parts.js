import { RECIPES } from '../recipes.js';
import { ITEMS, SLOTS } from '../data.js';
import * as P from '../planner.js';
import { addDays } from '../logic.js';
import { esc, icon, fmt, weekdayLong, dayMonth } from '../ui.js';

export const slotLabel = (slot) => SLOTS.find((s) => s.id === slot)?.label ?? '';

// Kurzer Hinweis unter dem Gerichtsnamen: Beilagenmenge, Rest von gestern oder doppelt kochen.
export function mealNote(meal) {
  const side = P.sideText(meal, RECIPES, ITEMS);
  if (meal.leftover) return side ? `Rest von gestern, ${side}` : 'Rest von gestern';
  if (meal.cook === 2) return side ? `Doppelt kochen, je Portion ${side}` : 'Doppelt kochen, der Rest ist morgen Mittag';
  return side ? `mit ${side}` : '';
}

export function dayCard(ctx, iso, day, { isToday = false } = {}) {
  const v = P.validateDay(day, P.dayTarget(iso, ctx.planCtx), ctx.planCtx);
  const free = day.abend?.id === 'frei';
  const rows = P.dayMeals(day)
    .map(({ slot, meal }) => {
      const r = RECIPES[meal.id];
      const note = mealNote(meal);
      return `<li><button class="week-row" data-action="open-recipe" data-id="${meal.id}" data-slot="${slot}" data-day="${iso}">
  <span class="week-slot">${slotLabel(slot)}</span>
  <span class="week-name">${icon(r.device, 'sm')}<span>${esc(r.name)}${note ? `<small>${esc(note)}</small>` : ''}</span></span></button></li>`;
    })
    .join('');
  return `<section class="card week-day ${isToday ? 'is-today' : ''}">
  <header><h2>${weekdayLong(iso)}</h2><span class="muted">${dayMonth(iso)}</span>${isToday ? '<span class="chip chip-brand">Heute</span>' : ''}</header>
  <ul>${rows}</ul>
  <p class="week-total ${v.ok || free ? 'is-ok' : ''}">${v.ok || free ? icon('check', 'sm') : ''}${free ? 'ca. ' : ''}${fmt(v.macros.kcal)} kcal · ${fmt(v.macros.protein)} g Eiweiß · ${fmt(v.macros.fiber)} g Ballaststoffe</p>
</section>`;
}

export function missingText(missing) {
  const parts = [];
  if (missing.fruehstueck) parts.push(`${missing.fruehstueck} ${missing.fruehstueck === 1 ? 'Frühstück' : 'Frühstücke'}`);
  if (missing.haupt) parts.push(`${missing.haupt} ${missing.haupt === 1 ? 'Hauptgericht' : 'Hauptgerichte'}`);
  if (missing.snack) parts.push(`${missing.snack} ${missing.snack === 1 ? 'Snack' : 'Snacks'}`);
  if (!parts.length) return '';
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} und ${parts[parts.length - 1]}` : parts[0];
  return `Noch ${list} nach rechts wischen.`;
}

export const weekRange = (monday) => `${dayMonth(monday)} bis ${dayMonth(addDays(monday, 6))}`;

export function planCta(ctx) {
  const swipe = ctx.nextSwipe;
  const voted = swipe.order.filter((id) => id in swipe.votes).length;
  return `<section class="plan-cta">
  <div class="plan-cta-head">${icon('karten')}<p class="eyebrow">Nächste Woche · ${weekRange(ctx.nextMonday)}</p></div>
  <h2>Wisch dir deinen Plan zusammen</h2>
  <p>Rechts, was dir schmeckt, links, was nicht. Daraus baut die App deine Woche mit passenden Portionen.</p>
  <a class="btn big" href="#wischen" data-action="open-swipe" data-target="next">${voted ? `Weiter wischen (${voted} von ${swipe.order.length})` : "Los geht's"}</a>
</section>`;
}
