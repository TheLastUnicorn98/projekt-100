import { RECIPES, ITEMS, SLOTS, SWAPS, DEVICES } from '../data.js';
import * as L from '../logic.js';
import { esc, icon, fmt } from '../ui.js';

const slotLabel = (slot) => SLOTS.find((x) => x.id === slot)?.label ?? '';

function head(eyebrow, title) {
  return `<div class="sheet-head">
  <div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h2 id="sheet-title">${title}</h2></div>
  <button class="icon-btn" data-action="close-sheet" aria-label="Schließen">${icon('close')}</button>
</div>`;
}

export function recipeSheet(ctx) {
  const { id, slot, day } = ctx.ui.sheet;
  const r = RECIPES[id];
  const m = L.recipeMacros(r, ITEMS);
  const approx = r.fixed ? 'ca. ' : '';
  const options = day ? SWAPS[slot].filter((rid) => rid !== id) : [];
  const swaps = options
    .map((rid) => {
      const o = RECIPES[rid];
      const om = L.recipeMacros(o, ITEMS);
      return `<li><button class="swap" data-action="swap" data-id="${rid}">${icon(o.device, 'sm')}<span>${esc(o.name)}</span><span class="muted small">${o.fixed ? 'ca. ' : ''}${fmt(om.kcal)} kcal · ${fmt(om.protein)} g</span></button></li>`;
    })
    .join('');
  return `${head(`${slotLabel(slot)} · ${DEVICES[r.device]}`, esc(r.name))}
<dl class="macros">
  <div><dt>Kalorien</dt><dd>${approx}${fmt(m.kcal)}</dd></div>
  <div><dt>Eiweiß</dt><dd>${fmt(m.protein)} g</dd></div>
  <div><dt>Fett</dt><dd>${fmt(m.fat)} g</dd></div>
  <div><dt>Kohlenh.</dt><dd>${fmt(m.carbs)} g</dd></div>
</dl>
${r.ingredients.length ? `<h3>Zutaten</h3><ul class="ingredients">${r.ingredients.map((i) => `<li>${esc(i.text)}</li>`).join('')}</ul>` : ''}
<h3>So geht's</h3>
<ol class="steps">${r.steps.map((st) => `<li>${esc(st)}</li>`).join('')}</ol>
${r.tip ? `<p class="tip-line">${esc(r.tip)}</p>` : ''}
${swaps ? `<h3>An diesem Tag tauschen gegen</h3><ul class="swaps">${swaps}</ul>` : ''}`;
}

function field(id, label, value, attrs = '') {
  return `<label class="field" for="${id}">${label}<input id="${id}" name="${id.slice(2)}" value="${value ?? ''}" ${attrs}></label>`;
}

export function settingsSheet(ctx) {
  const { s, ui } = ctx;
  const reset =
    ui.confirm === 'reset-all'
      ? `<p>Wirklich alles löschen? Gewichte, Häkchen und Einstellungen sind danach weg.</p><div class="row"><button class="btn danger" data-action="reset-all-yes">Ja, alles löschen</button><button class="btn ghost" data-action="cancel">Abbrechen</button></div>`
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
<p class="fineprint">Projekt 100 · Nährwerte sind Durchschnittswerte gängiger Produkte. Schriften: Bricolage Grotesque und Figtree (SIL Open Font License).</p>`;
}

export function onboardingView(todayISO) {
  const dec = 'type="text" inputmode="decimal" autocomplete="off"';
  const int = 'type="text" inputmode="numeric" autocomplete="off"';
  return `<main class="onboard">
  <img class="onboard-mark" src="icons/icon-192.png" alt="" width="72" height="72">
  <p class="eyebrow">Projekt 100</p>
  <h1>Richte deinen Plan ein</h1>
  <p class="lead">Ein paar Zahlen, dann geht's los. Sie bleiben nur auf diesem Handy.</p>
  <form class="form" data-form="onboarding" novalidate>
    ${field('o-startKg', 'Startgewicht in kg', '', `${dec} placeholder="z. B. 120,5"`)}
    ${field('o-targetKg', 'Zielgewicht in kg', '', `${dec} placeholder="z. B. 90"`)}
    ${field('o-heightCm', 'Größe in cm (freiwillig)', '', `${int} placeholder="z. B. 180"`)}
    ${field('o-startDate', 'Start am', todayISO, 'type="date" required')}
    <div class="row">${field('o-kcal', 'Kalorien pro Tag', 2200, int)}${field('o-protein', 'Eiweiß pro Tag (g)', 150, int)}</div>
    <button class="btn primary big">Plan starten</button>
    <p class="form-error" role="alert"></p>
  </form>
  <p class="fineprint">Kalorien und Eiweiß kommen aus deinem Plan: 1.000 kcal unter deinem Verbrauch und 150 g Eiweiß. Du kannst beides später in den Einstellungen ändern.</p>
</main>`;
}
