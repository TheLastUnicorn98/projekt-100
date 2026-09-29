import { RECIPES, WEEK_PLAN } from './data.js';
import * as L from './logic.js';
import { loadState, saveState, normalizeState, isReady, emptyState } from './store.js';
import { icon, esc, parseNum } from './ui.js';
import { todayView } from './views/today.js';
import { weekView } from './views/week.js';
import { shopView } from './views/shop.js';
import { progressView } from './views/progress.js';
import { recipeSheet, settingsSheet, onboardingView } from './views/sheets.js';

const TABS = [
  { id: 'heute', label: 'Heute' },
  { id: 'woche', label: 'Woche' },
  { id: 'einkauf', label: 'Einkauf' },
  { id: 'verlauf', label: 'Verlauf' },
];
const VIEWS = { heute: todayView, woche: weekView, einkauf: shopView, verlauf: progressView };

const root = document.getElementById('app');
const today = () => L.toISO(new Date());
const tabFromHash = () => (VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : 'heute');

let state = loadState();
const ui = { tab: tabFromHash(), day: today(), sheet: null, range: 'recent', confirm: null, toast: null, installEvent: null, updateReady: null };

function context() {
  const s = state.settings;
  const entries = L.normalizeWeights(state.weights);
  const todayISO = today();
  const schedule = L.planSchedule(s.startKg, s.targetKg);
  const best = L.bestAverage(entries);
  const steps = L.recalcSteps(s.startKg, best);
  return {
    state, ui, s, entries, todayISO, schedule, best, steps,
    planEnd: L.addDays(s.startDate, schedule.totalDays),
    streak: L.streak(state.days, todayISO, s.startDate, WEEK_PLAN),
    recalcDue: steps > s.recalcAck,
  };
}

function render() {
  if (!isReady(state)) {
    root.innerHTML = onboardingView(today()) + toastHTML();
    return;
  }
  const ctx = context();
  const nav = TABS.map(
    (t) => `<a href="#${t.id}" class="tab ${ui.tab === t.id ? 'is-active' : ''}"${ui.tab === t.id ? ' aria-current="page"' : ''}>${icon(t.id)}<span>${t.label}</span></a>`,
  ).join('');
  const sheet = ui.sheet
    ? `<div class="scrim" data-action="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">${ui.sheet.type === 'recipe' ? recipeSheet(ctx) : settingsSheet(ctx)}</div>`
    : '';
  root.innerHTML = `<main class="view view-${ui.tab}">${VIEWS[ui.tab](ctx)}</main>
<nav class="tabbar" aria-label="Bereiche">${nav}</nav>${sheet}${toastHTML()}`;
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
  }, 2600);
}

function persist(message) {
  if (!saveState(state)) message = 'Speichern hat nicht geklappt. Ist der Speicher des Handys voll?';
  if (message) toast(message);
  render();
}

const dayState = (iso) => (state.days[iso] ??= { checked: {}, swaps: {} });

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

function showFormError(form, message) {
  const el = form.querySelector('.form-error');
  if (el) el.textContent = message;
}

// Liest Start, Ziel und Tagesziele aus einem Formular und prüft sie. Gibt null zurück, wenn etwas nicht passt.
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
    persist("Los geht's");
    window.scrollTo(0, 0);
  },
  settings(form) {
    const values = readSettings(form);
    if (!values) return;
    state.settings = { ...state.settings, ...values };
    closeSheet();
    persist('Einstellungen gespeichert');
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
    const d = dayState(day);
    if (id === WEEK_PLAN[L.weekday(day)][slot]) delete d.swaps[slot];
    else d.swaps[slot] = id;
    delete d.checked[slot];
    closeSheet();
    persist(`${RECIPES[id].name} eingeplant`);
  },
  settings: () => openSheet({ type: 'settings' }),
  'close-sheet': () => closeSheet(),
  'shop-toggle': (el) => {
    const c = state.shopping.checked;
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
    state.shopping.checked = {};
    ui.confirm = null;
    persist('Liste ist leer');
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
    persist(`Neues Kalorienziel: ${L.formatNumber(state.settings.kcal)} kcal`);
  },
  'recalc-dismiss': () => {
    state.settings.recalcAck = context().steps;
    persist();
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
    saveState(state);
    closeSheet();
    render();
  },
  'update-app': () => ui.updateReady?.postMessage('SKIP_WAITING'),
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || !actions[el.dataset.action]) return;
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
    saveState(state);
    closeSheet();
    toast('Sicherung geladen');
  } catch {
    toast('Diese Datei ist keine Sicherung von Projekt 100.');
  }
  render();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ui.sheet) closeSheet();
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

render();
