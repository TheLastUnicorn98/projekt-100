import { RECIPES } from './recipes.js';
import { ITEMS, WEEK_PLAN, STANDARD_SNACKS, DEFAULT_PREFS } from './data.js';
import * as L from './logic.js';
import * as P from './planner.js';
import { loadState, saveState, normalizeState, isReady, emptyState } from './store.js';
import { icon, esc, parseNum } from './ui.js';
import { attachSwipe } from './gesture.js';
import { todayView } from './views/today.js';
import { weekView } from './views/week.js';
import { shopView } from './views/shop.js';
import { progressView } from './views/progress.js';
import { swipeView, previewView } from './views/swipe.js';
import { missingText } from './views/parts.js';
import { recipeSheet, settingsSheet, onboardingView, prefsView } from './views/sheets.js';

const TABS = [
  { id: 'heute', label: 'Heute' },
  { id: 'woche', label: 'Woche' },
  { id: 'einkauf', label: 'Einkauf' },
  { id: 'verlauf', label: 'Verlauf' },
];
const VIEWS = { heute: todayView, woche: weekView, einkauf: shopView, verlauf: progressView, wischen: swipeView, plan: previewView };
const FULLSCREEN = new Set(['wischen', 'plan']);

const root = document.getElementById('app');
const today = () => L.toISO(new Date());
const nextMondayISO = () => L.addDays(L.mondayOf(today()), 7);
const tabFromHash = () => (VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : 'heute');
const seedOf = (monday) => Number(monday.replaceAll('-', '')) % 100000;

let state = loadState();
const ui = {
  tab: tabFromHash(),
  day: today(),
  sheet: null,
  range: 'recent',
  confirm: null,
  toast: null,
  installEvent: null,
  updateReady: null,
  weekSel: 'this',
  shopSel: 'this',
  swipeHistory: [],
  preview: null,
  planSeed: 1,
  draftPrefs: structuredClone(DEFAULT_PREFS),
};

// ---------- Pläne ----------

const planCtx = () => ({ recipes: RECIPES, items: ITEMS, settings: state.settings, startDate: state.settings.startDate });
const prefs = () => state.prefs ?? DEFAULT_PREFS;

const standardCache = new Map();
function weekPlan(monday) {
  if (ui.tab === 'plan' && ui.preview?.week === monday) return ui.preview;
  if (state.plans[monday]) return state.plans[monday];
  const legacySwaps = {};
  for (const iso of L.weekDates(monday)) if (state.days[iso]?.swaps) legacySwaps[iso] = state.days[iso].swaps;
  const s = state.settings;
  const key = JSON.stringify([monday, s.kcal, s.protein, s.startDate, legacySwaps]);
  if (!standardCache.has(key)) {
    standardCache.set(key, P.standardWeek(monday, { ...planCtx(), weekPlan: WEEK_PLAN, snacks: STANDARD_SNACKS, legacySwaps }));
  }
  return standardCache.get(key);
}
const dayPlan = (iso) => weekPlan(L.mondayOf(iso)).days[iso];

// Nach geänderten Zielen alle laufenden und kommenden Pläne neu aufs Ziel rechnen.
function refitPlans() {
  const current = L.mondayOf(today());
  for (const [week, plan] of Object.entries(state.plans)) if (week >= current) state.plans[week] = P.fitWeek(plan, planCtx());
  standardCache.clear();
}

function prune() {
  const current = L.mondayOf(today());
  const cut = L.addDays(current, -56);
  for (const k of Object.keys(state.plans)) if (k < cut) delete state.plans[k];
  for (const k of Object.keys(state.shopping)) if (k < cut) delete state.shopping[k];
  for (const k of Object.keys(state.swipes)) if (k < current) delete state.swipes[k];
}

// Stapel der nächsten Woche: gespeicherte Reihenfolge, gefiltert nach den aktuellen Vorlieben.
function swipeFor(monday) {
  const saved = state.swipes[monday];
  const allowedIds = P.deckFor(prefs(), RECIPES, seedOf(monday));
  const order = saved
    ? [...saved.order.filter((id) => allowedIds.includes(id)), ...allowedIds.filter((id) => !saved.order.includes(id))]
    : allowedIds;
  const votes = Object.fromEntries(Object.entries(saved?.votes ?? {}).filter(([id]) => order.includes(id)));
  return { order, votes };
}

function ensureSwipe(monday) {
  const current = swipeFor(monday);
  state.swipes[monday] = { order: current.order, votes: { ...current.votes } };
  return state.swipes[monday];
}

// ---------- Darstellung ----------

function context() {
  const s = state.settings;
  const todayISO = today();
  const entries = L.normalizeWeights(state.weights);
  const schedule = L.planSchedule(s.startKg, s.targetKg);
  const best = L.bestAverage(entries);
  const steps = L.recalcSteps(s.startKg, best);
  const thisMonday = L.mondayOf(todayISO);
  const nextMonday = L.addDays(thisMonday, 7);
  return {
    state, ui, s, entries, todayISO, schedule, best, steps, thisMonday, nextMonday,
    prefs: prefs(),
    planCtx: planCtx(),
    weekPlan,
    dayPlan,
    mondayOf: L.mondayOf,
    swipe: swipeFor(nextMonday),
    planEnd: L.addDays(s.startDate, schedule.totalDays),
    streak: L.streak((iso) => P.isDayComplete(dayPlan(iso), state.days[iso]?.checked), todayISO, s.startDate),
    recalcDue: steps > s.recalcAck,
  };
}

function render() {
  if (!isReady(state)) {
    root.innerHTML = onboardingView(today()) + toastHTML();
    return;
  }
  if (!state.prefs) {
    root.innerHTML = prefsView(ui.draftPrefs, P.deckFor(ui.draftPrefs, RECIPES).length) + toastHTML();
    return;
  }
  const ctx = context();
  const nav = FULLSCREEN.has(ui.tab)
    ? ''
    : `<nav class="tabbar" aria-label="Bereiche">${TABS.map(
        (t) => `<a href="#${t.id}" class="tab ${ui.tab === t.id ? 'is-active' : ''}"${ui.tab === t.id ? ' aria-current="page"' : ''}>${icon(t.id)}<span>${t.label}</span></a>`,
      ).join('')}</nav>`;
  const sheet = ui.sheet
    ? `<div class="scrim" data-action="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">${ui.sheet.type === 'recipe' ? recipeSheet(ctx) : settingsSheet(ctx)}</div>`
    : '';
  root.innerHTML = `<main class="view view-${ui.tab}">${VIEWS[ui.tab](ctx)}</main>${nav}${sheet}${toastHTML()}`;
  if (ui.tab === 'wischen' && !ui.sheet) attachDeck();
}

function attachDeck() {
  const card = root.querySelector('.card-swipe.is-top');
  if (!card) return;
  attachSwipe(card, {
    onVote: (vote) => castVote(card.dataset.id, vote),
    onTap: () => openSheet({ type: 'recipe', id: card.dataset.id, readOnly: true }),
  });
}

function toastHTML() {
  if (ui.updateReady) {
    return `<div class="toast" role="status">Neue Version da <button class="btn sm primary" data-action="update-app">Aktualisieren</button></div>`;
  }
  return ui.toast ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : '';
}

let toastTimer;
function toast(message) {
  ui.toast = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    ui.toast = null;
    render();
  }, 2800);
}

function persist(message) {
  if (!saveState(state)) message = 'Speichern hat nicht geklappt. Ist der Speicher des Handys voll?';
  if (message) toast(message);
  render();
}

const dayState = (iso) => (state.days[iso] ??= { checked: {} });
const shopMonday = () => (ui.shopSel === 'next' && state.plans[nextMondayISO()] ? nextMondayISO() : L.mondayOf(today()));

function openSheet(sheet) {
  ui.sheet = sheet;
  ui.confirm = null;
  history.pushState({ sheet: true }, '');
  document.body.classList.add('has-sheet');
  render();
}

function closeSheet() {
  if (!ui.sheet) return;
  ui.sheet = null;
  ui.confirm = null;
  document.body.classList.remove('has-sheet');
  if (history.state?.sheet) history.back();
  render();
}

// ---------- Wischen und Plan ----------

function castVote(id, vote) {
  ensureSwipe(nextMondayISO()).votes[id] = vote;
  ui.swipeHistory.push(id);
  persist();
}

function buildPreview() {
  const monday = nextMondayISO();
  const result = P.buildWeek({ ...planCtx(), mondayISO: monday, likes: swipeFor(monday).votes, prefs: prefs(), seed: ui.planSeed });
  if (!result.ok) {
    toast(missingText(result.missing));
    render();
    return;
  }
  ui.preview = result.plan;
  if (location.hash === '#plan') render();
  else location.hash = '#plan';
}

// ---------- Formulare ----------

function showFormError(form, message) {
  const el = form.querySelector('.form-error');
  if (el) el.textContent = message;
}

function readSettings(form) {
  const v = Object.fromEntries(new FormData(form));
  const startKg = parseNum(v.startKg);
  const targetKg = parseNum(v.targetKg);
  const heightCm = parseNum(v.heightCm);
  const kcal = parseNum(v.kcal);
  const protein = parseNum(v.protein);
  if (!(startKg >= 40 && startKg <= 400)) return showFormError(form, 'Bitte ein Startgewicht zwischen 40 und 400 kg eingeben.');
  if (!(targetKg >= 40 && targetKg < startKg)) return showFormError(form, 'Das Zielgewicht muss unter dem Startgewicht liegen.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.startDate ?? '')) return showFormError(form, 'Bitte ein Startdatum wählen.');
  if (!(kcal >= 1200 && kcal <= 5000)) return showFormError(form, 'Bitte ein Kalorienziel zwischen 1.200 und 5.000 eingeben.');
  if (!(protein >= 50 && protein <= 400)) return showFormError(form, 'Bitte ein Eiweißziel zwischen 50 und 400 g eingeben.');
  return { startKg, targetKg, heightCm: heightCm >= 100 && heightCm <= 250 ? heightCm : null, startDate: v.startDate, kcal, protein };
}

const forms = {
  onboarding(form) {
    const values = readSettings(form);
    if (!values) return;
    state.settings = { ...state.settings, ...values, recalcAck: 0 };
    state.weights = L.normalizeWeights([...state.weights, { date: values.startDate, kg: values.startKg }]);
    navigator.storage?.persist?.().catch(() => {});
    ui.tab = 'heute';
    ui.day = today();
    history.replaceState(null, '', '#heute');
    persist();
    window.scrollTo(0, 0);
  },
  settings(form) {
    const values = readSettings(form);
    if (!values) return;
    state.settings = { ...state.settings, ...values };
    refitPlans();
    closeSheet();
    persist('Einstellungen gespeichert, Pläne neu gerechnet');
  },
  weight(form) {
    const v = Object.fromEntries(new FormData(form));
    const kg = parseNum(v.kg);
    if (!(kg >= 30 && kg <= 400)) return showFormError(form, 'Bitte ein Gewicht zwischen 30 und 400 kg eingeben, zum Beispiel 120,4.');
    const date = /^\d{4}-\d{2}-\d{2}$/.test(v.date ?? '') && v.date <= today() ? v.date : today();
    state.weights = L.normalizeWeights([...state.weights, { date, kg }]);
    persist('Gewicht gespeichert');
  },
};

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: `projekt-100-sicherung-${today()}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast('Sicherung liegt in deinen Downloads');
  render();
}

// ---------- Aktionen ----------

const actions = {
  'pick-day': (el) => {
    ui.day = el.dataset.day;
    render();
  },
  'go-today': () => {
    ui.day = today();
    render();
  },
  check: (el) => {
    const d = dayState(ui.day);
    const { slot } = el.dataset;
    if (d.checked[slot]) delete d.checked[slot];
    else d.checked[slot] = true;
    persist();
  },
  'open-recipe': (el) => openSheet({ type: 'recipe', id: el.dataset.id, slot: el.dataset.slot, day: el.dataset.day || null }),
  swap: (el) => {
    const { day, slot } = ui.sheet;
    const { id } = el.dataset;
    const monday = L.mondayOf(day);
    const next = P.swapMeal(weekPlan(monday), day, slot, id, planCtx());
    if (ui.tab === 'plan' && ui.preview?.week === monday) {
      ui.preview = next;
    } else {
      state.plans[monday] = next;
      for (const iso of L.weekDates(monday)) if (state.days[iso]?.swaps) delete state.days[iso].swaps;
      delete dayState(day).checked[slot];
    }
    closeSheet();
    persist(`${RECIPES[id].name} eingeplant, Portionen angepasst`);
  },
  settings: () => openSheet({ type: 'settings' }),
  'close-sheet': () => closeSheet(),
  'week-sel': (el) => {
    ui.weekSel = el.dataset.sel;
    render();
  },
  'shop-sel': (el) => {
    ui.shopSel = el.dataset.sel;
    render();
  },
  'shop-toggle': (el) => {
    const c = (state.shopping[shopMonday()] ??= { checked: {} }).checked;
    const { id } = el.dataset;
    if (c[id]) delete c[id];
    else c[id] = true;
    persist();
  },
  'shop-reset': () => {
    ui.confirm = 'shop-reset';
    render();
  },
  'shop-reset-yes': () => {
    state.shopping[shopMonday()] = { checked: {} };
    ui.confirm = null;
    persist('Häkchen entfernt');
  },
  cancel: () => {
    ui.confirm = null;
    render();
  },
  range: (el) => {
    ui.range = el.dataset.range;
    render();
  },
  'weight-delete': (el) => {
    ui.confirm = `w:${el.dataset.date}`;
    render();
  },
  'weight-delete-yes': (el) => {
    state.weights = state.weights.filter((w) => w.date !== el.dataset.date);
    ui.confirm = null;
    persist('Messung gelöscht');
  },
  'recalc-apply': () => {
    const { steps } = context();
    state.settings.kcal -= 120 * (steps - state.settings.recalcAck);
    state.settings.recalcAck = steps;
    refitPlans();
    persist(`Neues Kalorienziel: ${L.formatNumber(state.settings.kcal)} kcal`);
  },
  'recalc-dismiss': () => {
    state.settings.recalcAck = context().steps;
    persist();
  },
  vote: (el) => {
    const card = root.querySelector('.card-swipe.is-top');
    if (!card) return;
    const vote = Number(el.dataset.vote);
    if (card.fly) card.fly(vote);
    else castVote(card.dataset.id, vote);
  },
  'swipe-undo': () => {
    const id = ui.swipeHistory.pop();
    if (!id) return;
    delete ensureSwipe(nextMondayISO()).votes[id];
    persist();
  },
  'swipe-reshuffle': () => {
    const sw = ensureSwipe(nextMondayISO());
    for (const [id, v] of Object.entries(sw.votes)) if (v === -1) delete sw.votes[id];
    ui.swipeHistory = [];
    persist();
  },
  'build-plan': () => buildPreview(),
  'reshuffle-plan': () => {
    ui.planSeed += 1;
    buildPreview();
  },
  'accept-plan': () => {
    if (!ui.preview) return;
    state.plans[ui.preview.week] = ui.preview;
    ui.preview = null;
    ui.weekSel = 'next';
    ui.shopSel = 'next';
    saveState(state);
    toast('Plan für nächste Woche gespeichert');
    location.hash = '#woche';
  },
  'pref-toggle': (el) => {
    const target = state.prefs ?? ui.draftPrefs;
    const { group, value } = el.dataset;
    if (group === 'maxTime') target.maxTime = Number(value);
    else if (group === 'freeEvening') target.freeEvening = !target.freeEvening;
    else {
      const list = target[group];
      const i = list.indexOf(value);
      if (i >= 0) list.splice(i, 1);
      else list.push(value);
    }
    if (state.prefs) persist();
    else render();
  },
  'prefs-save': () => {
    state.prefs = structuredClone(ui.draftPrefs);
    persist("Los geht's");
    window.scrollTo(0, 0);
  },
  export: () => exportBackup(),
  import: () => document.getElementById('import-file')?.click(),
  install: async () => {
    const event = ui.installEvent;
    if (!event) return;
    event.prompt();
    await event.userChoice.catch(() => {});
    ui.installEvent = null;
    render();
  },
  'reset-all': () => {
    ui.confirm = 'reset-all';
    render();
  },
  'reset-all-yes': () => {
    state = emptyState();
    ui.draftPrefs = structuredClone(DEFAULT_PREFS);
    ui.preview = null;
    standardCache.clear();
    saveState(state);
    closeSheet();
    render();
  },
  'update-app': () => ui.updateReady?.postMessage('SKIP_WAITING'),
};

// ---------- Ereignisse ----------

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled || !actions[el.dataset.action]) return;
  e.preventDefault();
  actions[el.dataset.action](el);
});

document.addEventListener('submit', (e) => {
  const form = e.target;
  if (!forms[form.dataset.form]) return;
  e.preventDefault();
  forms[form.dataset.form](form);
});

document.addEventListener('change', async (e) => {
  if (e.target.id !== 'import-file') return;
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const next = normalizeState(JSON.parse(await file.text()));
    if (!isReady(next)) throw new Error('keine Sicherung');
    state = next;
    standardCache.clear();
    saveState(state);
    closeSheet();
    toast('Sicherung geladen');
  } catch {
    toast('Diese Datei ist keine Sicherung von Projekt 100.');
  }
  render();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ui.sheet) return closeSheet();
  if (ui.tab !== 'wischen' || ui.sheet || e.target.closest('input')) return;
  const keys = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: 2 };
  if (keys[e.key]) {
    e.preventDefault();
    actions.vote({ dataset: { vote: String(keys[e.key]) } });
  } else if (e.key === 'Backspace') actions['swipe-undo']();
});

window.addEventListener('hashchange', () => {
  ui.tab = tabFromHash();
  ui.confirm = null;
  render();
  window.scrollTo(0, 0);
});

// Zurück-Taste von Android schließt zuerst ein offenes Fenster.
window.addEventListener('popstate', () => {
  if (ui.sheet) {
    ui.sheet = null;
    document.body.classList.remove('has-sheet');
  }
  ui.tab = tabFromHash();
  render();
});

// Läuft die App über Mitternacht offen, springt „Heute“ beim nächsten Öffnen auf den neuen Tag.
let lastToday = today();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const now = today();
  if (now === lastToday) return;
  if (ui.day === lastToday) ui.day = now;
  lastToday = now;
  render();
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  ui.installEvent = e;
  render();
});
window.addEventListener('appinstalled', () => {
  ui.installEvent = null;
  render();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => {
      const waiting = () => {
        ui.updateReady = reg.waiting;
        render();
      };
      if (reg.waiting && navigator.serviceWorker.controller) waiting();
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        sw?.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) waiting();
        });
      });
    })
    .catch(() => {});
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });
}

prune();
render();
