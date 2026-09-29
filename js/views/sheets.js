import { RECIPES } from '../recipes.js';
import { ITEMS, DEVICES, PROTEINS, KINDS } from '../data.js';
import * as P from '../planner.js';
import { esc, icon, fmt } from '../ui.js';
import { mealNote, slotLabel } from './parts.js';

const KIND_OF_SLOT = { fruehstueck: 'fruehstueck', mittag: 'haupt', abend: 'haupt', snack: 'snack', extra: 'snack' };

function head(eyebrow, title) {
  return `<div class="sheet-head">
  <div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h2 id="sheet-title">${title}</h2></div>
  <button class="icon-btn" data-action="close-sheet" aria-label="Schließen">${icon('close')}</button>
</div>`;
}

function swapList(ctx, id, slot, week) {
  const kind = KIND_OF_SLOT[slot];
  const votes = ctx.state.swipes[week]?.votes ?? {};
  const options = Object.keys(RECIPES)
    .filter((rid) => rid !== id && RECIPES[rid].slot === kind && (P.allowed(RECIPES[rid], ctx.prefs) || (rid === 'frei' && slot === 'abend')))
    .sort((a, b) => (votes[b] ?? 0) - (votes[a] ?? 0));
  return options
    .map((rid) => {
      const o = RECIPES[rid];
      const liked = (votes[rid] ?? 0) > 0;
      return `<li><button class="swap" data-action="swap" data-id="${rid}">${icon(o.device, 'sm')}<span>${esc(o.name)}</span>${liked ? `<span class="swap-liked">${icon('herz', 'sm')}</span>` : ''}</button></li>`;
    })
    .join('');
}

export function recipeSheet(ctx) {
  const { id, slot, day, readOnly } = ctx.ui.sheet;
  const r = RECIPES[id];
  const meal = day && slot ? ctx.dayPlan(day)?.[slot] ?? P.defaultMeal(id, RECIPES) : P.defaultMeal(id, RECIPES);
  const m = P.mealMacros(meal, RECIPES, ITEMS);
  const approx = r.fixed ? 'ca. ' : '';
  const note = day ? mealNote(meal) : '';
  const lines = P.ingredientLines(meal, RECIPES, ITEMS);
  const steps = meal.leftover ? ['Den Rest von gestern aufwärmen, bis er überall richtig heiß ist.'] : r.steps;
  const cookHint =
    meal.cook === 2
      ? `<p class="tip-line">Heute die doppelte Menge kochen. Die zweite Portion ist morgen dein Mittagessen: gleich in eine Dose, abkühlen lassen, ab in den Kühlschrank.</p>`
      : '';
  const eyebrow = [day ? slotLabel(slot) : KINDS[r.slot], DEVICES[r.device], r.time > 1 ? `${r.time} Min Arbeit` : ''].filter(Boolean).join(' · ');
  const swaps = day && slot && !readOnly ? swapList(ctx, id, slot, ctx.mondayOf(day)) : '';
  return `${head(eyebrow, esc(r.name))}
${r.fixed ? '' : `<div class="sheet-photo card-${r.slot}">${icon(r.device, 'card-device')}<img src="img/${id}.webp" alt="" onerror="this.remove()"></div>`}
${note ? `<p class="meal-note">${esc(note)}</p>` : ''}
<dl class="macros">
  <div><dt>Kalorien</dt><dd>${approx}${fmt(m.kcal)}</dd></div>
  <div><dt>Eiweiß</dt><dd>${fmt(m.protein)} g</dd></div>
  <div><dt>Fett</dt><dd>${fmt(m.fat)} g</dd></div>
  <div><dt>Kohlenh.</dt><dd>${fmt(m.carbs)} g</dd></div>
</dl>
<p class="hint">Werte für eine Portion.</p>
${cookHint}
${lines.length ? `<h3>Zutaten${meal.cook === 2 ? ' für 2 Portionen' : ''}</h3><ul class="ingredients">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
<h3>So geht's</h3>
<ol class="steps">${steps.map((st) => `<li>${esc(st)}</li>`).join('')}</ol>
${r.tip && !meal.leftover ? `<p class="tip-line">${esc(r.tip)}</p>` : ''}
${swaps ? `<h3>Tauschen gegen</h3><p class="hint">Die Portionen des Tages rechnet die App danach neu, damit die Werte wieder passen.</p><ul class="swaps">${swaps}</ul>` : ''}`;
}

// Auswahl der Vorlieben: beim ersten Start als eigene Seite, später in den Einstellungen.
export function prefsFields(prefs) {
  const chip = (group, value, label, on, extra = '') =>
    `<button type="button" class="chip-toggle" data-action="pref-toggle" data-group="${group}" data-value="${value}" aria-pressed="${on}">${extra}${label}</button>`;
  const devices = Object.entries(DEVICES)
    .filter(([k]) => k !== 'frei')
    .map(([k, label]) => chip('devices', k, label, prefs.devices.includes(k), icon(k, 'sm')))
    .join('');
  const proteins = Object.entries(PROTEINS).map(([k, label]) => chip('proteins', k, label, prefs.proteins.includes(k))).join('');
  const times = [10, 20, 30].map((t) => chip('maxTime', t, `${t} Min`, prefs.maxTime === t)).join('');
  return `<fieldset class="chips"><legend>Damit kochst du</legend>${devices}</fieldset>
<fieldset class="chips"><legend>Das isst du</legend>${proteins}</fieldset>
<fieldset class="chips"><legend>So lange darf die Arbeit höchstens dauern</legend>${times}</fieldset>
<fieldset class="chips"><legend>Freier Abend</legend>${chip('freeEvening', 'toggle', 'Samstagabend Burger oder Pizza', prefs.freeEvening)}</fieldset>`;
}

export function prefsView(prefs, deckSize) {
  return `<main class="onboard">
  <p class="eyebrow">Projekt 100 · Schritt 2 von 2</p>
  <h1>Was passt zu dir?</h1>
  <p class="lead">Danach zeigt dir die App nur Gerichte, die du wirklich kochen willst. Du kannst das später in den Einstellungen ändern.</p>
  ${prefsFields(prefs)}
  <p class="hint">${fmt(deckSize)} Gerichte passen zu deiner Auswahl.</p>
  <button class="btn primary big" data-action="prefs-save" ${deckSize >= 12 ? '' : 'disabled'}>Weiter</button>
  ${deckSize >= 12 ? '' : '<p class="form-error">Mit dieser Auswahl bleiben zu wenige Gerichte übrig. Wähle noch etwas dazu.</p>'}
</main>`;
}

function field(id, label, value, attrs = '') {
  return `<label class="field" for="${id}">${label}<input id="${id}" name="${id.slice(2)}" value="${value ?? ''}" ${attrs}></label>`;
}

export function settingsSheet(ctx) {
  const { s, ui } = ctx;
  const reset =
    ui.confirm === 'reset-all'
      ? `<p>Wirklich alles löschen? Gewichte, Häkchen, Pläne und Einstellungen sind danach weg.</p><div class="row"><button class="btn danger" data-action="reset-all-yes">Ja, alles löschen</button><button class="btn ghost" data-action="cancel">Abbrechen</button></div>`
      : `<button class="btn ghost danger-text" data-action="reset-all">${icon('loeschen', 'sm')}Alle Daten löschen</button>`;
  const dec = 'type="text" inputmode="decimal" autocomplete="off"';
  const int = 'type="text" inputmode="numeric" autocomplete="off"';
  return `${head('', 'Einstellungen')}
<form class="form" data-form="settings" novalidate>
  <div class="row">${field('s-startKg', 'Startgewicht (kg)', fmt(s.startKg, 2), dec)}${field('s-startDate', 'Start am', s.startDate, 'type="date" required')}</div>
  <div class="row">${field('s-targetKg', 'Zielgewicht (kg)', fmt(s.targetKg, s.targetKg % 1 ? 1 : 0), dec)}${field('s-heightCm', 'Größe (cm)', s.heightCm ?? '', int)}</div>
  <div class="row">${field('s-kcal', 'Kalorien pro Tag', s.kcal, int)}${field('s-protein', 'Eiweiß pro Tag (g)', s.protein, int)}</div>
  <button class="btn primary">Speichern</button>
  <p class="form-error" role="alert"></p>
</form>
<h3>Vorlieben</h3>
${prefsFields(ctx.prefs)}
<h3>Sicherung</h3>
<p class="muted">Deine Daten liegen nur auf diesem Handy. Speichere ab und zu eine Sicherung, zum Beispiel vor einem Handywechsel.</p>
<div class="row">
  <button class="btn" data-action="export">${icon('sichern', 'sm')}Sicherung speichern</button>
  <button class="btn" data-action="import">${icon('laden', 'sm')}Sicherung laden</button>
</div>
<input type="file" id="import-file" accept="application/json,.json" hidden>
${ui.installEvent ? `<h3>App</h3><button class="btn primary" data-action="install">${icon('installieren', 'sm')}Auf dem Startbildschirm installieren</button>` : ''}
<h3>Zurücksetzen</h3>
${reset}
<p class="fineprint">Projekt 100 · Nährwerte sind Durchschnittswerte gängiger Produkte. Fotos mit Z-Image-Turbo erzeugt. Schriften: Bricolage Grotesque und Figtree (SIL Open Font License).</p>`;
}

export function onboardingView(todayISO) {
  const dec = 'type="text" inputmode="decimal" autocomplete="off"';
  const int = 'type="text" inputmode="numeric" autocomplete="off"';
  return `<main class="onboard">
  <img class="onboard-mark" src="icons/icon-192.png" alt="" width="72" height="72">
  <p class="eyebrow">Projekt 100 · Schritt 1 von 2</p>
  <h1>Richte deinen Plan ein</h1>
  <p class="lead">Ein paar Zahlen, dann geht's los. Sie bleiben nur auf diesem Handy.</p>
  <form class="form" data-form="onboarding" novalidate>
    ${field('o-startKg', 'Startgewicht in kg', '', `${dec} placeholder="z. B. 120,5"`)}
    ${field('o-targetKg', 'Zielgewicht in kg', '', `${dec} placeholder="z. B. 90"`)}
    ${field('o-heightCm', 'Größe in cm (freiwillig)', '', `${int} placeholder="z. B. 180"`)}
    ${field('o-startDate', 'Start am', todayISO, 'type="date" required')}
    <div class="row">${field('o-kcal', 'Kalorien pro Tag', 2200, int)}${field('o-protein', 'Eiweiß pro Tag (g)', 150, int)}</div>
    <button class="btn primary big">Weiter</button>
    <p class="form-error" role="alert"></p>
  </form>
  <p class="fineprint">Kalorien und Eiweiß kommen aus deinem Plan: 1.000 kcal unter deinem Verbrauch und 150 g Eiweiß. Du kannst beides später in den Einstellungen ändern.</p>
</main>`;
}
