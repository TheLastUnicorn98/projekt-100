import { formatNumber } from './logic.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const PATHS = {
  heute: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  woche: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  einkauf: '<path d="M3 4h2.2l2.3 10.6a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>',
  verlauf: '<path d="M3.5 3.5v17h17"/><path d="m7.5 15 4-4.5 3 3 5.5-6"/>',
  einstellungen: '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  reiskocher: '<path d="M5 11h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M3.5 11h17M7.5 11a4.5 4.5 0 0 1 9 0M12 4.5v2"/>',
  airfryer: '<rect x="5" y="3" width="14" height="18" rx="3.5"/><circle cx="12" cy="10" r="3"/><path d="M9.5 17h5"/>',
  ohne: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M14.5 3.5 12 11"/>',
  frei: '<path d="M4.5 11a7.5 5.5 0 0 1 15 0z"/><path d="M4 14.5h16"/><path d="M5 17.5h14a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5z"/>',
  flamme: '<path d="M12 3c1 3 5.5 5.2 5.5 10.2a5.5 5.5 0 0 1-11 0c0-2.3 1.1-3.9 2.3-5 0 2.1.9 3.3 2.2 3.3 0-3.2-.9-5.4 1-8.5z"/>',
  waage: '<rect x="3.5" y="4" width="17" height="16.5" rx="4"/><path d="M8.5 10a3.5 3.5 0 0 1 7 0M12 10l1.6-2"/>',
  sichern: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
  laden: '<path d="M12 20V9M7.5 13.5 12 9l4.5 4.5M5 4.5h14"/>',
  loeschen: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
  installieren: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M12 7v7M9.5 11.5 12 14l2.5-2.5"/>',
};

export function icon(name, cls = '') {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${PATHS[name] ?? ''}</svg>`;
}

const utc = (iso) => new Date(`${iso}T00:00:00Z`);
const LONG = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const SHORT = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const DAY_MONTH = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'numeric', timeZone: 'UTC' });
const WD_LONG = new Intl.DateTimeFormat('de-DE', { weekday: 'long', timeZone: 'UTC' });
const WD_SHORT = new Intl.DateTimeFormat('de-DE', { weekday: 'short', timeZone: 'UTC' });

export const dateLong = (iso) => LONG.format(utc(iso));
export const dateShort = (iso) => SHORT.format(utc(iso));
export const dayMonth = (iso) => DAY_MONTH.format(utc(iso));
export const weekdayLong = (iso) => WD_LONG.format(utc(iso));
export const weekdayShort = (iso) => WD_SHORT.format(utc(iso)).replace('.', '');
export const dayNum = (iso) => Number(iso.slice(8));

const KG = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
export const kgText = (n) => `${KG.format(n)} kg`;
export const fmt = (n, d = 0) => formatNumber(n, d);

// Zahl aus einem Textfeld, Komma oder Punkt als Dezimaltrenner. Leer oder Unsinn ergibt NaN.
export function parseNum(value) {
  const s = String(value ?? '').trim().replace(',', '.');
  return s === '' ? NaN : Number(s);
}

function arc(cx, r, value, target, cls) {
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, target ? value / target : 0));
  const track = `<circle class="ring-track" cx="${cx}" cy="${cx}" r="${r}"/>`;
  if (p === 0) return track;
  return `${track}<circle class="ring ${cls}" cx="${cx}" cy="${cx}" r="${r}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - p)).toFixed(2)}" transform="rotate(-90 ${cx} ${cx})"/>`;
}

export function rings({ kcal, kcalTarget, protein, proteinTarget }) {
  return `<svg class="rings" viewBox="0 0 120 120" aria-hidden="true">${arc(60, 52, kcal, kcalTarget, 'ring-kcal')}${arc(60, 37, protein, proteinTarget, 'ring-protein')}</svg>`;
}

export function miniRing(fraction) {
  return `<svg class="mini" viewBox="0 0 24 24" aria-hidden="true">${arc(12, 9, fraction, 1, fraction >= 1 ? 'ring-ok' : 'ring-kcal')}</svg>`;
}
