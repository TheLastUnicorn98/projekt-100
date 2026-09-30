import { RECIPES } from '../recipes.js';
import { ITEMS, DEVICES, KINDS } from '../data.js';
import { weekDates, weekday } from '../logic.js';
import * as P from '../planner.js';
import { esc, icon, fmt, dayMonth, weekdayShort } from '../ui.js';
import { dayCard, missingText, weekRange } from './parts.js';

const timeText = (r) => (r.time <= 1 ? 'sofort fertig' : `${r.time} Min Arbeit`);

function card(id, top) {
  const r = RECIPES[id];
  const m = P.mealMacros(P.defaultMeal(id, RECIPES), RECIPES, ITEMS);
  return `<article class="card-swipe ${top ? 'is-top' : 'is-under'}" data-id="${id}" ${top ? '' : 'aria-hidden="true"'}>
  <div class="card-photo card-${r.slot}">${icon(r.device, 'card-device')}<img src="img/${id}.webp" alt="" draggable="false" onerror="this.remove()"></div>
  <span class="card-kind">${KINDS[r.slot]}</span>${r.region === 'schwaebisch' ? '<span class="card-region">Schwäbisch</span>' : ''}
  <span class="stamp stamp-like" aria-hidden="true">Lecker</span>
  <span class="stamp stamp-nope" aria-hidden="true">Nö</span>
  <span class="stamp stamp-super" aria-hidden="true">Unbedingt</span>
  <div class="card-info">
    <h2>${esc(r.name)}</h2>
    <p class="card-meta">${icon(r.device, 'sm')}${DEVICES[r.device]} · ${timeText(r)}</p>
    <ul class="card-macros">
      <li><strong>${fmt(m.kcal)}</strong>kcal</li>
      <li><strong>${fmt(m.protein)} g</strong>Eiweiß</li>
      <li><strong>${fmt(m.fat)} g</strong>Fett</li>
      <li><strong>${fmt(m.carbs)} g</strong>Kohlenh.</li>
    </ul>
  </div>
</article>`;
}

function counter(counts, kind, label) {
  const n = counts[kind];
  const min = P.MIN_LIKES[kind];
  return `<span class="count ${n >= min ? 'is-done' : ''}">${n >= min ? icon('check', 'sm') : ''}${label} ${n}/${min}</span>`;
}

export function swipeView(ctx) {
  const { swipe, ui } = ctx;
  const remaining = swipe.order.filter((id) => !(id in swipe.votes));
  const counts = P.likeCounts(swipe.votes, RECIPES);
  const missing = Object.fromEntries(
    Object.entries(P.MIN_LIKES).filter(([k, min]) => counts[k] < min).map(([k, min]) => [k, min - counts[k]]),
  );
  const ready = !Object.keys(missing).length;
  const deck = remaining.length
    ? `${remaining[1] ? card(remaining[1], false) : ''}${card(remaining[0], true)}`
    : `<div class="deck-empty">${icon('karten')}<p><strong>Alle Gerichte gewischt.</strong></p><p class="muted">${ready ? 'Jetzt deinen Plan erstellen.' : 'Mische die Nö-Karten nochmal rein, damit genug zusammenkommt.'}</p>${ready ? '' : '<button class="btn" data-action="swipe-reshuffle">Nö-Karten nochmal zeigen</button>'}</div>`;
  const rest = ctx.swipeTarget === 'rest';
  const canRest = weekday(ctx.todayISO) !== 0;
  const eyebrow = rest
    ? `Rest dieser Woche · ab ${weekdayShort(ctx.tomorrow)} ${dayMonth(ctx.tomorrow)}`
    : `Nächste Woche · ${weekRange(ctx.nextMonday)}`;
  return `<header class="swipe-top">
  <a class="icon-btn" href="#woche" aria-label="Zurück zum Wochenplan">${icon('zurueck')}</a>
  <div><p class="eyebrow">${eyebrow}</p><h1>Gerichte wischen</h1></div>
</header>
<div class="seg" role="group" aria-label="Was planen?">
  <button data-action="swipe-target" data-target="rest" aria-pressed="${rest}" ${canRest ? '' : 'disabled'}>Rest dieser Woche</button>
  <button data-action="swipe-target" data-target="next" aria-pressed="${!rest}">Nächste Woche</button>
</div>
<div class="counts">${counter(counts, 'fruehstueck', 'Frühstück')}${counter(counts, 'haupt', 'Hauptgerichte')}${counter(counts, 'snack', 'Snacks')}<span class="count">${remaining.length} übrig</span></div>
<div class="deck" aria-live="polite">${deck}</div>
<div class="swipe-actions">
  <button class="swipe-btn undo" data-action="swipe-undo" aria-label="Letzte Karte zurückholen" ${ui.swipeHistory.length ? '' : 'disabled'}>${icon('undo')}</button>
  <button class="swipe-btn nope" data-action="vote" data-vote="-1" aria-label="Nicht diese Woche" ${remaining.length ? '' : 'disabled'}>${icon('close')}</button>
  <button class="swipe-btn super" data-action="vote" data-vote="2" aria-label="Unbedingt diese Woche" ${remaining.length ? '' : 'disabled'}>${icon('stern')}</button>
  <button class="swipe-btn like" data-action="vote" data-vote="1" aria-label="Will ich" ${remaining.length ? '' : 'disabled'}>${icon('herz')}</button>
</div>
<button class="btn primary big" data-action="build-plan" ${ready ? '' : 'disabled'}>Plan erstellen</button>
<p class="hint center">${ready ? 'Du kannst weiterwischen oder jetzt den Plan erstellen.' : missingText(missing)} Karte antippen zeigt die Zutaten.</p>`;
}

export function previewView(ctx) {
  const plan = ctx.ui.preview;
  if (!plan) {
    return `<header class="swipe-top"><a class="icon-btn" href="#wischen" aria-label="Zurück">${icon('zurueck')}</a><div><h1>Kein Plan</h1></div></header>
<p class="muted">Wisch zuerst ein paar Gerichte, dann erstellt die App deinen Plan.</p><a class="btn primary" href="#wischen">Zum Wischen</a>`;
  }
  const from = ctx.ui.previewFrom;
  const days = weekDates(plan.week)
    .filter((iso) => !from || iso >= from)
    .map((iso) => dayCard(ctx, iso, plan.days[iso]))
    .join('');
  const eyebrow = from ? `Rest dieser Woche · ab ${weekdayShort(from)} ${dayMonth(from)}` : weekRange(plan.week);
  return `<header class="swipe-top">
  <a class="icon-btn" href="#wischen" aria-label="Zurück zum Wischen">${icon('zurueck')}</a>
  <div><p class="eyebrow">${eyebrow}</p><h1>${from ? 'Neuer Plan bis Sonntag' : 'Dein Plan'}</h1></div>
</header>
<p class="lead">Jeder Tag trifft dein Ziel. Abends kochst du doppelt, mittags gibt es den Rest. Tippe ein Gericht an, um es zu tauschen.</p>
<div class="plan-actions">
  <button class="btn primary big" data-action="accept-plan">Plan übernehmen</button>
  <button class="btn" data-action="reshuffle-plan">Neu mischen</button>
</div>
${days}`;
}
