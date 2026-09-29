import { RECIPES, ITEMS, SLOTS, DEVICES, WEEK_PLAN } from '../data.js';
import * as L from '../logic.js';
import { esc, icon, fmt, kgText, dateLong, dateShort, weekdayShort, dayNum, rings, miniRing } from '../ui.js';

function header(ctx, iso, phase) {
  const { s, schedule, todayISO, streak } = ctx;
  const dayNo = L.daysBetween(s.startDate, iso) + 1;
  const eyebrow =
    phase.phase === 'vorher'
      ? `Start am ${dateShort(s.startDate)}`
      : `Tag ${fmt(dayNo)} von ${fmt(schedule.totalDays)} · ${phase.phase === 'pause' ? 'Diät-Pause' : 'Diät'}, Woche ${phase.week} von ${phase.of}`;
  const streakChip = streak
    ? `<span class="chip chip-streak" title="Tage in Folge nach Plan">${icon('flamme', 'sm')}${fmt(streak)}</span>`
    : '';
  return `<header class="top">
  <div><p class="eyebrow">${eyebrow}</p><h1>${iso === todayISO ? 'Heute' : esc(dateLong(iso))}</h1></div>
  <div class="top-actions">${streakChip}<button class="icon-btn" data-action="settings" aria-label="Einstellungen">${icon('einstellungen')}</button></div>
</header>`;
}

function weekStrip(ctx, iso) {
  const { state, todayISO } = ctx;
  const days = L.weekDates(iso).map((d) => {
    const plan = L.planFor(d, state.days[d], WEEK_PLAN);
    const checked = state.days[d]?.checked ?? {};
    const slots = Object.entries(plan).filter(([, id]) => id);
    const frac = slots.filter(([slot]) => checked[slot]).length / slots.length;
    const cls = `${d === iso ? 'is-selected' : ''} ${d === todayISO ? 'is-today' : ''}`;
    return `<button class="day ${cls}" data-action="pick-day" data-day="${d}" aria-pressed="${d === iso}" aria-label="${esc(dateLong(d))}">
  <span class="day-name">${weekdayShort(d)}</span>${miniRing(frac)}<span class="day-num">${dayNum(d)}</span></button>`;
  });
  const back = iso === todayISO ? '' : `<button class="link" data-action="go-today">Zurück zu heute</button>`;
  return `<nav class="weekstrip" aria-label="Tage dieser Woche">${days.join('')}</nav>${back}`;
}

function banners(ctx, iso, phase, kcalTarget) {
  const { s, ui, todayISO } = ctx;
  const out = [];
  if (ui.installEvent) {
    out.push(`<aside class="banner banner-brand"><p>${icon('installieren')} Leg dir Projekt 100 als App auf den Startbildschirm. Sie läuft dann auch ohne Internet.</p>
  <button class="btn primary sm" data-action="install">Installieren</button></aside>`);
  }
  if (phase.phase === 'pause') {
    out.push(`<aside class="banner banner-kcal"><p><strong>Diät-Pause, Woche ${phase.week} von ${phase.of}.</strong> Du isst diese Tage auf Erhaltung, also rund ${fmt(kcalTarget)} kcal. So kommst du hin: mittags doppelt Reis, abends doppelte Beilage und ein Snack extra.</p></aside>`);
  }
  if (ctx.recalcDue && iso === todayISO) {
    const next = s.kcal - 120 * (ctx.steps - s.recalcAck);
    out.push(`<aside class="banner banner-brand"><p><strong>${fmt(ctx.steps * 10)} kg geschafft.</strong> Dein Körper verbraucht jetzt etwas weniger. Kalorienziel von ${fmt(s.kcal)} auf ${fmt(next)} kcal senken?</p>
  <div class="row"><button class="btn primary sm" data-action="recalc-apply">Ziel senken</button><button class="btn ghost sm" data-action="recalc-dismiss">Nicht jetzt</button></div></aside>`);
  }
  return out.join('');
}

function summary(ctx, totals, kcalTarget, allDone) {
  const { s } = ctx;
  const rest = kcalTarget - totals.kcal;
  const note = allDone
    ? 'Alles abgehakt. Starker Tag.'
    : rest >= 0
      ? `Noch ${fmt(rest)} kcal und ${fmt(Math.max(0, s.protein - totals.protein))} g Eiweiß offen.`
      : `${fmt(-rest)} kcal über dem Ziel.`;
  return `<section class="card summary" aria-label="Tagesbilanz">
  ${rings({ kcal: totals.kcal, kcalTarget, protein: totals.protein, proteinTarget: s.protein })}
  <div class="summary-text">
    <p class="big kcal-ink">${fmt(totals.kcal)} <span>/ ${fmt(kcalTarget)} kcal</span></p>
    <p class="big protein-ink">${fmt(totals.protein)} <span>/ ${fmt(s.protein)} g Eiweiß</span></p>
    <p class="muted small">${note}</p>
  </div>
</section>`;
}

function meals(iso, plan, dayState) {
  const checked = dayState.checked ?? {};
  const base = WEEK_PLAN[L.weekday(iso)];
  return SLOTS.filter(({ id }) => plan[id])
    .map(({ id: slot, label }) => {
      const rid = plan[slot];
      const r = RECIPES[rid];
      const m = L.recipeMacros(r, ITEMS);
      const done = Boolean(checked[slot]);
      const swapped = rid !== base[slot];
      const approx = r.fixed ? 'ca. ' : '';
      return `<article class="meal ${done ? 'is-done' : ''}">
  <button class="meal-open" data-action="open-recipe" data-id="${rid}" data-slot="${slot}" data-day="${iso}">
    <span class="meal-slot">${label}${swapped ? ' · getauscht' : ''}</span>
    <span class="meal-name">${esc(r.name)}</span>
    <span class="meal-meta">${icon(r.device, 'sm')}${DEVICES[r.device]} · ${approx}${fmt(m.kcal)} kcal · ${fmt(m.protein)} g Eiweiß</span>
  </button>
  <button class="check" data-action="check" data-slot="${slot}" aria-pressed="${done}" aria-label="${label} ${done ? 'wieder öffnen' : 'abhaken'}">${icon('check')}</button>
</article>`;
    })
    .join('');
}

function weighIn(ctx) {
  const { entries, todayISO } = ctx;
  const entry = entries.find((e) => e.date === todayISO);
  if (entry) {
    const avg = L.avgOn(entries, todayISO);
    return `<section class="weigh-done">${icon('waage')}<p>Heute gewogen: <strong>${kgText(entry.kg)}</strong> · Schnitt 7 Tage ${kgText(Math.round(avg * 10) / 10)}</p></section>`;
  }
  return `<form class="card weigh" data-form="weight" novalidate>
  <label for="w-today">${icon('waage')} Heute schon gewogen?</label>
  <div class="row">
    <input id="w-today" name="kg" type="text" inputmode="decimal" autocomplete="off" placeholder="Gewicht in kg" aria-describedby="w-today-hint">
    <input type="hidden" name="date" value="${todayISO}">
    <button class="btn primary">Speichern</button>
  </div>
  <p class="hint" id="w-today-hint">Morgens nach dem Klo, vor dem Frühstück, barfuß.</p>
  <p class="form-error" role="alert"></p>
</form>`;
}

export function todayView(ctx) {
  const { state, s, ui, todayISO } = ctx;
  const iso = ui.day;
  const dayState = state.days[iso] ?? {};
  const plan = L.planFor(iso, dayState, WEEK_PLAN);
  const totals = L.dayTotals(plan, dayState.checked, RECIPES, ITEMS);
  const phase = L.phaseOn(s.startDate, iso);
  const kcalTarget = s.kcal + (phase.phase === 'pause' ? L.PLAN.deficit : 0);
  const allDone = L.isPlanComplete(plan, dayState.checked);
  return `${header(ctx, iso, phase)}
${weekStrip(ctx, iso)}
${banners(ctx, iso, phase, kcalTarget)}
${summary(ctx, totals, kcalTarget, allDone)}
<section class="meals" aria-label="Mahlzeiten">${meals(iso, plan, dayState)}</section>
${iso === todayISO ? weighIn(ctx) : ''}`;
}
